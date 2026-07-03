export function getContentTypeFromPath(fileName: string) {
  const lowerFileName = fileName.toLowerCase();

  if (lowerFileName.endsWith(".pdf")) return "application/pdf";
  if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) return "image/jpeg";
  if (lowerFileName.endsWith(".png")) return "image/png";
  if (lowerFileName.endsWith(".webp")) return "image/webp";
  if (lowerFileName.endsWith(".csv")) return "text/csv; charset=utf-8";

  return "application/octet-stream";
}
