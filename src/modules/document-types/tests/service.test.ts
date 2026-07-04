import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentArchiveCategory, DocumentStatus, Role } from "@prisma/client";
import { logActivity } from "@/lib/security-log";
import { getStorageProvider } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import * as repo from "../repository";
import type { AuthUser } from "@/lib/auth-utils";
import type { DocumentTypeRecord } from "../types";
import {
  createDocumentTypeService,
  deleteDocumentTypeService,
  exportDocumentArchiveRecapService,
  getAllDocumentTypes,
  getDocumentArchiveRecapService,
  getDocumentTypeById,
  isDocumentTypeApplicableToUser,
  updateDocumentTypeService,
} from "../service";

vi.mock("@/lib/security-log", () => ({
  logActivity: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({
  getStorageProvider: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../repository", () => ({
  findManyDocumentTypes: vi.fn(),
  findDocumentTypeById: vi.fn(),
  findDocumentTypeByCode: vi.fn(),
  createDocumentType: vi.fn(),
  updateDocumentType: vi.fn(),
  deleteDocumentType: vi.fn(),
  findArchiveEmployees: vi.fn(),
  findMandatoryArchiveDocumentTypes: vi.fn(),
  findArchiveDocuments: vi.fn(),
  findUploadedArchiveDocuments: vi.fn(),
}));

const actor: AuthUser = {
  id: "admin-1",
  employeeId: "ADMIN001",
  email: "admin@smdp.test",
  name: "Admin SMDP",
  role: Role.ADMIN,
};

const storage = {
  ensureFolder: vi.fn(),
};

function makeDocumentType(overrides: Partial<DocumentTypeRecord> = {}): DocumentTypeRecord {
  return {
    id: "type-1",
    code: "KTP",
    name: "Kartu Tanda Penduduk",
    description: null,
    archiveCategory: DocumentArchiveCategory.UTAMA,
    isMandatory: true,
    requiresExpiryDate: false,
    requiresIssueDate: false,
    requiresDocumentNumber: false,
    allowedFormats: "pdf,jpg,png",
    maxSizeMb: 5,
    icon: null,
    createdAt: new Date("2026-07-04T00:00:00.000Z"),
    updatedAt: new Date("2026-07-04T00:00:00.000Z"),
    targetProfessions: [],
    targetStatuses: [],
    targetGroups: [],
    targetRanks: [],
    targetWorkplaces: [],
    ...overrides,
  };
}

function makeEmployee(overrides: Record<string, unknown> = {}) {
  return {
    id: "employee-1",
    employeeId: "198501012010011001",
    name: "Budi Santoso",
    avatarUrl: null,
    employmentStatusId: "status-1",
    employeeGroupId: "group-1",
    professionGroupId: "profession-1",
    employeePositionId: "position-1",
    employeeRankId: "rank-1",
    workplaceId: "workplace-1",
    employmentStatus: { name: "PNS" },
    employeeGroup: { name: "ASN" },
    professionGroup: { name: "Medis" },
    employeePosition: { name: "Dokter" },
    employeeRank: { name: "III/a" },
    workplace: { name: "Rawat Inap" },
    ...overrides,
  };
}

describe("document-types service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-04T09:05:00.000Z"));
    vi.mocked(getStorageProvider).mockReturnValue(storage as never);
    vi.mocked(logActivity).mockResolvedValue(undefined);
    storage.ensureFolder.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("isDocumentTypeApplicableToUser", () => {
    it("menganggap document type tanpa target berlaku untuk semua user", () => {
      expect(isDocumentTypeApplicableToUser(makeDocumentType(), null)).toBe(true);
      expect(isDocumentTypeApplicableToUser(makeDocumentType(), makeEmployee())).toBe(true);
    });

    it("mewajibkan semua target yang diisi cocok dengan profil user", () => {
      const docType = makeDocumentType({
        targetStatuses: [{ id: "status-1", name: "PNS" }],
        targetGroups: [{ id: "group-1", name: "ASN" }],
        targetProfessions: [{ id: "profession-1", name: "Medis" }],
        targetRanks: [{ id: "rank-1", name: "III/a" }],
        targetWorkplaces: [{ id: "workplace-1", name: "Rawat Inap" }],
      });

      expect(isDocumentTypeApplicableToUser(docType, makeEmployee())).toBe(true);
      expect(isDocumentTypeApplicableToUser(docType, makeEmployee({ workplaceId: "other" }))).toBe(false);
      expect(isDocumentTypeApplicableToUser(docType, makeEmployee({ professionGroupId: null }))).toBe(false);
    });
  });

  describe("basic CRUD service", () => {
    it("getAllDocumentTypes mengembalikan data repository tanpa filter user", async () => {
      const types = [makeDocumentType()];
      vi.mocked(repo.findManyDocumentTypes).mockResolvedValue(types);

      await expect(getAllDocumentTypes({ category: DocumentArchiveCategory.UTAMA })).resolves.toBe(types);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("getAllDocumentTypes memfilter jenis dokumen applicable untuk user", async () => {
      vi.mocked(repo.findManyDocumentTypes).mockResolvedValue([
        makeDocumentType({ id: "type-1", targetWorkplaces: [{ id: "workplace-1", name: "Rawat Inap" }] }),
        makeDocumentType({ id: "type-2", targetWorkplaces: [{ id: "workplace-2", name: "IGD" }] }),
      ]);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        employmentStatusId: null,
        employeeGroupId: null,
        professionGroupId: null,
        employeeRankId: null,
        workplaceId: "workplace-1",
      } as never);

      const result = await getAllDocumentTypes({ forUser: true }, { ...actor, id: "employee-1", role: Role.EMPLOYEE });

      expect(result.map((item) => item.id)).toEqual(["type-1"]);
      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "employee-1" },
      }));
    });

    it("getDocumentTypeById meneruskan hasil repository", async () => {
      const docType = makeDocumentType();
      vi.mocked(repo.findDocumentTypeById).mockResolvedValue(docType);

      await expect(getDocumentTypeById("type-1")).resolves.toBe(docType);
      expect(repo.findDocumentTypeById).toHaveBeenCalledWith("type-1");
    });

    it("createDocumentTypeService menolak kode duplikat", async () => {
      vi.mocked(repo.findDocumentTypeByCode).mockResolvedValue(makeDocumentType());

      await expect(createDocumentTypeService({
        code: "ktp",
        name: "Kartu Tanda Penduduk",
        archiveCategory: DocumentArchiveCategory.UTAMA,
        allowedFormats: "pdf",
        maxSizeMb: 5,
      }, actor)).rejects.toThrow("Kode jenis dokumen 'KTP' sudah digunakan");
      expect(repo.createDocumentType).not.toHaveBeenCalled();
    });

    it("createDocumentTypeService membuat folder, data, dan audit", async () => {
      const created = makeDocumentType();
      vi.mocked(repo.findDocumentTypeByCode).mockResolvedValue(null);
      vi.mocked(repo.createDocumentType).mockResolvedValue(created);

      const result = await createDocumentTypeService({
        code: "str dokter",
        name: "Surat Tanda Registrasi",
        archiveCategory: DocumentArchiveCategory.PROFESI,
        allowedFormats: "pdf",
        maxSizeMb: 5,
      }, actor);

      expect(storage.ensureFolder).toHaveBeenCalledWith("STR_DOKTER");
      expect(repo.createDocumentType).toHaveBeenCalledWith(expect.objectContaining({
        code: "STR DOKTER",
        isMandatory: false,
      }));
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        eventType: "DOCUMENT_TYPE_CREATED",
        resource: "/api/v1/document-types/type-1",
        status: "success",
      }));
      expect(result).toBe(created);
    });

    it("updateDocumentTypeService menangani not found, duplicate code, dan update sukses", async () => {
      vi.mocked(repo.findDocumentTypeById).mockResolvedValueOnce(null);
      await expect(updateDocumentTypeService("missing", { name: "Baru" }, actor)).rejects.toThrow("Jenis dokumen tidak ditemukan");

      vi.mocked(repo.findDocumentTypeById).mockResolvedValueOnce(makeDocumentType());
      vi.mocked(repo.findDocumentTypeByCode).mockResolvedValueOnce(makeDocumentType({ id: "other", code: "STR" }));
      await expect(updateDocumentTypeService("type-1", { code: "str" }, actor)).rejects.toThrow("Kode jenis dokumen 'STR' sudah digunakan");

      const updated = makeDocumentType({ code: "STR", name: "Surat Tanda Registrasi" });
      vi.mocked(repo.findDocumentTypeById).mockResolvedValueOnce(makeDocumentType());
      vi.mocked(repo.findDocumentTypeByCode).mockResolvedValueOnce(null);
      vi.mocked(repo.updateDocumentType).mockResolvedValueOnce(updated);

      const result = await updateDocumentTypeService("type-1", { code: "str", name: "Surat Tanda Registrasi" }, actor);

      expect(storage.ensureFolder).toHaveBeenCalledWith("STR");
      expect(repo.updateDocumentType).toHaveBeenCalledWith("type-1", expect.objectContaining({ code: "STR" }));
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({ eventType: "DOCUMENT_TYPE_UPDATED" }));
      expect(result).toBe(updated);
    });

    it("deleteDocumentTypeService menghapus data dan mencatat audit", async () => {
      vi.mocked(repo.findDocumentTypeById).mockResolvedValue(makeDocumentType());
      vi.mocked(repo.deleteDocumentType).mockResolvedValue(true);

      await expect(deleteDocumentTypeService("type-1", actor)).resolves.toBe(true);
      expect(repo.deleteDocumentType).toHaveBeenCalledWith("type-1");
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        eventType: "DOCUMENT_TYPE_DELETED",
        resource: "/api/v1/document-types/type-1",
      }));
    });
  });

  describe("archive recap service", () => {
    it("menghasilkan row uploaded/missing dan menghitung statistik", async () => {
      vi.mocked(repo.findArchiveEmployees).mockResolvedValue([
        makeEmployee({ id: "employee-1" }),
        makeEmployee({ id: "employee-2" }),
      ] as never);
      vi.mocked(repo.findMandatoryArchiveDocumentTypes).mockResolvedValue([
        makeDocumentType({ id: "type-1", code: "KTP" }),
        makeDocumentType({ id: "type-2", code: "STR", targetWorkplaces: [{ id: "workplace-2", name: "IGD" }] }),
      ]);
      vi.mocked(repo.findArchiveDocuments).mockResolvedValue([
        {
          id: "doc-1",
          ownerId: "employee-1",
          documentTypeId: "type-1",
          fileName: "ktp.pdf",
          filePath: "KTP/ktp.pdf",
          documentNumber: "470/001",
          issueDate: new Date("2026-01-01T00:00:00.000Z"),
          expiryDate: null,
          uploadedAt: new Date("2026-07-04T00:00:00.000Z"),
          updatedAt: new Date("2026-07-04T00:00:00.000Z"),
          status: DocumentStatus.APPROVED,
          verificationHistories: [{ reviewNote: "Valid" }],
        },
      ] as never);

      const result = await getDocumentArchiveRecapService();

      expect(repo.findArchiveDocuments).toHaveBeenCalledWith(["employee-1", "employee-2"], ["type-1", "type-2"]);
      expect(result.rows).toHaveLength(2);
      expect(result.stats).toMatchObject({
        totalRequired: 2,
        uploaded: 1,
        approved: 1,
        missing: 1,
        percentage: 50,
        employeeCount: 2,
        documentTypeCount: 1,
      });
      expect(result.rows[0].document?.latestReviewNote).toBe("Valid");
    });

    it("menerapkan filter upload status, status verifikasi, dan tanggal", async () => {
      vi.mocked(repo.findArchiveEmployees).mockResolvedValue([makeEmployee()] as never);
      vi.mocked(repo.findUploadedArchiveDocuments).mockResolvedValue([
        {
          id: "doc-1",
          ownerId: "employee-1",
          documentTypeId: "type-1",
          fileName: "ktp.pdf",
          filePath: "KTP/ktp.pdf",
          documentNumber: null,
          issueDate: new Date("2026-01-01T00:00:00.000Z"),
          expiryDate: null,
          uploadedAt: new Date("2026-07-04T00:00:00.000Z"),
          updatedAt: new Date("2026-07-04T00:00:00.000Z"),
          status: DocumentStatus.PENDING,
          documentType: {
            ...makeDocumentType({
              id: "type-1",
              isMandatory: false,
              code: "SERT",
              name: "Sertifikat Pelatihan",
              archiveCategory: DocumentArchiveCategory.KONDISIONAL,
            }),
            documentProfessions: [],
            documentStatuses: [],
            documentGroups: [],
            documentRanks: [],
            documentWorkplaces: [],
          },
          verificationHistories: [],
        },
      ] as never);

      const result = await getDocumentArchiveRecapService({
        uploadStatus: "UPLOADED",
        status: DocumentStatus.PENDING,
        uploadedAtFrom: "2026-07-01",
        uploadedAtTo: "2026-07-31",
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].documentType.name).toBe("Sertifikat Pelatihan");
      expect(result.stats).toMatchObject({
        totalRequired: 1,
        uploaded: 1,
        missing: 0,
        percentage: 100,
      });
      expect(result.stats.pending).toBe(1);
      expect(repo.findMandatoryArchiveDocumentTypes).not.toHaveBeenCalled();
      expect(repo.findArchiveDocuments).not.toHaveBeenCalled();
      expect(repo.findUploadedArchiveDocuments).toHaveBeenCalledWith(["employee-1"], expect.objectContaining({
        uploadStatus: "UPLOADED",
      }));
    });

    it("exportDocumentArchiveRecapService menghasilkan CSV dan audit export", async () => {
      vi.mocked(repo.findArchiveEmployees).mockResolvedValue([makeEmployee()] as never);
      vi.mocked(repo.findMandatoryArchiveDocumentTypes).mockResolvedValue([makeDocumentType()]);
      vi.mocked(repo.findArchiveDocuments).mockResolvedValue([] as never);

      const result = await exportDocumentArchiveRecapService({}, actor, "127.0.0.1");

      expect(result.content.charCodeAt(0)).toBe(0xfeff);
      expect(result.content).toContain("Belum Upload");
      expect(result.fileName).toMatch(/^smdp-rekap-arsip-dokumen-20260704-\d{4}\.csv$/);
      expect(result.rowCount).toBe(1);
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        eventType: "DATA_EXPORTED",
        resource: "/api/v1/document-types/archives/export",
        ipAddress: "127.0.0.1",
        metadata: expect.objectContaining({
          entity: "document-archives",
          format: "csv",
          rows: 1,
        }),
      }));
    });
  });
});
