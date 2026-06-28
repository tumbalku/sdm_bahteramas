import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";

export async function getDashboardStats(ownerId?: string) {
  const baseWhere = ownerId ? { ownerId } : {};

  const [total, pending, approved, rejected] = await Promise.all([
    prisma.documentRecord.count({ where: baseWhere }),
    prisma.documentRecord.count({ where: { ...baseWhere, status: DocumentStatus.PENDING } }),
    prisma.documentRecord.count({ where: { ...baseWhere, status: DocumentStatus.APPROVED } }),
    prisma.documentRecord.count({ where: { ...baseWhere, status: DocumentStatus.REJECTED } }),
  ]);

  return { total, pending, approved, rejected };
}

export async function getExpiringDocuments(ownerId?: string, daysThreshold = 30) {
  const baseWhere = ownerId ? { ownerId } : {};
  
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + daysThreshold);

  return prisma.documentRecord.findMany({
    where: {
      ...baseWhere,
      status: DocumentStatus.APPROVED, // Hanya dokumen yang sudah disetujui yang dihitung kedaluwarsa
      expiryDate: {
        not: null,
        lte: thresholdDate,
        gte: today, // Belum sepenuhnya kedaluwarsa, tapi mendekati
      }
    },
    include: {
      documentType: true,
      owner: { select: { id: true, name: true, employeeId: true } },
    },
    orderBy: {
      expiryDate: "asc",
    },
    take: 10,
  });
}

export async function getRecentDocuments(ownerId?: string) {
  const baseWhere = ownerId ? { ownerId } : {};

  return prisma.documentRecord.findMany({
    where: baseWhere,
    include: {
      documentType: true,
      owner: { select: { id: true, name: true, employeeId: true } },
    },
    orderBy: {
      uploadedAt: "desc",
    },
    take: 5,
  });
}
