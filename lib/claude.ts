import Anthropic from "@anthropic-ai/sdk";
import { DashboardData } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export async function extractDashboardData(
  content: string | { type: "image"; data: string; mediaType: string },
  filename: string
): Promise<Omit<DashboardData, "id" | "uploadedAt" | "meta">> {
  const userMessage =
    typeof content === "string"
      ? `Document filename: ${filename}\n\nDocument content:\n${content}`
      : `Document filename: ${filename}\n\nThis is an image of a student document. Extract all student data visible.`;

  const messageContent =
    typeof content === "string"
      ? [{ type: "text" as const, text: userMessage }]
      : [
          {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: content.mediaType as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image/webp",
              data: content.data,
            },
          },
          {
            type: "text" as const,
            text: `Document filename: ${filename}\n\nExtract all student performance data from this image.`,
          },
        ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: messageContent }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const parsed = JSON.parse(text.trim());

  return {
    title: parsed.title || filename,
    subjects: parsed.subjects || [],
    students: parsed.students || [],
  };
}
