import { prisma } from "@/lib/prisma";
import { DocumentStatus, Role } from "@prisma/client";

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

export async function groupEmployeesByEmploymentStatus() {
  const groups = await prisma.user.groupBy({
    by: ["employmentStatusId"],
    where: { role: Role.EMPLOYEE },
    _count: { id: true },
  });

  const ids = groups
    .map((group) => group.employmentStatusId)
    .filter((id): id is string => Boolean(id));

  const names = await prisma.employmentStatus.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });

  return { groups, names };
}

export async function groupEmployeesByEmployeeGroup() {
  const groups = await prisma.user.groupBy({
    by: ["employeeGroupId"],
    where: { role: Role.EMPLOYEE },
    _count: { id: true },
  });

  const ids = groups
    .map((group) => group.employeeGroupId)
    .filter((id): id is string => Boolean(id));

  const names = await prisma.employeeGroup.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });

  return { groups, names };
}

export async function groupEmployeesByGender() {
  return prisma.user.groupBy({
    by: ["gender"],
    where: { role: Role.EMPLOYEE },
    _count: { id: true },
  });
}

export async function groupEmployeesByWorkplace() {
  const groups = await prisma.user.groupBy({
    by: ["workplaceId"],
    where: { role: Role.EMPLOYEE },
    _count: { id: true },
  });

  const ids = groups
    .map((group) => group.workplaceId)
    .filter((id): id is string => Boolean(id));

  const names = await prisma.workplace.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });

  return { groups, names };
}

export async function groupDocumentsByStatus() {
  return prisma.documentRecord.groupBy({
    by: ["status"],
    _count: { id: true },
  });
}

export async function findDocumentUploadsSince(since: Date) {
  return prisma.documentRecord.findMany({
    where: {
      uploadedAt: {
        gte: since,
      },
    },
    select: {
      uploadedAt: true,
      documentTypeId: true,
      documentType: {
        select: {
          code: true,
          name: true,
        },
      },
    },
    orderBy: {
      uploadedAt: "asc",
    },
  });
}

export async function findMandatoryDashboardEmployees() {
  return prisma.user.findMany({
    where: { role: Role.EMPLOYEE },
    select: {
      id: true,
      employmentStatusId: true,
      employeeGroupId: true,
      professionGroupId: true,
      employeeRankId: true,
      workplaceId: true,
    },
  });
}

export async function findMandatoryDashboardDocumentTypes() {
  return prisma.documentType.findMany({
    where: { isMandatory: true },
    include: {
      documentStatuses: {
        include: { employmentStatus: { select: { id: true, name: true } } },
      },
      documentGroups: {
        include: { employeeGroup: { select: { id: true, name: true } } },
      },
      documentProfessions: {
        include: { professionGroup: { select: { id: true, name: true } } },
      },
      documentRanks: {
        include: { employeeRank: { select: { id: true, name: true } } },
      },
      documentWorkplaces: {
        include: { workplace: { select: { id: true, name: true } } },
      },
    },
    orderBy: [{ archiveCategory: "asc" }, { name: "asc" }],
  });
}

export async function findLatestMandatoryDashboardDocuments(ownerIds: string[], documentTypeIds: string[]) {
  if (ownerIds.length === 0 || documentTypeIds.length === 0) return [];

  return prisma.documentRecord.findMany({
    where: {
      ownerId: { in: ownerIds },
      documentTypeId: { in: documentTypeIds },
    },
    select: {
      ownerId: true,
      documentTypeId: true,
      uploadedAt: true,
      updatedAt: true,
    },
    orderBy: [{ uploadedAt: "desc" }, { updatedAt: "desc" }],
  });
}

export async function countExpiringDocumentsUntil(until: Date) {
  const today = new Date();

  return prisma.documentRecord.count({
    where: {
      status: DocumentStatus.APPROVED,
      expiryDate: {
        not: null,
        gte: today,
        lte: until,
      },
    },
  });
}
