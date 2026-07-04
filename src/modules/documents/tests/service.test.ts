import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentStatus } from "@prisma/client";
import { getStorageProvider } from "@/lib/storage";
import { logActivity } from "@/lib/security-log";
import * as repo from "../repository";
import { deleteDocumentService, getDocumentsService } from "../service";

vi.mock("@/lib/storage", () => ({
  getStorageProvider: vi.fn(),
}));

vi.mock("@/lib/security-log", () => ({
  logActivity: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    documentRecord: {
      count: vi.fn(),
    },
  },
}));

vi.mock("../repository", () => ({
  createDocumentRecord: vi.fn(),
  deleteDocumentRecord: vi.fn(),
  findDocumentById: vi.fn(),
  findDocumentByOwnerAndType: vi.fn(),
  findDocuments: vi.fn(),
  findDocumentTypeById: vi.fn(),
}));

const storage = {
  deleteFile: vi.fn(),
};

function makeDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: "doc-1",
    ownerId: "owner-1",
    documentTypeId: "type-1",
    fileName: "ktp.pdf",
    filePath: "KTP/ktp.pdf",
    status: DocumentStatus.PENDING,
    ...overrides,
  };
}

describe("documents service RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStorageProvider).mockReturnValue(storage as never);
    vi.mocked(logActivity).mockResolvedValue(undefined);
    vi.mocked(repo.findDocuments).mockResolvedValue([] as never);
    vi.mocked(repo.findDocumentByOwnerAndType).mockResolvedValue(null as never);
    vi.mocked(repo.deleteDocumentRecord).mockResolvedValue(undefined as never);
    storage.deleteFile.mockResolvedValue(undefined);
  });

  describe("getDocumentsService", () => {
    it("ADMIN default melihat dokumen personal di konteks Dokumen Saya", async () => {
      await getDocumentsService({}, { id: "admin-1", role: "ADMIN" });

      expect(repo.findDocuments).toHaveBeenCalledWith({ ownerId: "admin-1" });
    });

    it("ADMIN masih bisa meminta ownerId eksplisit untuk konteks admin-wide", async () => {
      await getDocumentsService({ ownerId: "employee-1" }, { id: "admin-1", role: "ADMIN" });

      expect(repo.findDocuments).toHaveBeenCalledWith({ ownerId: "employee-1" });
    });

    it("STAFF dan EMPLOYEE hanya melihat dokumen personal", async () => {
      await getDocumentsService({ ownerId: "employee-1" }, { id: "staff-1", role: "STAFF" });
      await getDocumentsService({ ownerId: "staff-1" }, { id: "employee-1", role: "EMPLOYEE" });

      expect(repo.findDocuments).toHaveBeenNthCalledWith(1, { ownerId: "staff-1" });
      expect(repo.findDocuments).toHaveBeenNthCalledWith(2, { ownerId: "employee-1" });
    });
  });

  describe("uploadDocumentService", () => {
    it("menolak upload normal jika user sudah punya dokumen dengan jenis yang sama", async () => {
      const { uploadDocumentService } = await import("../service");
      vi.mocked(repo.findDocumentTypeById).mockResolvedValue({
        id: "type-1",
        code: "SIP",
        archiveCategory: "PROFESI",
        allowedFormats: "pdf",
        maxSizeMb: 5,
        requiresDocumentNumber: false,
        requiresIssueDate: false,
        requiresExpiryDate: false,
      } as never);
      vi.mocked(repo.findDocumentByOwnerAndType).mockResolvedValue(makeDocument({
        id: "existing-doc",
        ownerId: "staff-1",
        documentTypeId: "type-1",
        status: DocumentStatus.PENDING,
      }) as never);

      await expect(uploadDocumentService({
        ownerId: "staff-1",
        documentTypeId: "type-1",
        file: { name: "sip.pdf", size: 1024 } as File,
      }, {
        id: "staff-1",
        name: "Staff SMDP",
        role: "STAFF",
        employeeId: "STAFF001",
      })).rejects.toThrow("Dokumen SIP sudah pernah diupload");

      expect(repo.createDocumentRecord).not.toHaveBeenCalled();
      expect(getStorageProvider).not.toHaveBeenCalled();
    });
  });

  describe("deleteDocumentService", () => {
    it("STAFF bisa menghapus dokumen personal yang belum approved", async () => {
      vi.mocked(repo.findDocumentById).mockResolvedValue(makeDocument({ ownerId: "staff-1" }) as never);

      await expect(deleteDocumentService("doc-1", {
        id: "staff-1",
        name: "Staff SMDP",
        role: "STAFF",
      })).resolves.toBe(true);

      expect(storage.deleteFile).toHaveBeenCalledWith("KTP/ktp.pdf");
      expect(repo.deleteDocumentRecord).toHaveBeenCalledWith("doc-1");
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        eventType: "DOCUMENT_DELETED",
        actorRole: "STAFF",
      }));
    });

    it("STAFF tidak bisa menghapus dokumen personal yang sudah approved", async () => {
      vi.mocked(repo.findDocumentById).mockResolvedValue(makeDocument({
        ownerId: "staff-1",
        status: DocumentStatus.APPROVED,
      }) as never);

      await expect(deleteDocumentService("doc-1", {
        id: "staff-1",
        name: "Staff SMDP",
        role: "STAFF",
      })).rejects.toThrow("Tidak dapat menghapus dokumen yang sudah disetujui");

      expect(repo.deleteDocumentRecord).not.toHaveBeenCalled();
    });

    it("ADMIN tetap bisa menghapus dokumen siapapun", async () => {
      vi.mocked(repo.findDocumentById).mockResolvedValue(makeDocument({
        ownerId: "employee-1",
        status: DocumentStatus.APPROVED,
      }) as never);

      await expect(deleteDocumentService("doc-1", {
        id: "admin-1",
        name: "Admin SMDP",
        role: "ADMIN",
      })).resolves.toBe(true);

      expect(repo.deleteDocumentRecord).toHaveBeenCalledWith("doc-1");
    });
  });
});
