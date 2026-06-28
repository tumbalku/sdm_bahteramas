import { prisma } from "@/lib/prisma";

export async function findUserProfileById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      employmentStatus: true,
      employeeGroup: true,
      professionGroup: true,
      employeePosition: true,
      employeeRank: true,
      workplace: true,
    },
  });
}

export async function updateUserProfile(id: string, data: { name: string; gender?: string; birthDate?: Date | null }) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function updateUserPassword(id: string, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}
