import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { extractDashboardData } from "@/lib/openrouter";
import { saveDashboard, getUsageCount, incrementUsage, isUnlocked, FREE_LIMIT } from "@/lib/kv";
import { parsePdf } from "@/lib/parsers/pdf";
import { parseWord } from "@/lib/parsers/word";
import { parseExcel } from "@/lib/parsers/excel";
import { prepareImage } from "@/lib/parsers/image";
import { DashboardData, Student } from "@/lib/types";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

function safeScores(s: Student): number[] {
  if (!s.scores || typeof s.scores !== "object") return [];
  return Object.values(s.scores).filter((v) => typeof v === "number");
}

function normalizeStudents(students: Student[]): Student[] {
  return (students || []).map((s) => ({
    ...s,
    scores: s.scores && typeof s.scores === "object" ? s.scores : {},
  }));
}

function computeMeta(students: Student[]) {
  if (students.length === 0) {
    return { totalStudents: 0, averageScore: 0, passRate: 0, documentType: "mixed" as const };
  }

  const allScores = students.flatMap(safeScores);
  const avg =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  const passCount = students.filter((s) => {
    const scores = safeScores(s);
    if (scores.length === 0) return false;
    return scores.reduce((a, b) => a + b, 0) / scores.length >= 50;
  }).length;

  const hasAttendance = students.some((s) => s.attendance !== undefined);
  const hasScores = students.some((s) => safeScores(s).length > 0);

  const documentType: "mixed" | "attendance" | "marksheet" =
    hasScores && hasAttendance ? "mixed" : hasAttendance ? "attendance" : "marksheet";

  return {
    totalStudents: students.length,
    averageScore: avg,
    passRate: Math.round((passCount / students.length) * 100),
    documentType,
  };
}

export async function POST(req: NextRequest) {
  // ---- Usage gate ----
  const userId = req.headers.get("X-Smart-UID") ?? "";

  if (userId) {
    const [unlocked, count] = await Promise.all([
      isUnlocked(userId),
      getUsageCount(userId),
    ]);

    if (!unlocked && count >= FREE_LIMIT) {
      return NextResponse.json(
        { error: "limit_reached", usageCount: count },
        { status: 429 }
      );
    }
  }
  // ---- End gate ----

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 20 MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type;
    const name = file.name;
    const ext = name.split(".").pop()?.toLowerCase() ?? "";

    let extracted: Awaited<ReturnType<typeof extractDashboardData>>;

    if (mime === "application/pdf" || ext === "pdf") {
      const text = await parsePdf(buffer);
      extracted = await extractDashboardData(text, name);
    } else if (
      mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx" ||
      ext === "doc"
    ) {
      const text = await parseWord(buffer);
      extracted = await extractDashboardData(text, name);
    } else if (
      mime ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mime === "application/vnd.ms-excel" ||
      ext === "xlsx" ||
      ext === "xls"
    ) {
      const text = parseExcel(buffer);
      extracted = await extractDashboardData(text, name);
    } else if (mime === "text/csv" || ext === "csv" || mime === "text/plain" || ext === "txt") {
      const text = buffer.toString("utf-8");
      extracted = await extractDashboardData(text, name);
    } else if (
      mime === "image/png" ||
      mime === "image/jpeg" ||
      ["png", "jpg", "jpeg"].includes(ext)
    ) {
      const imageContent = prepareImage(buffer, mime || `image/${ext}`);
      extracted = await extractDashboardData(imageContent, name);
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: ${mime || ext}` },
        { status: 400 }
      );
    }

    const id = nanoid(10);
    const students = normalizeStudents(extracted.students);
    const data: DashboardData = {
      id,
      title: extracted.title,
      uploadedAt: new Date().toISOString(),
      subjects: extracted.subjects || [],
      students,
      meta: computeMeta(students),
    };

    await saveDashboard(data);

    // Increment usage count; fire-and-forget so a Redis blip doesn't fail the response
    if (userId) {
      incrementUsage(userId).catch((e) => console.error("[usage increment]", e));
    }

    return NextResponse.json({ id });
  } catch (err) {
    console.error("[upload]", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 60;
