export function prepareImage(
  buffer: Buffer,
  mimeType: string
): { type: "image"; data: string; mediaType: string } {
  return {
    type: "image",
    data: buffer.toString("base64"),
    mediaType: mimeType,
  };
}
