import { describe, expect, it } from "vitest";
import { DocumentArchiveCategory, DocumentStatus } from "@prisma/client";
import {
  createDocumentTypeSchema,
  documentArchiveFilterSchema,
  updateDocumentTypeSchema,
} from "../validation";

const validCreatePayload = {
  code: " ktp ",
  name: " Kartu Tanda Penduduk ",
  archiveCategory: DocumentArchiveCategory.UTAMA,
  allowedFormats: "pdf,jpg,png",
  maxSizeMb: 5,
};

describe("document-types validation", () => {
  describe("createDocumentTypeSchema", () => {
    it("menerima payload valid dan menormalisasi field dasar", () => {
      const result = createDocumentTypeSchema.safeParse(validCreatePayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject({
          code: "KTP",
          name: "Kartu Tanda Penduduk",
          isMandatory: false,
          requiresExpiryDate: false,
          requiresIssueDate: false,
          requiresDocumentNumber: false,
          professionGroupIds: [],
          employmentStatusIds: [],
          employeeGroupIds: [],
          employeeRankIds: [],
          workplaceIds: [],
        });
      }
    });

    it("menerima kategori KONDISIONAL dan PROFESI", () => {
      expect(createDocumentTypeSchema.safeParse({
        ...validCreatePayload,
        archiveCategory: DocumentArchiveCategory.KONDISIONAL,
      }).success).toBe(true);
      expect(createDocumentTypeSchema.safeParse({
        ...validCreatePayload,
        archiveCategory: DocumentArchiveCategory.PROFESI,
      }).success).toBe(true);
    });

    it("menolak field wajib yang tidak valid", () => {
      const result = createDocumentTypeSchema.safeParse({
        ...validCreatePayload,
        code: "A",
        name: "AB",
        allowedFormats: "",
        maxSizeMb: 101,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.code).toContain("Kode dokumen minimal 2 karakter");
        expect(errors.name).toContain("Nama dokumen minimal 3 karakter");
        expect(errors.allowedFormats).toContain("Format file diizinkan wajib diisi (contoh: pdf,jpg,png)");
        expect(errors.maxSizeMb).toContain("Ukuran file maksimal 100 MB");
      }
    });

    it("menolak kategori arsip invalid dan maxSizeMb bukan angka", () => {
      const result = createDocumentTypeSchema.safeParse({
        ...validCreatePayload,
        archiveCategory: "LAINNYA",
        maxSizeMb: "besar",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.archiveCategory).toContain("Kategori arsip tidak valid");
        expect(errors.maxSizeMb).toContain("Batas ukuran harus berupa angka");
      }
    });

    it("menolak maxSizeMb kurang dari batas minimum", () => {
      const result = createDocumentTypeSchema.safeParse({
        ...validCreatePayload,
        maxSizeMb: 0,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.maxSizeMb).toContain("Ukuran file minimal 10 KB");
      }
    });
  });

  describe("updateDocumentTypeSchema", () => {
    it("menerima payload partial dan payload kosong", () => {
      expect(updateDocumentTypeSchema.safeParse({ name: " Ijazah " }).success).toBe(true);
      expect(updateDocumentTypeSchema.safeParse({}).success).toBe(true);
    });

    it("tetap menjalankan transform dan validasi pada field yang dikirim", () => {
      const valid = updateDocumentTypeSchema.safeParse({ code: " str " });
      const invalid = updateDocumentTypeSchema.safeParse({ maxSizeMb: 101 });

      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.code).toBe("STR");
      }
      expect(invalid.success).toBe(false);
    });
  });

  describe("documentArchiveFilterSchema", () => {
    it("menerima filter kosong, enum valid, dan trim search", () => {
      const result = documentArchiveFilterSchema.safeParse({
        search: " Budi ",
        archiveCategory: DocumentArchiveCategory.UTAMA,
        status: DocumentStatus.APPROVED,
        uploadStatus: "UPLOADED",
        uploadedAtFrom: "2026-07-04",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe("Budi");
      }
    });

    it("menolak enum dan format tanggal invalid", () => {
      const result = documentArchiveFilterSchema.safeParse({
        archiveCategory: "LAINNYA",
        status: "DONE",
        uploadStatus: "ALL",
        issueDateFrom: "04-07-2026",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.archiveCategory).toBeTruthy();
        expect(errors.status).toBeTruthy();
        expect(errors.uploadStatus).toBeTruthy();
        expect(errors.issueDateFrom).toContain("Format tanggal harus YYYY-MM-DD");
      }
    });
  });
});
