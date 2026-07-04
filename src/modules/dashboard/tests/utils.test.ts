import { describe, expect, it } from "vitest";
import {
  addDays,
  buildDocumentUploadCharts,
  formatStatusLabel,
  getLastSixMonths,
  getMonthKey,
  getMonthLabel,
  mapGroupedItems,
  normalizeGenderLabel,
} from "../utils";

describe("dashboard month helpers", () => {
  it("getMonthKey menghasilkan format YYYY-MM", () => {
    expect(getMonthKey(new Date("2026-05-15T00:00:00.000Z"))).toBe("2026-05");
  });

  it("getMonthLabel memakai label bulan Indonesia", () => {
    expect(getMonthLabel(new Date(2026, 4, 1))).toBe("Mei 2026");
  });

  it("getLastSixMonths menghasilkan 6 bulan berurutan dan menangani pergantian tahun", () => {
    const months = getLastSixMonths(new Date(2026, 1, 10));

    expect(months.map((month) => month.key)).toEqual([
      "2025-09",
      "2025-10",
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
    ]);
  });

  it("addDays menambah hari dari reference date", () => {
    expect(addDays(30, new Date("2026-07-04T00:00:00.000Z")).toISOString().slice(0, 10)).toBe("2026-08-03");
  });
});

describe("dashboard grouping helpers", () => {
  it("mapGroupedItems memetakan, mengurutkan, dan memakai label tie-breaker", () => {
    const result = mapGroupedItems(
      [
        { name: "B", _count: { id: 2 } },
        { name: "A", _count: { id: 2 } },
        { name: "C", _count: { id: 3 } },
      ],
      (group) => group.name,
    );

    expect(result).toEqual([
      { label: "C", value: 3 },
      { label: "A", value: 2 },
      { label: "B", value: 2 },
    ]);
  });

  it("mapGroupedItems menggabungkan item di luar limit menjadi Lainnya", () => {
    const result = mapGroupedItems(
      [
        { name: "A", _count: { id: 5 } },
        { name: "B", _count: { id: 4 } },
        { name: "C", _count: { id: 3 } },
      ],
      (group) => group.name,
      2,
    );

    expect(result).toEqual([
      { label: "A", value: 5 },
      { label: "B", value: 4 },
      { label: "Lainnya", value: 3 },
    ]);
  });
});

describe("dashboard label helpers", () => {
  it("normalizeGenderLabel memetakan gender", () => {
    expect(normalizeGenderLabel("L")).toBe("Laki-laki");
    expect(normalizeGenderLabel("p")).toBe("Perempuan");
    expect(normalizeGenderLabel(null)).toBe("Belum Diisi");
    expect(normalizeGenderLabel("")).toBe("Belum Diisi");
  });

  it("formatStatusLabel memetakan status dokumen", () => {
    expect(formatStatusLabel("APPROVED")).toBe("Disetujui");
    expect(formatStatusLabel("REJECTED")).toBe("Ditolak");
    expect(formatStatusLabel("PENDING")).toBe("Menunggu");
    expect(formatStatusLabel("OTHER")).toBe("Menunggu");
  });
});

describe("dashboard upload chart helpers", () => {
  it("buildDocumentUploadCharts membuat 6 bulan, fallback name, mengabaikan upload lama, dan menghitung trend", () => {
    const result = buildDocumentUploadCharts(
      [
        { uploadedAt: new Date(2026, 1, 1), documentType: { code: "KTP", name: "KTP" } },
        { uploadedAt: new Date(2026, 1, 2), documentType: { code: "", name: "Ijazah" } },
        { uploadedAt: new Date(2025, 7, 1), documentType: { code: "OLD", name: "Old" } },
      ],
      new Date(2026, 1, 10),
    );

    expect(result.byType).toHaveLength(6);
    expect(result.byType[5]).toMatchObject({ month: "Feb 2026", KTP: 1, Ijazah: 1, OLD: 0 });
    expect(result.trend[5]).toEqual({ month: "Feb 2026", total: 2 });
    expect(result.chartKeys).toEqual(["Ijazah", "KTP", "OLD"]);
  });

  it("buildDocumentUploadCharts mempertahankan top 8 dan menggabungkan sisanya sebagai Lainnya", () => {
    const uploads = Array.from({ length: 9 }, (_, index) => ({
      uploadedAt: new Date(2026, 6, 1),
      documentType: { code: `DOC${index + 1}`, name: `Document ${index + 1}` },
    }));

    const result = buildDocumentUploadCharts(uploads, new Date(2026, 6, 4));

    expect(result.chartKeys).toHaveLength(9);
    expect(result.chartKeys).toContain("Lainnya");
    expect(result.byType[5].Lainnya).toBe(1);
  });
});
