import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { DocumentFilterDto } from "./types";

export async function createDocumentRecord(data: Prisma.DocumentRecordUncheckedCreateInput) {
  return prisma.documentRecord.create({
    data,
    include: {
      documentType: true,
    },
  });
}

export async function findDocuments(filters: DocumentFilterDto) {
  const where: Prisma.DocumentRecordWhereInput = {};

  if (filters.ownerId) {
    where.ownerId = filters.ownerId;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.archiveCategory) {
    where.documentType = {
      archiveCategory: filters.archiveCategory,
    };
  }

  return prisma.documentRecord.findMany({
    where,
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
      uploadedAt: "desc",
    },
  });
}

export async function findDocumentById(id: string) {
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

export async function deleteDocumentRecord(id: string) {
  return prisma.documentRecord.delete({
    where: { id },
  });
}

export async function findDocumentTypeById(id: string) {
  return prisma.documentType.findUnique({
    where: { id },
  });
}
