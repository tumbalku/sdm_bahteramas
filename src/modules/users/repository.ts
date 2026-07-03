import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { CreateUserInput, UpdateUserInput, UserFilter, UserRecord } from "./types";
import type { DocumentTypeRecord } from "@/modules/document-types/types";

export interface BulkCreateUserInput extends CreateUserInput {
  passwordHash: string;
  role: Role;
}

function mapUserRecord(u: any): UserRecord {
  return {
    id: u.id,
    employeeId: u.employeeId,
    nik: u.nik,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    role: u.role,
    gender: u.gender,
    birthDate: u.birthDate,
    academicDegree: u.academicDegree,
    lastEducation: u.lastEducation,
    religion: u.religion,
    maritalStatus: u.maritalStatus,
    phone: u.phone,
    address: u.address,
    joinDate: u.joinDate,
    hasTmt: Boolean(u.hasTmt),
    tmtStartDate: u.tmtStartDate,
    tmtEndDate: u.tmtEndDate,
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

async function hydrateUserRawFields(users: any[]) {
  if (!users || users.length === 0) return;
  if (users[0].academicDegree !== undefined && users[0].nik !== undefined && users[0].hasTmt !== undefined) return;

  const ids = users.map((u) => u.id);
  const rawRows: any[] = await prisma.$queryRawUnsafe(
    `SELECT "id", "nik", "academicDegree", "lastEducation", "religion", "maritalStatus", "phone", "address", "joinDate", "hasTmt", "tmtStartDate", "tmtEndDate" FROM "User" WHERE "id" = ANY($1::text[])`,
    ids
  );

  const rawMap = new Map<string, any>();
  rawRows.forEach((r) => rawMap.set(r.id, r));

  users.forEach((u) => {
    const raw = rawMap.get(u.id);
    if (raw) {
      Object.assign(u, raw);
    }
  });
}

export async function findManyUsers(filters?: UserFilter): Promise<UserRecord[]> {
  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { employeeId: { contains: filters.search, mode: "insensitive" } },
      { nik: { contains: filters.search, mode: "insensitive" } },
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

  if (filters?.employeeGroupId) {
    where.employeeGroupId = filters.employeeGroupId;
  }

  if (filters?.employeePositionId) {
    where.employeePositionId = filters.employeePositionId;
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

  await hydrateUserRawFields(items);
  return items.map(mapUserRecord);
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const u: any = await prisma.user.findUnique({
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
  await hydrateUserRawFields([u]);
  return mapUserRecord(u);
}

export async function findUserByEmployeeId(employeeId: string) {
  return prisma.user.findUnique({ where: { employeeId } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

function mapDocumentTypeRecord(item: any): DocumentTypeRecord {
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

export async function findUsersByUniqueFields(input: {
  employeeIds: string[];
  emails: string[];
  niks: string[];
}) {
  if (input.employeeIds.length === 0 && input.emails.length === 0 && input.niks.length === 0) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      OR: [
        ...(input.employeeIds.length > 0 ? [{ employeeId: { in: input.employeeIds } }] : []),
        ...(input.emails.length > 0 ? [{ email: { in: input.emails } }] : []),
        ...(input.niks.length > 0 ? [{ nik: { in: input.niks } }] : []),
      ],
    },
    select: {
      employeeId: true,
      email: true,
      nik: true,
    },
  });
}

export async function findUserImportReferenceData() {
  const [employmentStatuses, employeeGroups, professionGroups, employeePositions, employeeRanks, workplaces] =
    await Promise.all([
      prisma.employmentStatus.findMany({ select: { id: true, name: true } }),
      prisma.employeeGroup.findMany({ select: { id: true, name: true, employmentStatusId: true } }),
      prisma.professionGroup.findMany({ select: { id: true, name: true } }),
      prisma.employeePosition.findMany({ select: { id: true, name: true, professionGroupId: true } }),
      prisma.employeeRank.findMany({ select: { id: true, name: true } }),
      prisma.workplace.findMany({ select: { id: true, name: true } }),
    ]);

  return {
    employmentStatuses,
    employeeGroups,
    professionGroups,
    employeePositions,
    employeeRanks,
    workplaces,
  };
}

export async function findUserDocumentExportSource(userId: string) {
  const [user, documentTypes, documents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employeeId: true,
        name: true,
        employmentStatusId: true,
        employeeGroupId: true,
        professionGroupId: true,
        employeePositionId: true,
        employeeRankId: true,
        workplaceId: true,
      },
    }),
    prisma.documentType.findMany({
      include: {
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
      },
      orderBy: [{ archiveCategory: "asc" }, { name: "asc" }],
    }),
    prisma.documentRecord.findMany({
      where: { ownerId: userId },
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
    }),
  ]);

  return {
    user,
    documentTypes: documentTypes.map(mapDocumentTypeRecord),
    documents,
  };
}

export async function createUsersBulk(users: BulkCreateUserInput[]): Promise<number> {
  if (users.length === 0) return 0;

  await prisma.$transaction(
    users.map((user) => {
      const {
        password,
        passwordHash,
        birthDate,
        joinDate,
        tmtStartDate,
        tmtEndDate,
        role,
        nik,
        academicDegree,
        lastEducation,
        religion,
        maritalStatus,
        phone,
        address,
        hasTmt,
        ...rest
      } = user;

      return prisma.user.create({
        data: {
          ...rest,
          nik: nik || null,
          passwordHash,
          role,
          gender: user.gender || null,
          birthDate: birthDate ? new Date(birthDate) : null,
          academicDegree: academicDegree || null,
          lastEducation: lastEducation || null,
          religion: religion || null,
          maritalStatus: maritalStatus || null,
          phone: phone || null,
          address: address || null,
          joinDate: joinDate ? new Date(joinDate) : null,
          hasTmt: Boolean(hasTmt),
          tmtStartDate: hasTmt && tmtStartDate ? new Date(tmtStartDate) : null,
          tmtEndDate: hasTmt && tmtEndDate ? new Date(tmtEndDate) : null,
          userRoles: {
            create: { role },
          },
        },
      });
    })
  );

  return users.length;
}

export async function createUser(
  data: CreateUserInput & { passwordHash: string }
): Promise<UserRecord> {
  const { password, birthDate, joinDate, tmtStartDate, tmtEndDate, nik, academicDegree, lastEducation, religion, maritalStatus, phone, address, ...rest } = data;

  try {
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

    // Sync new fields via Raw SQL if client engine omitted them
    if (nik || academicDegree || lastEducation || religion || maritalStatus || phone || address || joinDate || rest.hasTmt || tmtStartDate || tmtEndDate) {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "nik" = $1, "academicDegree" = $2, "lastEducation" = $3, "religion" = $4, "maritalStatus" = $5, "phone" = $6, "address" = $7, "joinDate" = $8, "hasTmt" = $9, "tmtStartDate" = $10, "tmtEndDate" = $11 WHERE "id" = $12`,
        nik || null,
        academicDegree || null,
        lastEducation || null,
        religion || null,
        maritalStatus || null,
        phone || null,
        address || null,
        joinDate ? new Date(joinDate) : null,
        Boolean(rest.hasTmt),
        rest.hasTmt && tmtStartDate ? new Date(tmtStartDate) : null,
        rest.hasTmt && tmtEndDate ? new Date(tmtEndDate) : null,
        u.id
      );
    }

    const createdUser = await findUserById(u.id);
    return createdUser!;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(
  id: string,
  data: UpdateUserInput & { passwordHash?: string }
): Promise<UserRecord> {
  const { password, birthDate, joinDate, tmtStartDate, tmtEndDate, nik, academicDegree, lastEducation, religion, maritalStatus, phone, address, role, passwordHash, ...rest } = data;

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

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  // Sync raw fields via Raw SQL safely
  const fields: string[] = [];
  const values: any[] = [];

  if (nik !== undefined) { fields.push(`"nik" = $${values.length + 1}`); values.push(nik || null); }
  if (academicDegree !== undefined) { fields.push(`"academicDegree" = $${values.length + 1}`); values.push(academicDegree || null); }
  if (lastEducation !== undefined) { fields.push(`"lastEducation" = $${values.length + 1}`); values.push(lastEducation || null); }
  if (religion !== undefined) { fields.push(`"religion" = $${values.length + 1}`); values.push(religion || null); }
  if (maritalStatus !== undefined) { fields.push(`"maritalStatus" = $${values.length + 1}`); values.push(maritalStatus || null); }
  if (phone !== undefined) { fields.push(`"phone" = $${values.length + 1}`); values.push(phone || null); }
  if (address !== undefined) { fields.push(`"address" = $${values.length + 1}`); values.push(address || null); }
  if (joinDate !== undefined) { fields.push(`"joinDate" = $${values.length + 1}`); values.push(joinDate ? new Date(joinDate) : null); }
  if (rest.hasTmt !== undefined) {
    fields.push(`"hasTmt" = $${values.length + 1}`);
    values.push(Boolean(rest.hasTmt));
    if (!rest.hasTmt && tmtStartDate === undefined) { fields.push(`"tmtStartDate" = $${values.length + 1}`); values.push(null); }
    if (!rest.hasTmt && tmtEndDate === undefined) { fields.push(`"tmtEndDate" = $${values.length + 1}`); values.push(null); }
  }
  if (tmtStartDate !== undefined) { fields.push(`"tmtStartDate" = $${values.length + 1}`); values.push(rest.hasTmt === false ? null : tmtStartDate ? new Date(tmtStartDate) : null); }
  if (tmtEndDate !== undefined) { fields.push(`"tmtEndDate" = $${values.length + 1}`); values.push(rest.hasTmt === false ? null : tmtEndDate ? new Date(tmtEndDate) : null); }

  if (fields.length > 0) {
    fields.push(`"updatedAt" = NOW()`);
    const setClause = fields.join(", ");
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET ${setClause} WHERE "id" = $${values.length + 1}`,
      ...values,
      id
    );
  }

  const updatedUser = await findUserById(id);
  return updatedUser!;
}

export async function deleteUser(id: string): Promise<boolean> {
  await prisma.user.delete({
    where: { id },
  });
  return true;
}
