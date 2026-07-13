import { DocumentStatus } from "@prisma/client";
import {
  findPendingDocuments,
  findDocumentRecordById,
  updateDocumentStatus,
  createVerificationHistory,
  findVerificationHistoryByDocument,
} from "./repository";
import { logActivity } from "@/lib/security-log";
import { prisma } from "@/lib/prisma";

export async function getPendingDocumentsService(actor: { id: string; role: string }) {
  const excludeOwnerId = actor.role === "STAFF" ? actor.id : undefined;
  return findPendingDocuments(excludeOwnerId);
}

export async function approveDocumentService(
  documentId: string,
  actor: { id: string; name: string; role: string },
  ipAddress?: string
) {
  const document = await findDocumentRecordById(documentId);
  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  if (document.status !== "PENDING") {
    throw new Error("Hanya dokumen berstatus PENDING yang dapat diverifikasi");
  }

  // STAFF tidak boleh memverifikasi dokumen sendiri
  if (actor.role === "STAFF" && document.ownerId === actor.id) {
    throw new Error("Staf tidak diperbolehkan menyetujui dokumen miliknya sendiri");
  }

  // Update Status & Create Verification History in a single transaction
  await prisma.$transaction([
    prisma.documentRecord.update({
      where: { id: documentId },
      data: { status: DocumentStatus.APPROVED },
    }),
    prisma.verificationHistory.create({
      data: {
        documentRecordId: documentId,
        status: DocumentStatus.APPROVED,
        reviewedById: actor.id,
      },
    }),
  ]);

  // Log Aktivitas
  await logActivity(
    {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      eventType: "DOCUMENT_APPROVED",
      resource: `DocumentRecord:${document.id}`,
      ipAddress,
      status: "success",
      metadata: { ownerId: document.ownerId, fileName: document.fileName },
    }
  );

  return true;
}

export async function rejectDocumentService(
  documentId: string,
  reviewNote: string,
  actor: { id: string; name: string; role: string },
  ipAddress?: string
) {
  const document = await findDocumentRecordById(documentId);
  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  if (document.status !== "PENDING") {
    throw new Error("Hanya dokumen berstatus PENDING yang dapat diverifikasi");
  }

  // STAFF tidak boleh memverifikasi dokumen sendiri
  if (actor.role === "STAFF" && document.ownerId === actor.id) {
    throw new Error("Staf tidak diperbolehkan menolak dokumen miliknya sendiri");
  }

  // Update Status & Create Verification History in a single transaction
  await prisma.$transaction([
    prisma.documentRecord.update({
      where: { id: documentId },
      data: { status: DocumentStatus.REJECTED },
    }),
    prisma.verificationHistory.create({
      data: {
        documentRecordId: documentId,
        status: DocumentStatus.REJECTED,
        reviewedById: actor.id,
        reviewNote,
      },
    }),
  ]);

  // Log Aktivitas
  await logActivity(
    {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      eventType: "DOCUMENT_REJECTED",
      resource: `DocumentRecord:${document.id}`,
      ipAddress,
      status: "success",
      metadata: { ownerId: document.ownerId, fileName: document.fileName, reviewNote },
    }
  );

  return true;
}

export async function getDocumentVerificationHistoryService(documentId: string) {
  return findVerificationHistoryByDocument(documentId);
}
