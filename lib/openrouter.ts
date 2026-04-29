import { DashboardData } from "./types";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";
// Text models tried in order — first available and non-rate-limited wins
const TEXT_MODELS = [
  "meta-llama/llama-3.3-70b-instruct", // free, GPT-4 level, most reliable
  "deepseek/deepseek-chat",             // cheap, excellent reasoning (rate-limited at peak)
  "qwen/qwen-2.5-72b-instruct",        // free fallback
];
// Vision model for image files
const VISION_MODEL = "meta-llama/llama-3.2-11b-vision-instruct";

// Leave 5s buffer before Vercel's 60s function timeout so we return a clean error
const FETCH_TIMEOUT_MS = 55_000;

const SYSTEM_PROMPT = `You are a data extraction engine for student performance documents.
Your job is to extract structured data from any kind of student record — mark sheets, attendance records, grade reports, or mixed documents — and return it as valid JSON.

Return ONLY a raw JSON object with no markdown, no code fences, no explanation. The JSON must match this exact schema:
{
  "title": "string — infer a meaningful title from the document (e.g. 'Q1 Marks — Python Batch 2024')",
  "subjects": ["array of subject/module names found in the document"],
  "documentType": "marksheet | attendance | mixed",
  "students": [
    {
      "name": "student full name",
      "id": "student ID if present, otherwise omit",
      "scores": { "SubjectName": numericScore },
      "attendance": numericPercentage (0-100, omit if not available),
      "grade": "letter grade if present, otherwise omit"
    }
  ]
}

Rules:
- scores values must be numbers (not strings)
- attendance must be a number 0-100 (not a string like "85%")
- If a field is missing or unknown, omit it entirely (do not use null)
- Normalise subject names to title case
- If the document has no student data, return students: []
- Never invent data that is not in the document`;

type ContentInput =
  | string
  | { type: "image"; data: string; mediaType: string };

function getHeaders(): Record<string, string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": "https://smart-dashboard-dusky.vercel.app",
    "X-Title": "Smart Dashboard",
  };
}

async function callOpenRouter(
  model: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: Record<string, any>
): Promise<{ ok: boolean; rateLimited: boolean; text: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(OPENROUTER_BASE, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ ...body, model }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("AI processing timed out. Please try a smaller file or try again.");
    }
    throw err;
  }
  clearTimeout(timer);

  const text = await res.text();
  return { ok: res.ok, rateLimited: res.status === 429, text };
}

export async function extractDashboardData(
  content: ContentInput,
  filename: string
): Promise<Omit<DashboardData, "id" | "uploadedAt" | "meta">> {
  const isImage = typeof content !== "string";
  const models = isImage ? [VISION_MODEL] : TEXT_MODELS;

  let userContent: unknown[];

  if (typeof content === "string") {
    userContent = [
      {
        type: "text",
        text: `Document filename: ${filename}\n\nDocument content:\n${content}`,
      },
    ];
  } else {
    userContent = [
      {
        type: "image_url",
        image_url: {
          url: `data:${content.mediaType};base64,${content.data}`,
        },
      },
      {
        type: "text",
        text: `Document filename: ${filename}\n\nExtract all student performance data from this image.`,
      },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  };

  // response_format is only reliable for text models; vision models ignore or reject it
  if (!isImage) {
    body.response_format = { type: "json_object" };
  }

  let lastError = "";
  for (const model of models) {
    const { ok, rateLimited, text } = await callOpenRouter(model, body);

    if (rateLimited) {
      console.warn(`[openrouter] ${model} rate-limited, trying next model`);
      lastError = text;
      continue;
    }

    if (!ok) {
      throw new Error(`OpenRouter error: ${text}`);
    }

    const json = JSON.parse(text);
    const raw: string = json.choices?.[0]?.message?.content ?? "";

    // Strip markdown code fences that some models wrap their JSON output in
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      title: parsed.title || filename,
      subjects: parsed.subjects || [],
      students: parsed.students || [],
    };
  }

  throw new Error(`All AI models are currently rate-limited. Please try again in a moment. (${lastError})`);
}
