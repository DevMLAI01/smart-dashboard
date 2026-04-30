export async function parsePdf(buffer: Buffer): Promise<string> {
  // Polyfill browser APIs that pdfjs-dist requires in non-browser environments
  if (typeof globalThis.DOMMatrix === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).DOMMatrix = class DOMMatrix {};
  }
  // pdf-parse v2.x exports a class (PDFParse), not a callable function
  const { PDFParse } = require("pdf-parse");
  const parser = new PDFParse({ data: buffer, verbosity: 0 });
  const result = await parser.getText();
  await parser.destroy();
  return result.text as string;
}
