import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parsing string format file "pdf,jpg,png" menjadi array ["pdf", "jpg", "png"]
 */
export function parseAllowedFormats(formatsStr: string): string[] {
  if (!formatsStr) return [];
  return formatsStr
    .split(",")
    .map((f) => f.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Sanitasi nama file agar aman di filesystem (hanya mengizinkan huruf, angka, titik, strip, underscore)
 */
export function slugifyFileName(fileName: string): string {
  const ext = fileName.substring(fileName.lastIndexOf("."));
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));

  const cleanName = nameWithoutExt
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");

  return `${cleanName}${ext.toLowerCase()}`;
}
