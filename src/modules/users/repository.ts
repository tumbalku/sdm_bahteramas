import { prisma } from "@/lib/prisma";
import { Role, Prisma } from "@prisma/client";
import { CreateUserInput, PaginatedUsersResult, UpdateUserInput, UserFilter, UserRecord } from "./types";
import type { DocumentTypeRecord } from "@/modules/document-types/types";

export interface BulkCreateUserInput extends CreateUserInput {
  passwordHash: string;
  role: Role;
}

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    employmentStatus: true;
    employeeGroup: true;
    professionGroup: true;
    employeePosition: true;
    employeeRank: true;
    workplace: true;
  };
}>;

function mapUserRecord(u: UserWithRelations): UserRecord {
  return {
    id: u.id,
    employeeId: u.employeeId,
    nik: u.nik,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    role: u.role,
    gender: u.gender,
    birthPlace: u.birthPlace,
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
    hasOldEmployeeId: Boolean(u.hasOldEmployeeId),
    oldEmployeeId: u.oldEmployeeId,
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

function startOfDate(value: string) {
  const date = new Date(`${value}T00:00:00.000`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function endOfDate(value: string) {
  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function birthDateUpperBoundForAge(age: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - age);
  date.setHours(23, 59, 59, 999);
  return date;
}

function birthDateLowerBoundForAge(age: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - age - 1);
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

type UserDateRangeField = "tmtStartDate" | "tmtEndDate";

function applyDateRange(where: Prisma.UserWhereInput, field: UserDateRangeField, from?: string, to?: string) {
  const range: Prisma.DateTimeNullableFilter = {};
  const fromDate = from ? startOfDate(from) : undefined;
  const toDate = to ? endOfDate(to) : undefined;

  if (fromDate) range.gte = fromDate;
  if (toDate) range.lte = toDate;
  if (Object.keys(range).length > 0) {
    where[field] = range;
  }
}

function applyDateUntilToday(where: Prisma.UserWhereInput, field: UserDateRangeField, value?: string) {
  if (!value) return;
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  applyDateRange(where, field, value, todayString);
}

export async function findManyUsers(filters?: UserFilter): Promise<UserRecord[] | PaginatedUsersResult> {
  const where: Prisma.UserWhereInput = {};

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

  if (filters?.maritalStatus) {
    where.maritalStatus = filters.maritalStatus;
  }

  if (filters?.lastEducation) {
    where.lastEducation = filters.lastEducation;
  }

  applyDateUntilToday(where, "tmtStartDate", filters?.tmtStartDate);
  applyDateUntilToday(where, "tmtEndDate", filters?.tmtEndDate);

  const birthDateRange: Record<string, Date> = {};
  if (filters?.retirementAgeMin !== undefined) {
    birthDateRange.lte = birthDateUpperBoundForAge(filters.retirementAgeMin);
  }
  if (filters?.retirementAgeMax !== undefined) {
    birthDateRange.gte = birthDateLowerBoundForAge(filters.retirementAgeMax);
  }
  if (Object.keys(birthDateRange).length > 0) {
    where.birthDate = birthDateRange;
  }

  if (filters?.page !== undefined || filters?.pageSize !== undefined) {
    const page = Math.max(Number(filters?.page) || 1, 1);
    const pageSize = Math.max(Number(filters?.pageSize) || 10, 1);
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
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
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: items.map(mapUserRecord),
      total,
      page,
      pageSize,
    };
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

  return items.map(mapUserRecord);
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
  return mapUserRecord(u);
}

export async function findUserByEmployeeId(employeeId: string) {
  return prisma.user.findUnique({ where: { employeeId } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

type DocumentTypeWithRelations = Prisma.DocumentTypeGetPayload<{
  include: {
    documentProfessions: {
      include: { professionGroup: true };
    };
    documentStatuses: {
      include: { employmentStatus: true };
    };
    documentGroups: {
      include: { employeeGroup: true };
    };
    documentRanks: {
      include: { employeeRank: true };
    };
    documentWorkplaces: {
      include: { workplace: true };
    };
  };
}>;

function mapDocumentTypeRecord(item: DocumentTypeWithRelations): DocumentTypeRecord {
  return {
    ...item,
    targetProfessions: item.documentProfessions?.map((dp) => ({
      id: dp.professionGroup.id,
      name: dp.professionGroup.name,
    })) || [],
    targetStatuses: item.documentStatuses?.map((ds) => ({
      id: ds.employmentStatus.id,
      name: ds.employmentStatus.name,
    })) || [],
    targetGroups: item.documentGroups?.map((dg) => ({
      id: dg.employeeGroup.id,
      name: dg.employeeGroup.name,
    })) || [],
    targetRanks: item.documentRanks?.map((dr) => ({
      id: dr.employeeRank.id,
      name: dr.employeeRank.name,
    })) || [],
    targetWorkplaces: item.documentWorkplaces?.map((dw) => ({
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
        birthPlace,
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
          birthPlace: birthPlace || null,
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
          hasOldEmployeeId: Boolean(user.hasOldEmployeeId),
          oldEmployeeId: user.hasOldEmployeeId && user.oldEmployeeId ? user.oldEmployeeId : null,
        },
      });
    })
  );

  return users.length;
}

export async function createUser(
  data: CreateUserInput & { passwordHash: string }
): Promise<UserRecord> {
  const { password, birthDate, birthPlace, joinDate, tmtStartDate, tmtEndDate, nik, academicDegree, lastEducation, religion, maritalStatus, phone, address, hasOldEmployeeId, oldEmployeeId, ...rest } = data;

  try {
    const u = await prisma.user.create({
      data: {
        ...rest,
        birthDate: birthDate ? new Date(birthDate) : null,
        nik: nik || null,
        birthPlace: birthPlace || null,
        academicDegree: academicDegree || null,
        lastEducation: lastEducation || null,
        religion: religion || null,
        maritalStatus: maritalStatus || null,
        phone: phone || null,
        address: address || null,
        joinDate: joinDate ? new Date(joinDate) : null,
        hasTmt: Boolean(rest.hasTmt),
        tmtStartDate: rest.hasTmt && tmtStartDate ? new Date(tmtStartDate) : null,
        tmtEndDate: rest.hasTmt && tmtEndDate ? new Date(tmtEndDate) : null,
        hasOldEmployeeId: Boolean(hasOldEmployeeId),
        oldEmployeeId: hasOldEmployeeId && oldEmployeeId ? oldEmployeeId : null,
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

    return mapUserRecord(u);
  } catch (error) {
    throw error;
  }
}

export async function updateUser(
  id: string,
  data: UpdateUserInput & { passwordHash?: string }
): Promise<UserRecord> {
  const { password, birthDate, birthPlace, joinDate, tmtStartDate, tmtEndDate, nik, academicDegree, lastEducation, religion, maritalStatus, phone, address, role, passwordHash, hasOldEmployeeId, oldEmployeeId, ...rest } = data;

  const updateData: Prisma.UserUpdateInput = {
    ...rest,
  };

  if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
  if (passwordHash !== undefined) updateData.passwordHash = passwordHash;
  if (role !== undefined) updateData.role = role;
  if (nik !== undefined) updateData.nik = nik || null;
  if (birthPlace !== undefined) updateData.birthPlace = birthPlace || null;
  if (academicDegree !== undefined) updateData.academicDegree = academicDegree || null;
  if (lastEducation !== undefined) updateData.lastEducation = lastEducation || null;
  if (religion !== undefined) updateData.religion = religion || null;
  if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus || null;
  if (phone !== undefined) updateData.phone = phone || null;
  if (address !== undefined) updateData.address = address || null;
  if (joinDate !== undefined) updateData.joinDate = joinDate ? new Date(joinDate) : null;

  // Handle hasTmt conditions
  if (rest.hasTmt !== undefined) {
    updateData.hasTmt = Boolean(rest.hasTmt);
    if (!rest.hasTmt) {
      updateData.tmtStartDate = null;
      updateData.tmtEndDate = null;
    }
  }
  if (tmtStartDate !== undefined) {
    updateData.tmtStartDate = updateData.hasTmt === false ? null : tmtStartDate ? new Date(tmtStartDate) : null;
  }
  if (tmtEndDate !== undefined) {
    updateData.tmtEndDate = updateData.hasTmt === false ? null : tmtEndDate ? new Date(tmtEndDate) : null;
  }

  // Handle hasOldEmployeeId conditions
  if (hasOldEmployeeId !== undefined) {
    updateData.hasOldEmployeeId = Boolean(hasOldEmployeeId);
    if (!hasOldEmployeeId) {
      updateData.oldEmployeeId = null;
    }
  }
  if (oldEmployeeId !== undefined) {
    updateData.oldEmployeeId = updateData.hasOldEmployeeId === false ? null : oldEmployeeId || null;
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

  return mapUserRecord(u);
}

export async function deleteUser(id: string): Promise<boolean> {
  await prisma.user.delete({
    where: { id },
  });
  return true;
}
