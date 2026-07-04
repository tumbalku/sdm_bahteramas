import { DocumentStatus } from "@prisma/client";
import type { DocumentArchiveFilter, DocumentArchiveRecap, DocumentArchiveRow } from "./types";

export function getDocumentTypeFolderName(docCode: string) {
  return docCode
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
}

export function toStartOfDay(date?: string) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toEndOfDay(date?: string) {
  if (!date) return null;
  const parsed = new Date(`${date}T23:59:59.999Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isWithinDateRange(value: Date | null | undefined, from?: Date | null, to?: Date | null) {
  if (!from && !to) return true;
  if (!value) return false;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

export function hasDateFilters(filters: DocumentArchiveFilter) {
  return Boolean(
    filters.issueDateFrom ||
      filters.issueDateTo ||
      filters.expiryDateFrom ||
      filters.expiryDateTo ||
      filters.uploadedAtFrom ||
      filters.uploadedAtTo
  );
}

export function formatDateOnly(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function formatDateTimeForFileName(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

export function formatStatusLabel(status?: DocumentStatus | null) {
  if (status === DocumentStatus.APPROVED) return "Disetujui";
  if (status === DocumentStatus.REJECTED) return "Ditolak";
  if (status === DocumentStatus.PENDING) return "Menunggu";
  return "Belum Upload";
}

export function escapeCsvValue(value: unknown) {
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function rowPassesDocumentFilters(row: DocumentArchiveRow, filters: DocumentArchiveFilter) {
  if (filters.uploadStatus && row.uploadStatus !== filters.uploadStatus) return false;
  if (filters.status && row.status !== filters.status) return false;

  if (hasDateFilters(filters)) {
    if (!row.document) return false;

    if (!isWithinDateRange(row.document.issueDate, toStartOfDay(filters.issueDateFrom), toEndOfDay(filters.issueDateTo))) {
      return false;
    }
    if (!isWithinDateRange(row.document.expiryDate, toStartOfDay(filters.expiryDateFrom), toEndOfDay(filters.expiryDateTo))) {
      return false;
    }
    if (!isWithinDateRange(row.document.uploadedAt, toStartOfDay(filters.uploadedAtFrom), toEndOfDay(filters.uploadedAtTo))) {
      return false;
    }
  }

  return true;
}

export function buildDocumentArchiveCsvContent(recap: DocumentArchiveRecap) {
  const headers = [
    "NIP",
    "Nama Pegawai",
    "Unit Kerja",
    "Profesi",
    "Status Kepegawaian",
    "Jenis Pegawai",
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
  ];

  const dataRows = recap.rows.map((row) => {
    const values = [
      row.employee.employeeId,
      row.employee.name,
      row.employee.workplaceName,
      row.employee.professionGroupName,
      row.employee.employmentStatusName,
      row.employee.employeeGroupName,
      row.documentType.name,
      row.documentType.code,
      row.documentType.archiveCategory,
      row.uploadStatus === "UPLOADED" ? "Sudah Upload" : "Belum Upload",
      formatStatusLabel(row.status),
      row.document?.documentNumber,
      formatDateOnly(row.document?.issueDate),
      formatDateOnly(row.document?.expiryDate),
      formatDateOnly(row.document?.uploadedAt),
      row.document?.fileName,
      row.document?.latestReviewNote,
    ];

    return values.map(escapeCsvValue).join(",");
  });

  return `\uFEFF${[
    headers.map(escapeCsvValue).join(","),
    ...dataRows,
  ].join("\n")}`;
}
