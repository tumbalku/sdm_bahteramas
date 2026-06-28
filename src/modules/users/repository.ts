import { prisma } from "@/lib/prisma";
import { CreateUserInput, UpdateUserInput, UserFilter, UserRecord } from "./types";

export async function findManyUsers(filters?: UserFilter): Promise<UserRecord[]> {
  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { employeeId: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.professionGroupId) {
    where.professionGroupId = filters.professionGroupId;
  }

  if (filters?.workplaceId) {
    where.workplaceId = filters.workplaceId;
  }

  if (filters?.employmentStatusId) {
    where.employmentStatusId = filters.employmentStatusId;
  }

  const items = await prisma.user.findMany({
    where,
    include: {
      employmentStatus: true,
      employeeGroup: true,
      professionGroup: true,
      employeePosition: true,
      employeeRank: true,
      workplace: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map((u) => ({
    id: u.id,
    employeeId: u.employeeId,
    email: u.email,
    name: u.name,
    role: u.role,
    gender: u.gender,
    birthDate: u.birthDate,
    employmentStatus: u.employmentStatus
      ? { id: u.employmentStatus.id, name: u.employmentStatus.name }
      : null,
    employeeGroup: u.employeeGroup
      ? { id: u.employeeGroup.id, name: u.employeeGroup.name }
      : null,
    professionGroup: u.professionGroup
      ? { id: u.professionGroup.id, name: u.professionGroup.name }
      : null,
    employeePosition: u.employeePosition
      ? { id: u.employeePosition.id, name: u.employeePosition.name }
      : null,
    employeeRank: u.employeeRank
      ? { id: u.employeeRank.id, name: u.employeeRank.name }
      : null,
    workplace: u.workplace
      ? { id: u.workplace.id, name: u.workplace.name }
      : null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const u = await prisma.user.findUnique({
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

  if (!u) return null;

  return {
    id: u.id,
    employeeId: u.employeeId,
    email: u.email,
    name: u.name,
    role: u.role,
    gender: u.gender,
    birthDate: u.birthDate,
    employmentStatus: u.employmentStatus
      ? { id: u.employmentStatus.id, name: u.employmentStatus.name }
      : null,
    employeeGroup: u.employeeGroup
      ? { id: u.employeeGroup.id, name: u.employeeGroup.name }
      : null,
    professionGroup: u.professionGroup
      ? { id: u.professionGroup.id, name: u.professionGroup.name }
      : null,
    employeePosition: u.employeePosition
      ? { id: u.employeePosition.id, name: u.employeePosition.name }
      : null,
    employeeRank: u.employeeRank
      ? { id: u.employeeRank.id, name: u.employeeRank.name }
      : null,
    workplace: u.workplace
      ? { id: u.workplace.id, name: u.workplace.name }
      : null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function findUserByEmployeeId(employeeId: string) {
  return prisma.user.findUnique({ where: { employeeId } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  data: CreateUserInput & { passwordHash: string }
): Promise<UserRecord> {
  const { password, birthDate, ...rest } = data;

  const u = await prisma.user.create({
    data: {
      ...rest,
      birthDate: birthDate ? new Date(birthDate) : null,
      userRoles: {
        create: {
          role: data.role,
        },
      },
    },
    include: {
      employmentStatus: true,
      employeeGroup: true,
      professionGroup: true,
      employeePosition: true,
      employeeRank: true,
      workplace: true,
    },
  });

  return {
    id: u.id,
    employeeId: u.employeeId,
    email: u.email,
    name: u.name,
    role: u.role,
    gender: u.gender,
    birthDate: u.birthDate,
    employmentStatus: u.employmentStatus
      ? { id: u.employmentStatus.id, name: u.employmentStatus.name }
      : null,
    employeeGroup: u.employeeGroup
      ? { id: u.employeeGroup.id, name: u.employeeGroup.name }
      : null,
    professionGroup: u.professionGroup
      ? { id: u.professionGroup.id, name: u.professionGroup.name }
      : null,
    employeePosition: u.employeePosition
      ? { id: u.employeePosition.id, name: u.employeePosition.name }
      : null,
    employeeRank: u.employeeRank
      ? { id: u.employeeRank.id, name: u.employeeRank.name }
      : null,
    workplace: u.workplace
      ? { id: u.workplace.id, name: u.workplace.name }
      : null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function updateUser(
  id: string,
  data: UpdateUserInput & { passwordHash?: string }
): Promise<UserRecord> {
  const { password, birthDate, role, passwordHash, ...rest } = data;

  const updateData: any = {
    ...rest,
    ...(birthDate !== undefined && {
      birthDate: birthDate ? new Date(birthDate) : null,
    }),
    ...(passwordHash && { passwordHash }),
    ...(role && { role }),
  };

  if (role) {
    await prisma.userRole.deleteMany({ where: { userId: id } });
    updateData.userRoles = {
      create: { role },
    };
  }

  const u = await prisma.user.update({
    where: { id },
    data: updateData,
    include: {
      employmentStatus: true,
      employeeGroup: true,
      professionGroup: true,
      employeePosition: true,
      employeeRank: true,
      workplace: true,
    },
  });

  return {
    id: u.id,
    employeeId: u.employeeId,
    email: u.email,
    name: u.name,
    role: u.role,
    gender: u.gender,
    birthDate: u.birthDate,
    employmentStatus: u.employmentStatus
      ? { id: u.employmentStatus.id, name: u.employmentStatus.name }
      : null,
    employeeGroup: u.employeeGroup
      ? { id: u.employeeGroup.id, name: u.employeeGroup.name }
      : null,
    professionGroup: u.professionGroup
      ? { id: u.professionGroup.id, name: u.professionGroup.name }
      : null,
    employeePosition: u.employeePosition
      ? { id: u.employeePosition.id, name: u.employeePosition.name }
      : null,
    employeeRank: u.employeeRank
      ? { id: u.employeeRank.id, name: u.employeeRank.name }
      : null,
    workplace: u.workplace
      ? { id: u.workplace.id, name: u.workplace.name }
      : null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function deleteUser(id: string): Promise<boolean> {
  await prisma.user.delete({
    where: { id },
  });
  return true;
}
