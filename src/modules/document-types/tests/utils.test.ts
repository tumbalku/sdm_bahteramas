import { describe, expect, it } from "vitest";
import { DocumentArchiveCategory, DocumentStatus } from "@prisma/client";
import type { DocumentArchiveRecap, DocumentArchiveRow } from "../types";
import {
  buildDocumentArchiveCsvContent,
  escapeCsvValue,
  formatDateOnly,
  formatDateTimeForFileName,
  formatStatusLabel,
  getDocumentTypeFolderName,
  hasDateFilters,
  isWithinDateRange,
  rowPassesDocumentFilters,
  toEndOfDay,
  toStartOfDay,
} from "../utils";

function makeRow(overrides: Partial<DocumentArchiveRow> = {}): DocumentArchiveRow {
  return {
    key: "employee-1:type-1",
    uploadStatus: "UPLOADED",
    employee: {
      id: "employee-1",
      employeeId: "198501012010011001",
      name: "Budi Santoso",
      workplaceName: "Rawat Inap",
      professionGroupName: "Medis",
      employmentStatusName: "PNS",
      employeeGroupName: "ASN",
    },
    documentType: {
      id: "type-1",
      code: "KTP",
      name: "Kartu Tanda Penduduk",
      archiveCategory: DocumentArchiveCategory.UTAMA,
    },
    document: {
      id: "doc-1",
      fileName: "ktp.pdf",
      filePath: "KTP/ktp.pdf",
      documentNumber: "470/001",
      issueDate: new Date("2026-01-01T00:00:00.000Z"),
      expiryDate: new Date("2026-12-31T00:00:00.000Z"),
      uploadedAt: new Date("2026-07-04T00:00:00.000Z"),
      status: DocumentStatus.APPROVED,
      latestReviewNote: "Valid",
    },
    status: DocumentStatus.APPROVED,
    ...overrides,
  };
}

describe("document-types utils", () => {
  it("menormalisasi nama folder jenis dokumen", () => {
    expect(getDocumentTypeFolderName(" ktp ")).toBe("KTP");
    expect(getDocumentTypeFolderName("str dokter umum")).toBe("STR_DOKTER_UMUM");
    expect(getDocumentTypeFolderName("sip__v-2")).toBe("SIP_V-2");
  });

  it("membuat batas awal dan akhir hari UTC", () => {
    expect(toStartOfDay("2026-07-04")?.toISOString()).toBe("2026-07-04T00:00:00.000Z");
    expect(toEndOfDay("2026-07-04")?.toISOString()).toBe("2026-07-04T23:59:59.999Z");
    expect(toStartOfDay()).toBeNull();
    expect(toEndOfDay("tanggal")).toBeNull();
  });

  it("memeriksa tanggal dalam rentang", () => {
    const value = new Date("2026-07-04T12:00:00.000Z");

    expect(isWithinDateRange(value, toStartOfDay("2026-07-04"), toEndOfDay("2026-07-04"))).toBe(true);
    expect(isWithinDateRange(value, toStartOfDay("2026-07-05"), undefined)).toBe(false);
    expect(isWithinDateRange(value, undefined, toEndOfDay("2026-07-03"))).toBe(false);
    expect(isWithinDateRange(null, toStartOfDay("2026-07-04"), undefined)).toBe(false);
  });

  it("mendeteksi filter tanggal", () => {
    expect(hasDateFilters({})).toBe(false);
    expect(hasDateFilters({ issueDateFrom: "2026-07-04" })).toBe(true);
    expect(hasDateFilters({ expiryDateTo: "2026-07-04" })).toBe(true);
    expect(hasDateFilters({ uploadedAtFrom: "2026-07-04" })).toBe(true);
  });

  it("memformat tanggal, timestamp file, dan label status", () => {
    expect(formatDateOnly(new Date("2026-07-04T09:30:00.000Z"))).toBe("2026-07-04");
    expect(formatDateOnly(null)).toBe("");
    expect(formatDateTimeForFileName(new Date(2026, 6, 4, 9, 5))).toBe("20260704-0905");
    expect(formatStatusLabel(DocumentStatus.APPROVED)).toBe("Disetujui");
    expect(formatStatusLabel(DocumentStatus.REJECTED)).toBe("Ditolak");
    expect(formatStatusLabel(DocumentStatus.PENDING)).toBe("Menunggu");
    expect(formatStatusLabel(null)).toBe("Belum Upload");
  });

  it("melakukan escape value CSV", () => {
    expect(escapeCsvValue("Budi")).toBe("Budi");
    expect(escapeCsvValue("Budi, Santoso")).toBe("\"Budi, Santoso\"");
    expect(escapeCsvValue("Baris\nBaru")).toBe("\"Baris\nBaru\"");
    expect(escapeCsvValue("Dokumen \"Valid\"")).toBe("\"Dokumen \"\"Valid\"\"\"");
    expect(escapeCsvValue(null)).toBe("");
  });

  it("memfilter row rekap dokumen", () => {
    const row = makeRow();
    const missingRow = makeRow({ uploadStatus: "MISSING", document: null, status: null });

    expect(rowPassesDocumentFilters(row, {})).toBe(true);
    expect(rowPassesDocumentFilters(row, { uploadStatus: "MISSING" })).toBe(false);
    expect(rowPassesDocumentFilters(missingRow, { uploadStatus: "UPLOADED" })).toBe(false);
    expect(rowPassesDocumentFilters(row, { status: DocumentStatus.REJECTED })).toBe(false);
    expect(rowPassesDocumentFilters(row, { uploadedAtFrom: "2026-07-01", uploadedAtTo: "2026-07-31" })).toBe(true);
    expect(rowPassesDocumentFilters(row, { issueDateFrom: "2026-02-01" })).toBe(false);
    expect(rowPassesDocumentFilters(missingRow, { uploadedAtFrom: "2026-07-01" })).toBe(false);
  });

  it("membangun CSV rekap arsip dokumen", () => {
    const recap: DocumentArchiveRecap = {
      rows: [makeRow({ employee: { ...makeRow().employee, name: "Budi, Santoso" } })],
      stats: {
        totalRequired: 1,
        uploaded: 1,
        approved: 1,
        pending: 0,
        rejected: 0,
        missing: 0,
        percentage: 100,
        employeeCount: 1,
        documentTypeCount: 1,
      },
      generatedAt: "2026-07-04T00:00:00.000Z",
      filters: {},
    };

    const csv = buildDocumentArchiveCsvContent(recap);

    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("NIP,Nama Pegawai,Unit Kerja");
    expect(csv).toContain("\"Budi, Santoso\"");
    expect(csv).toContain("Sudah Upload,Disetujui");
  });
});
