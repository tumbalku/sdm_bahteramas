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
  const ownerWhere: Prisma.UserWhereInput = {};
  if (filters.search) {
    ownerWhere.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { employeeId: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.employmentStatusId) {
    ownerWhere.employmentStatusId = filters.employmentStatusId;
  }
  if (filters.employeeGroupId) {
    ownerWhere.employeeGroupId = filters.employeeGroupId;
  }
  if (filters.professionGroupId) {
    ownerWhere.professionGroupId = filters.professionGroupId;
  }
  if (filters.employeePositionId) {
    ownerWhere.employeePositionId = filters.employeePositionId;
  }

  if (Object.keys(ownerWhere).length > 0) {
    where.owner = ownerWhere;
  }

  if (filters.page !== undefined || filters.pageSize !== undefined) {
    const page = Math.max(Number(filters.page) || 1, 1);
    const pageSize = Math.max(Number(filters.pageSize) || 10, 1);
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.documentRecord.findMany({
        where,
        include: {
          documentType: true,
          owner: {
            select: {
              id: true,
              name: true,
              employeeId: true,
              avatarUrl: true,
            },
          },
          verificationHistories: {
            take: 1,
            orderBy: {
              reviewedAt: "desc",
            },
            include: {
              reviewedBy: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          uploadedAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.documentRecord.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
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
          avatarUrl: true,
        },
      },
      verificationHistories: {
        take: 1,
        orderBy: {
          reviewedAt: "desc",
        },
        include: {
          reviewedBy: {
            select: {
              name: true,
            },
          },
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
          avatarUrl: true,
        },
      },
      verificationHistories: {
        take: 1,
        orderBy: {
          reviewedAt: "desc",
        },
        include: {
          reviewedBy: {
            select: {
              id: true,
              name: true,
              employeeId: true,
            },
          },
        },
      },
    },
  });
}

export async function findDocumentByOwnerAndType(ownerId: string, documentTypeId: string) {
  return prisma.documentRecord.findFirst({
    where: {
      ownerId,
      documentTypeId,
    },
    orderBy: [{ uploadedAt: "desc" }, { updatedAt: "desc" }],
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
