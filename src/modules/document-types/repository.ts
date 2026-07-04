import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";
import { EMPLOYEE_CAPABLE_ROLES } from "@/lib/rbac";
import { Prisma } from "@prisma/client";
import {
  DocumentArchiveFilter,
  CreateDocumentTypeInput,
  DocumentTypeFilter,
  DocumentTypeRecord,
  UpdateDocumentTypeInput,
} from "./types";

const defaultInclude = {
  documentProfessions: {
    include: { professionGroup: true },
  },
  documentStatuses: {
    include: { employmentStatus: true },
  },
  documentGroups: {
    include: { employeeGroup: true },
  },
  documentRanks: {
    include: { employeeRank: true },
  },
  documentWorkplaces: {
    include: { workplace: true },
  },
};

function formatDocumentType(item: any): DocumentTypeRecord {
  return {
    ...item,
    targetProfessions: item.documentProfessions?.map((dp: any) => ({
      id: dp.professionGroup.id,
      name: dp.professionGroup.name,
    })) || [],
    targetStatuses: item.documentStatuses?.map((ds: any) => ({
      id: ds.employmentStatus.id,
      name: ds.employmentStatus.name,
    })) || [],
    targetGroups: item.documentGroups?.map((dg: any) => ({
      id: dg.employeeGroup.id,
      name: dg.employeeGroup.name,
    })) || [],
    targetRanks: item.documentRanks?.map((dr: any) => ({
      id: dr.employeeRank.id,
      name: dr.employeeRank.name,
    })) || [],
    targetWorkplaces: item.documentWorkplaces?.map((dw: any) => ({
      id: dw.workplace.id,
      name: dw.workplace.name,
    })) || [],
  };
}

export async function findManyDocumentTypes(
  filters?: DocumentTypeFilter
): Promise<DocumentTypeRecord[]> {
  const where: any = {};

  if (filters?.category) {
    where.archiveCategory = filters.category;
  }

  if (filters?.professionGroupId) {
    where.documentProfessions = {
      some: {
        professionGroupId: filters.professionGroupId,
      },
    };
  }

  const items = await prisma.documentType.findMany({
    where,
    include: defaultInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map(formatDocumentType);
}

export async function findDocumentTypeById(
  id: string
): Promise<DocumentTypeRecord | null> {
  const item = await prisma.documentType.findUnique({
    where: { id },
    include: defaultInclude,
  });

  if (!item) return null;
  return formatDocumentType(item);
}

export async function findDocumentTypeByCode(
  code: string
): Promise<DocumentTypeRecord | null> {
  const item = await prisma.documentType.findUnique({
    where: { code },
    include: defaultInclude,
  });

  if (!item) return null;
  return formatDocumentType(item);
}

export async function createDocumentType(
  data: CreateDocumentTypeInput
): Promise<DocumentTypeRecord> {
  const {
    professionGroupIds = [],
    employmentStatusIds = [],
    employeeGroupIds = [],
    employeeRankIds = [],
    workplaceIds = [],
    ...rest
  } = data;

  const item = await prisma.documentType.create({
    data: {
      ...rest,
      documentProfessions: {
        create: professionGroupIds.map((id) => ({ professionGroupId: id })),
      },
      documentStatuses: {
        create: employmentStatusIds.map((id) => ({ employmentStatusId: id })),
      },
      documentGroups: {
        create: employeeGroupIds.map((id) => ({ employeeGroupId: id })),
      },
      documentRanks: {
        create: employeeRankIds.map((id) => ({ employeeRankId: id })),
      },
      documentWorkplaces: {
        create: workplaceIds.map((id) => ({ workplaceId: id })),
      },
    },
    include: defaultInclude,
  });

  return formatDocumentType(item);
}

export async function updateDocumentType(
  id: string,
  data: UpdateDocumentTypeInput
): Promise<DocumentTypeRecord> {
  const {
    professionGroupIds,
    employmentStatusIds,
    employeeGroupIds,
    employeeRankIds,
    workplaceIds,
    ...rest
  } = data;

  if (professionGroupIds !== undefined) {
    await prisma.documentTypeProfession.deleteMany({ where: { documentTypeId: id } });
  }
  if (employmentStatusIds !== undefined) {
    await prisma.documentTypeEmploymentStatus.deleteMany({ where: { documentTypeId: id } });
  }
  if (employeeGroupIds !== undefined) {
    await prisma.documentTypeEmployeeGroup.deleteMany({ where: { documentTypeId: id } });
  }
  if (employeeRankIds !== undefined) {
    await prisma.documentTypeEmployeeRank.deleteMany({ where: { documentTypeId: id } });
  }
  if (workplaceIds !== undefined) {
    await prisma.documentTypeWorkplace.deleteMany({ where: { documentTypeId: id } });
  }

  const item = await prisma.documentType.update({
    where: { id },
    data: {
      ...rest,
      ...(professionGroupIds !== undefined && {
        documentProfessions: {
          create: professionGroupIds.map((pgId) => ({ professionGroupId: pgId })),
        },
      }),
      ...(employmentStatusIds !== undefined && {
        documentStatuses: {
          create: employmentStatusIds.map((esId) => ({ employmentStatusId: esId })),
        },
      }),
      ...(employeeGroupIds !== undefined && {
        documentGroups: {
          create: employeeGroupIds.map((egId) => ({ employeeGroupId: egId })),
        },
      }),
      ...(employeeRankIds !== undefined && {
        documentRanks: {
          create: employeeRankIds.map((erId) => ({ employeeRankId: erId })),
        },
      }),
      ...(workplaceIds !== undefined && {
        documentWorkplaces: {
          create: workplaceIds.map((wId) => ({ workplaceId: wId })),
        },
      }),
    },
    include: defaultInclude,
  });

  return formatDocumentType(item);
}

export async function deleteDocumentType(id: string): Promise<boolean> {
  // 1. Clean up junction tables
  await prisma.documentTypeProfession.deleteMany({ where: { documentTypeId: id } });
  await prisma.documentTypeEmploymentStatus.deleteMany({ where: { documentTypeId: id } });
  await prisma.documentTypeEmployeeGroup.deleteMany({ where: { documentTypeId: id } });
  await prisma.documentTypeEmployeeRank.deleteMany({ where: { documentTypeId: id } });
  await prisma.documentTypeWorkplace.deleteMany({ where: { documentTypeId: id } });

  // 2. Clean up associated DocumentRecords and physical files
  const records = await prisma.documentRecord.findMany({ where: { documentTypeId: id } });
  if (records.length > 0) {
    const recordIds = records.map((r) => r.id);
    await prisma.verificationHistory.deleteMany({ where: { documentRecordId: { in: recordIds } } });
    
    // Attempt physical storage file deletion
    const storage = getStorageProvider();
    for (const rec of records) {
      if (rec.filePath) {
        try {
          await storage.deleteFile(rec.filePath);
        } catch (e) {
          // Ignore storage deletion errors if file is already missing
        }
      }
    }

    await prisma.documentRecord.deleteMany({ where: { documentTypeId: id } });
  }

  // 3. Delete DocumentType safely
  await prisma.documentType.deleteMany({ where: { id } });
  return true;
}

export async function findArchiveEmployees(filters: DocumentArchiveFilter) {
  const where: Prisma.UserWhereInput = {
    role: { in: [...EMPLOYEE_CAPABLE_ROLES] },
  };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { employeeId: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.employmentStatusId) where.employmentStatusId = filters.employmentStatusId;
  if (filters.employeeGroupId) where.employeeGroupId = filters.employeeGroupId;
  if (filters.professionGroupId) where.professionGroupId = filters.professionGroupId;
  if (filters.employeePositionId) where.employeePositionId = filters.employeePositionId;
  if (filters.employeeRankId) where.employeeRankId = filters.employeeRankId;
  if (filters.workplaceId) where.workplaceId = filters.workplaceId;

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      employeeId: true,
      name: true,
      avatarUrl: true,
      employmentStatusId: true,
      employeeGroupId: true,
      professionGroupId: true,
      employeePositionId: true,
      employeeRankId: true,
      workplaceId: true,
      employmentStatus: { select: { name: true } },
      employeeGroup: { select: { name: true } },
      professionGroup: { select: { name: true } },
      employeePosition: { select: { name: true } },
      employeeRank: { select: { name: true } },
      workplace: { select: { name: true } },
    },
    orderBy: [{ name: "asc" }, { employeeId: "asc" }],
  });
}

