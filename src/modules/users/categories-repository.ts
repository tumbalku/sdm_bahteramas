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
      // Hapus anak terlebih dahulu jika ada
      await prisma.employeeGroup.deleteMany({ where: { employmentStatusId: id } });
      return prisma.employmentStatus.delete({ where: { id } });
    case "GROUP":
      return prisma.employeeGroup.delete({ where: { id } });
    case "PROFESSION":
      // Hapus anak terlebih dahulu jika ada
      await prisma.employeePosition.deleteMany({ where: { professionGroupId: id } });
      return prisma.professionGroup.delete({ where: { id } });
    case "POSITION":
      return prisma.employeePosition.delete({ where: { id } });
    case "RANK":
      return prisma.employeeRank.delete({ where: { id } });
    case "WORKPLACE":
      return prisma.workplace.delete({ where: { id } });
    default:
      throw new Error("Tipe kategori tidak valid");
  }
}
