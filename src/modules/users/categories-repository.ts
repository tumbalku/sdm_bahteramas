import { prisma } from "@/lib/prisma";

export type CategoryType = "STATUS" | "GROUP" | "PROFESSION" | "POSITION" | "RANK" | "WORKPLACE";

export async function findAllCategories() {
  const [employmentStatuses, professionGroups, employeeRanks, workplaces] = await Promise.all([
    prisma.employmentStatus.findMany({
      include: {
        employeeGroups: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.professionGroup.findMany({
      include: {
        employeePositions: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.employeeRank.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.workplace.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    employmentStatuses,
    professionGroups,
    employeeRanks,
    workplaces,
  };
}

export async function createCategoryItem(type: CategoryType, name: string, parentId?: string) {
  switch (type) {
    case "STATUS":
      return prisma.employmentStatus.create({ data: { name } });
    case "GROUP":
      if (!parentId) throw new Error("Status kepegawaian induk wajib dipilih");
      return prisma.employeeGroup.create({
        data: { name, employmentStatusId: parentId },
      });
    case "PROFESSION":
      return prisma.professionGroup.create({ data: { name } });
    case "POSITION":
      if (!parentId) throw new Error("Kelompok profesi induk wajib dipilih");
      return prisma.employeePosition.create({
        data: { name, professionGroupId: parentId },
      });
    case "RANK":
      return prisma.employeeRank.create({ data: { name } });
    case "WORKPLACE":
      return prisma.workplace.create({ data: { name } });
    default:
      throw new Error("Tipe kategori tidak valid");
  }
}

export async function updateCategoryItem(id: string, type: CategoryType, name: string, parentId?: string) {
  switch (type) {
    case "STATUS":
      return prisma.employmentStatus.update({ where: { id }, data: { name } });
    case "GROUP":
      return prisma.employeeGroup.update({
        where: { id },
        data: { name, ...(parentId ? { employmentStatusId: parentId } : {}) },
      });
    case "PROFESSION":
      return prisma.professionGroup.update({ where: { id }, data: { name } });
    case "POSITION":
      return prisma.employeePosition.update({
        where: { id },
        data: { name, ...(parentId ? { professionGroupId: parentId } : {}) },
      });
    case "RANK":
      return prisma.employeeRank.update({ where: { id }, data: { name } });
    case "WORKPLACE":
      return prisma.workplace.update({ where: { id }, data: { name } });
    default:
      throw new Error("Tipe kategori tidak valid");
  }
}

export async function deleteCategoryItem(id: string, type: CategoryType) {
  switch (type) {
    case "STATUS":
      await prisma.documentTypeEmploymentStatus.deleteMany({ where: { employmentStatusId: id } });
      await prisma.user.updateMany({ where: { employmentStatusId: id }, data: { employmentStatusId: null } });
      await prisma.employeeGroup.deleteMany({ where: { employmentStatusId: id } });
      await prisma.employmentStatus.deleteMany({ where: { id } });
      return true;
    case "GROUP":
      await prisma.documentTypeEmployeeGroup.deleteMany({ where: { employeeGroupId: id } });
      await prisma.user.updateMany({ where: { employeeGroupId: id }, data: { employeeGroupId: null } });
      await prisma.employeeGroup.deleteMany({ where: { id } });
      return true;
    case "PROFESSION":
      await prisma.documentTypeProfession.deleteMany({ where: { professionGroupId: id } });
      await prisma.user.updateMany({ where: { professionGroupId: id }, data: { professionGroupId: null } });
      await prisma.employeePosition.deleteMany({ where: { professionGroupId: id } });
      await prisma.professionGroup.deleteMany({ where: { id } });
      return true;
    case "POSITION":
      await prisma.user.updateMany({ where: { employeePositionId: id }, data: { employeePositionId: null } });
      await prisma.employeePosition.deleteMany({ where: { id } });
      return true;
    case "RANK":
      await prisma.documentTypeEmployeeRank.deleteMany({ where: { employeeRankId: id } });
      await prisma.user.updateMany({ where: { employeeRankId: id }, data: { employeeRankId: null } });
      await prisma.employeeRank.deleteMany({ where: { id } });
      return true;
    case "WORKPLACE":
      await prisma.documentTypeWorkplace.deleteMany({ where: { workplaceId: id } });
      await prisma.user.updateMany({ where: { workplaceId: id }, data: { workplaceId: null } });
      await prisma.workplace.deleteMany({ where: { id } });
      return true;
    default:
      throw new Error("Tipe kategori tidak valid");
  }
}
