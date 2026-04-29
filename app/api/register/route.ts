import { NextRequest, NextResponse } from "next/server";
import { unlockUser } from "@/lib/kv";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email } = body as { userId?: string; email?: string };

    if (!userId || typeof userId !== "string" || !userId.trim()) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await unlockUser(userId.trim(), email.trim().toLowerCase());

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
