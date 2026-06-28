import { prisma } from "@/lib/prisma";
import {
  CreateDocumentTypeInput,
  DocumentTypeFilter,
  DocumentTypeRecord,
  UpdateDocumentTypeInput,
} from "./types";

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
    include: {
      documentProfessions: {
        include: {
          professionGroup: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map((item) => ({
    ...item,
    targetProfessions: item.documentProfessions.map((dp) => ({
      id: dp.professionGroup.id,
      name: dp.professionGroup.name,
    })),
  }));
}

export async function findDocumentTypeById(
  id: string
): Promise<DocumentTypeRecord | null> {
  const item = await prisma.documentType.findUnique({
    where: { id },
    include: {
      documentProfessions: {
        include: {
          professionGroup: true,
        },
      },
    },
  });

  if (!item) return null;

  return {
    ...item,
    targetProfessions: item.documentProfessions.map((dp) => ({
      id: dp.professionGroup.id,
      name: dp.professionGroup.name,
    })),
  };
}

export async function findDocumentTypeByCode(
  code: string
): Promise<DocumentTypeRecord | null> {
  const item = await prisma.documentType.findUnique({
    where: { code },
    include: {
      documentProfessions: {
        include: {
          professionGroup: true,
        },
      },
    },
  });

  if (!item) return null;

  return {
    ...item,
    targetProfessions: item.documentProfessions.map((dp) => ({
      id: dp.professionGroup.id,
      name: dp.professionGroup.name,
    })),
  };
}

export async function createDocumentType(
  data: CreateDocumentTypeInput
): Promise<DocumentTypeRecord> {
  const { professionGroupIds = [], ...rest } = data;

  const item = await prisma.documentType.create({
    data: {
      ...rest,
      documentProfessions: {
        create: professionGroupIds.map((pgId) => ({
          professionGroupId: pgId,
        })),
      },
    },
    include: {
      documentProfessions: {
        include: {
          professionGroup: true,
        },
      },
    },
  });

  return {
    ...item,
    targetProfessions: item.documentProfessions.map((dp) => ({
      id: dp.professionGroup.id,
      name: dp.professionGroup.name,
    })),
  };
}

export async function updateDocumentType(
  id: string,
  data: UpdateDocumentTypeInput
): Promise<DocumentTypeRecord> {
  const { professionGroupIds, ...rest } = data;

  // Jika professionGroupIds diberikan, reset relasi M:N lama
  if (professionGroupIds !== undefined) {
    await prisma.documentTypeProfession.deleteMany({
      where: { documentTypeId: id },
    });
  }

  const item = await prisma.documentType.update({
    where: { id },
    data: {
      ...rest,
      ...(professionGroupIds !== undefined && {
        documentProfessions: {
          create: professionGroupIds.map((pgId) => ({
            professionGroupId: pgId,
          })),
        },
      }),
    },
    include: {
      documentProfessions: {
        include: {
          professionGroup: true,
        },
      },
    },
  });

  return {
    ...item,
    targetProfessions: item.documentProfessions.map((dp) => ({
      id: dp.professionGroup.id,
      name: dp.professionGroup.name,
    })),
  };
}

export async function deleteDocumentType(id: string): Promise<boolean> {
  await prisma.documentType.delete({
    where: { id },
  });
  return true;
}
