import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentStatus } from "@prisma/client";
import { logActivity } from "@/lib/security-log";
import { prisma } from "@/lib/prisma";
import * as repo from "../repository";
import {
  approveDocumentService,
  rejectDocumentService,
  getPendingDocumentsService,
} from "../service";

vi.mock("@/lib/security-log", () => ({
  logActivity: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((val) => Promise.all(val)),
    documentRecord: {
      update: vi.fn(),
    },
    verificationHistory: {
      create: vi.fn(),
    },
  },
}));

vi.mock("../repository", () => ({
  findPendingDocuments: vi.fn(),
  findDocumentRecordById: vi.fn(),
  updateDocumentStatus: vi.fn(),
  createVerificationHistory: vi.fn(),
  findVerificationHistoryByDocument: vi.fn(),
}));

function makeDocument(overrides = {}) {
  return {
    id: "doc-1",
    ownerId: "owner-1",
    documentTypeId: "type-1",
    fileName: "sip.pdf",
    filePath: "SIP/sip.pdf",
    status: DocumentStatus.PENDING,
    ...overrides,
  };
}

describe("verification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logActivity).mockResolvedValue(undefined);
    vi.mocked(repo.findPendingDocuments).mockResolvedValue([] as never);
    vi.mocked(repo.findDocumentRecordById).mockResolvedValue(null as never);
  });

  describe("getPendingDocumentsService", () => {
    it("ADMIN melihat semua dokumen pending", async () => {
      await getPendingDocumentsService({ id: "admin-1", role: "ADMIN" });
      expect(repo.findPendingDocuments).toHaveBeenCalledWith(undefined);
    });

    it("STAFF melihat dokumen pending milik orang lain saja (exclude dirinya sendiri)", async () => {
      await getPendingDocumentsService({ id: "staff-1", role: "STAFF" });
      expect(repo.findPendingDocuments).toHaveBeenCalledWith("staff-1");
    });
  });

  describe("approveDocumentService", () => {
    it("ADMIN diperbolehkan approve dokumen miliknya sendiri", async () => {
      const doc = makeDocument({ ownerId: "admin-1" });
      vi.mocked(repo.findDocumentRecordById).mockResolvedValue(doc as never);

      await expect(approveDocumentService(doc.id, { id: "admin-1", name: "Admin", role: "ADMIN" }))
        .resolves.toBe(true);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        eventType: "DOCUMENT_APPROVED",
      }));
    });

    it("STAFF ditolak approve dokumen miliknya sendiri", async () => {
      const doc = makeDocument({ ownerId: "staff-1" });
      vi.mocked(repo.findDocumentRecordById).mockResolvedValue(doc as never);

      await expect(approveDocumentService(doc.id, { id: "staff-1", name: "Staff", role: "STAFF" }))
        .rejects.toThrow("Staf tidak diperbolehkan menyetujui dokumen miliknya sendiri");

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(logActivity).not.toHaveBeenCalled();
    });

    it("STAFF diperbolehkan approve dokumen milik orang lain", async () => {
      const doc = makeDocument({ ownerId: "employee-1" });
      vi.mocked(repo.findDocumentRecordById).mockResolvedValue(doc as never);

      await expect(approveDocumentService(doc.id, { id: "staff-1", name: "Staff", role: "STAFF" }))
        .resolves.toBe(true);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(logActivity).toHaveBeenCalled();
    });
  });

  describe("rejectDocumentService", () => {
    it("ADMIN diperbolehkan reject dokumen miliknya sendiri", async () => {
      const doc = makeDocument({ ownerId: "admin-1" });
      vi.mocked(repo.findDocumentRecordById).mockResolvedValue(doc as never);

      await expect(rejectDocumentService(doc.id, "Alasan penolakan", { id: "admin-1", name: "Admin", role: "ADMIN" }))
        .resolves.toBe(true);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        eventType: "DOCUMENT_REJECTED",
      }));
    });

    it("STAFF ditolak reject dokumen miliknya sendiri", async () => {
      const doc = makeDocument({ ownerId: "staff-1" });
      vi.mocked(repo.findDocumentRecordById).mockResolvedValue(doc as never);

      await expect(rejectDocumentService(doc.id, "Alasan penolakan", { id: "staff-1", name: "Staff", role: "STAFF" }))
        .rejects.toThrow("Staf tidak diperbolehkan menolak dokumen miliknya sendiri");

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(logActivity).not.toHaveBeenCalled();
    });

    it("STAFF diperbolehkan reject dokumen milik orang lain", async () => {
      const doc = makeDocument({ ownerId: "employee-1" });
      vi.mocked(repo.findDocumentRecordById).mockResolvedValue(doc as never);

      await expect(rejectDocumentService(doc.id, "Alasan penolakan", { id: "staff-1", name: "Staff", role: "STAFF" }))
        .resolves.toBe(true);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(logActivity).toHaveBeenCalled();
    });
  });
});
