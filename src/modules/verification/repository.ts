import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";

export async function findPendingDocuments() {
  return prisma.documentRecord.findMany({
    where: {
      status: DocumentStatus.PENDING,
    },
    include: {
      documentType: true,
      owner: {
        select: {
          id: true,
          name: true,
          employeeId: true,
        },
      },
    },
    orderBy: {
      uploadedAt: "asc", // FIFO (First In First Out)
    },
  });
}

export async function findDocumentRecordById(id: string) {
  return prisma.documentRecord.findUnique({
    where: { id },
    include: {
      documentType: true,
      owner: {
        select: {
          id: true,
          name: true,
          employeeId: true,
        },
      },
    },
  });
}

export async function updateDocumentStatus(id: string, status: DocumentStatus) {
  return prisma.documentRecord.update({
    where: { id },
    data: { status },
  });
}

export async function createVerificationHistory(data: {
  documentRecordId: string;
  status: DocumentStatus;
  reviewedById: string;
  reviewNote?: string;
}) {
  return prisma.verificationHistory.create({
    data,
  });
}

export async function findVerificationHistoryByDocument(documentRecordId: string) {
  return prisma.verificationHistory.findMany({
    where: { documentRecordId },
    include: {
      reviewedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      reviewedAt: "desc",
    },
  });
}
