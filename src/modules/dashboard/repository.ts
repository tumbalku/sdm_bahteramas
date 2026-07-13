import { prisma } from "@/lib/prisma";
import { EMPLOYEE_CAPABLE_ROLES } from "@/lib/rbac";
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
      owner: { select: { id: true, name: true, employeeId: true, avatarUrl: true } },
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
      owner: { select: { id: true, name: true, employeeId: true, avatarUrl: true } },
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
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
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
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
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
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
    _count: { id: true },
  });
}

export async function groupEmployeesByWorkplace() {
  const groups = await prisma.user.groupBy({
    by: ["workplaceId"],
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
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
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
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

export async function groupEmployeesByRank() {
  const groups = await prisma.user.groupBy({
    by: ["employeeRankId"],
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
    _count: { id: true },
  });

  const ids = groups
    .map((group) => group.employeeRankId)
    .filter((id): id is string => Boolean(id));

  const names = await prisma.employeeRank.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });

  return { groups, names };
}

export async function groupEmployeesByPosition() {
  const groups = await prisma.user.groupBy({
    by: ["employeePositionId"],
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
    _count: { id: true },
  });

  const ids = groups
    .map((group) => group.employeePositionId)
    .filter((id): id is string => Boolean(id));

  const names = await prisma.employeePosition.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });

  return { groups, names };
}

export async function groupEmployeesByProfessionGroup() {
  const groups = await prisma.user.groupBy({
    by: ["professionGroupId"],
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
    _count: { id: true },
  });

  const ids = groups
    .map((group) => group.professionGroupId)
    .filter((id): id is string => Boolean(id));

  const names = await prisma.professionGroup.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });

  return { groups, names };
}

export async function groupEmployeesByEducation() {
  return prisma.user.groupBy({
    by: ["lastEducation"],
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
    _count: { id: true },
  });
}

export async function groupEmployeesByReligion() {
  return prisma.user.groupBy({
    by: ["religion"],
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
    _count: { id: true },
  });
}

export async function groupEmployeesByMaritalStatus() {
  return prisma.user.groupBy({
    by: ["maritalStatus"],
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
    _count: { id: true },
  });
}

export async function getEmployeeBirthDates() {
  return prisma.user.findMany({
    where: {
      role: { in: [...EMPLOYEE_CAPABLE_ROLES] },
      birthDate: { not: null },
    },
    select: { birthDate: true },
  });
}

export async function groupDocumentsByArchiveCategory() {
  return prisma.documentRecord.groupBy({
    by: ["documentTypeId"],
    _count: { id: true },
  });
}

export async function getDocumentTypesForArchiveGrouping() {
  return prisma.documentType.findMany({
    select: { id: true, archiveCategory: true },
  });
}

export async function groupEmployeesByGenderAndEmployeeGroup() {
  const employees = await prisma.user.findMany({
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
    select: { gender: true, employeeGroupId: true },
  });

  const employeeGroupIds = [...new Set(employees.map((e) => e.employeeGroupId).filter((id): id is string => Boolean(id)))];

  const employeeGroups = await prisma.employeeGroup.findMany({
    where: { id: { in: employeeGroupIds } },
    select: { id: true, name: true },
  });

  const groupNameMap = new Map(employeeGroups.map((g) => [g.id, g.name]));

  return { employees, groupNameMap };
}

export async function groupEmployeesByGenderAndEmploymentStatus() {
  const employees = await prisma.user.findMany({
    where: { role: { in: [...EMPLOYEE_CAPABLE_ROLES] } },
    select: { gender: true, employmentStatusId: true },
  });

  const employmentStatusIds = [...new Set(employees.map((e) => e.employmentStatusId).filter((id): id is string => Boolean(id)))];

  const employmentStatuses = await prisma.employmentStatus.findMany({
    where: { id: { in: employmentStatusIds } },
    select: { id: true, name: true },
  });

  const statusNameMap = new Map(employmentStatuses.map((s) => [s.id, s.name]));

  return { employees, statusNameMap };
}
