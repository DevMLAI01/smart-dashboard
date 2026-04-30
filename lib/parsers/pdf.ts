export async function parsePdf(buffer: Buffer): Promise<string> {
  // Polyfill browser APIs that pdfjs-dist requires in non-browser environments
  if (typeof globalThis.DOMMatrix === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).DOMMatrix = class DOMMatrix {};
  }
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text as string;
}
