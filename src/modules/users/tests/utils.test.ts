import { describe, expect, it } from "vitest";
import { DocumentStatus } from "@prisma/client";
import {
  createNameLookup,
  emptyToNull,
  escapeCsvValue,
  formatDateTimeForFileName,
  formatDocumentStatusLabel,
  isValidDateString,
  normalizeKey,
  parseBoolean,
  parseCsv,
  parseCsvLine,
  toDateOnly,
} from "../utils";

describe("users csv helpers", () => {
  it("parseCsvLine membaca baris sederhana", () => {
    expect(parseCsvLine("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("parseCsvLine membaca quoted value yang berisi koma", () => {
    expect(parseCsvLine('pegawai,"Budi, Santoso",aktif')).toEqual(["pegawai", "Budi, Santoso", "aktif"]);
  });

  it("parseCsvLine membaca escaped quote di dalam quoted value", () => {
    expect(parseCsvLine('"Budi ""Dokter"" Santoso",aktif')).toEqual(['Budi "Dokter" Santoso', "aktif"]);
  });

  it("parseCsv menghapus BOM, menangani newline, dan mengabaikan baris kosong", () => {
    const csv = "\uFEFFname,email\r\nBudi,budi@smdp.test\r\n\r\nSiti,siti@smdp.test\n";

    expect(parseCsv(csv)).toEqual([
      { name: "Budi", email: "budi@smdp.test" },
      { name: "Siti", email: "siti@smdp.test" },
    ]);
  });

  it("escapeCsvValue mengosongkan null dan undefined", () => {
    expect(escapeCsvValue(null)).toBe("");
    expect(escapeCsvValue(undefined)).toBe("");
  });

  it("escapeCsvValue membungkus nilai yang mengandung koma, quote, atau newline", () => {
    expect(escapeCsvValue('Budi, "Santoso"\nAktif')).toBe('"Budi, ""Santoso""\nAktif"');
  });

  it("escapeCsvValue menambahkan prefix tab untuk risiko formula injection", () => {
    expect(escapeCsvValue("=SUM(A1:A2)")).toBe("\t=SUM(A1:A2)");
    expect(escapeCsvValue("+cmd")).toBe("\t+cmd");
    expect(escapeCsvValue("@link")).toBe("\t@link");
    expect(escapeCsvValue("-10")).toBe("\t-10");
  });
});

describe("users normalization helpers", () => {
  it("normalizeKey melakukan trim dan lowercase", () => {
    expect(normalizeKey("  PNS  ")).toBe("pns");
  });

  it("emptyToNull mengubah string kosong menjadi null dan mempertahankan nilai", () => {
    expect(emptyToNull("   ")).toBeNull();
    expect(emptyToNull("  isi  ")).toBe("isi");
  });

  it("parseBoolean menerima variasi true dan menolak nilai lain", () => {
    ["true", "1", "yes", "ya", "y"].forEach((value) => {
      expect(parseBoolean(value)).toBe(true);
    });
    expect(parseBoolean("tidak")).toBe(false);
    expect(parseBoolean()).toBe(false);
  });
});

describe("users date and label helpers", () => {
  it("isValidDateString menerima format YYYY-MM-DD valid", () => {
    expect(isValidDateString("2026-07-04")).toBe(true);
  });

  it("isValidDateString menolak format selain YYYY-MM-DD", () => {
    expect(isValidDateString("04-07-2026")).toBe(false);
  });

  it("toDateOnly mengubah Date atau ISO string menjadi YYYY-MM-DD", () => {
    expect(toDateOnly(new Date("2026-07-04T10:30:00.000Z"))).toBe("2026-07-04");
    expect(toDateOnly("2026-07-04T10:30:00.000Z")).toBe("2026-07-04");
  });

  it("formatDateTimeForFileName membuat timestamp untuk nama file", () => {
    expect(formatDateTimeForFileName(new Date("2026-07-04T03:05:00"))).toMatch(/^20260704-\d{4}$/);
  });

  it("formatDocumentStatusLabel memetakan status dokumen", () => {
    expect(formatDocumentStatusLabel(DocumentStatus.APPROVED)).toBe("Disetujui");
    expect(formatDocumentStatusLabel(DocumentStatus.REJECTED)).toBe("Ditolak");
    expect(formatDocumentStatusLabel(DocumentStatus.PENDING)).toBe("Menunggu");
    expect(formatDocumentStatusLabel(null)).toBe("-");
  });
});

describe("users lookup helpers", () => {
  it("createNameLookup membuat lookup case-insensitive berdasarkan name", () => {
    const item = { id: "status-1", name: "  PNS  " };
    const lookup = createNameLookup([item]);

    expect(lookup.get("pns")).toEqual(item);
  });
});
