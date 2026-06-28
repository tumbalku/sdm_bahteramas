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

export async function getPendingDocumentsService() {
  return findPendingDocuments();
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

  // Update Status
  await updateDocumentStatus(documentId, DocumentStatus.APPROVED);

  // Catat ke VerificationHistory
  await createVerificationHistory({
    documentRecordId: documentId,
    status: DocumentStatus.APPROVED,
    reviewedById: actor.id,
  });

  // Log Aktivitas
  await logActivity(
    {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      eventType: "DOCUMENT_APPROVED",
      resource: `DocumentRecord:${document.id}`,
      ipAddress,
      status: "SUCCESS",
      metadata: { ownerId: document.ownerId, fileName: document.fileName },
    },
    prisma
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

  // Update Status
  await updateDocumentStatus(documentId, DocumentStatus.REJECTED);

  // Catat ke VerificationHistory
  await createVerificationHistory({
    documentRecordId: documentId,
    status: DocumentStatus.REJECTED,
    reviewedById: actor.id,
    reviewNote,
  });

  // Log Aktivitas
  await logActivity(
    {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      eventType: "DOCUMENT_REJECTED",
      resource: `DocumentRecord:${document.id}`,
      ipAddress,
      status: "SUCCESS",
      metadata: { ownerId: document.ownerId, fileName: document.fileName, reviewNote },
    },
    prisma
  );

  return true;
}

export async function getDocumentVerificationHistoryService(documentId: string) {
  return findVerificationHistoryByDocument(documentId);
}