export async function findMandatoryArchiveDocumentTypes(filters: DocumentArchiveFilter) {
  const where: Prisma.DocumentTypeWhereInput = {
    isMandatory: true,
  };

  if (filters.archiveCategory) where.archiveCategory = filters.archiveCategory;
  if (filters.documentTypeId) where.id = filters.documentTypeId;

  const items = await prisma.documentType.findMany({
    where,
    include: defaultInclude,
    orderBy: [{ archiveCategory: "asc" }, { name: "asc" }],
  });

  return items.map(formatDocumentType);
}

export async function findArchiveDocuments(ownerIds: string[], documentTypeIds: string[]) {
  if (ownerIds.length === 0 || documentTypeIds.length === 0) return [];

  return prisma.documentRecord.findMany({
    where: {
      ownerId: { in: ownerIds },
      documentTypeId: { in: documentTypeIds },
    },
    include: {
      verificationHistories: {
        take: 1,
        orderBy: { reviewedAt: "desc" },
        select: {
          reviewNote: true,
          reviewedAt: true,
          status: true,
        },
      },
    },
    orderBy: [{ uploadedAt: "desc" }, { updatedAt: "desc" }],
  });
}

export async function findUploadedArchiveDocuments(ownerIds: string[], filters: DocumentArchiveFilter) {
  if (ownerIds.length === 0) return [];

  const where: Prisma.DocumentRecordWhereInput = {
    ownerId: { in: ownerIds },
  };

  if (filters.documentTypeId) where.documentTypeId = filters.documentTypeId;
  if (filters.status) where.status = filters.status;
  if (filters.archiveCategory) {
    where.documentType = {
      archiveCategory: filters.archiveCategory,
    };
  }

  return prisma.documentRecord.findMany({
    where,
    include: {
      documentType: {
        include: defaultInclude,
      },
      verificationHistories: {
        take: 1,
        orderBy: { reviewedAt: "desc" },
        select: {
          reviewNote: true,
          reviewedAt: true,
          status: true,
        },
      },
    },
    orderBy: [{ uploadedAt: "desc" }, { updatedAt: "desc" }],
  });
}
