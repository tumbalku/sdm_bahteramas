import { DocumentStatus } from "@prisma/client";
import type { ImportUserError } from "./types";

export const IMPORT_HEADERS = [
  "employeeId",
  "nik",
  "email",
  "password",
  "name",
  "role",
  "gender",
  "birthDate",
  "academicDegree",
  "lastEducation",
  "religion",
  "maritalStatus",
  "phone",
  "address",
  "joinDate",
  "employmentStatusName",
  "employeeGroupName",
  "professionGroupName",
  "employeePositionName",
  "employeeRankName",
  "workplaceName",
  "hasTmt",
  "tmtStartDate",
  "tmtEndDate",
] as const;

export const EXPORT_HEADERS = [
  ...IMPORT_HEADERS.filter((header) => header !== "password"),
  "createdAt",
] as const;

export const EMPLOYEE_DOCUMENT_EXPORT_HEADERS = [
  "Jenis Dokumen",
  "Kode Dokumen",
  "Kategori Arsip",
  "Status Upload",
  "Status Verifikasi",
  "Nomor Surat",
  "Tanggal Terbit",
  "Tanggal Kedaluwarsa",
  "Tanggal Upload",
  "Nama File",
  "Catatan Terakhir",
] as const;

export function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

export function emptyToNull(value?: string) {
  const trimmed = value?.trim() || "";
  return trimmed ? trimmed : null;
}

export function parseBoolean(value?: string): boolean {
  const normalized = normalizeKey(value || "");
  return ["true", "1", "yes", "ya", "y"].includes(normalized);
}

export function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseCsv(text: string): Record<string, string>[] {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });
}

export function escapeCsvValue(value: unknown) {
  const stringValue = value === null || value === undefined ? "" : String(value);
  const safeValue = /^[=+@]/.test(stringValue) || /^-.+/.test(stringValue)
    ? `\t${stringValue}`
    : stringValue;
  if (/[",\n\r]/.test(safeValue)) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }
  return safeValue;
}

export function toDateOnly(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function formatDateTimeForFileName(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

export function formatDocumentStatusLabel(status?: DocumentStatus | null) {
  if (status === DocumentStatus.APPROVED) return "Disetujui";
  if (status === DocumentStatus.REJECTED) return "Ditolak";
  if (status === DocumentStatus.PENDING) return "Menunggu";
  return "-";
}

export function createNameLookup<T extends { id: string; name: string }>(items: T[]) {
  const map = new Map<string, T>();
  items.forEach((item) => map.set(normalizeKey(item.name), item));
  return map;
}

export function validateCsvHeaders(rowsText: string): ImportUserError[] {
  const firstLine = rowsText.replace(/^\uFEFF/, "").split(/\r?\n/).find((line) => line.trim());
  if (!firstLine) {
    return [{ row: 1, message: "File CSV kosong" }];
  }

  const headers = parseCsvLine(firstLine);
  const missingHeaders = IMPORT_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    return [{ row: 1, message: `Header CSV tidak lengkap: ${missingHeaders.join(", ")}` }];
  }

  return [];
}
