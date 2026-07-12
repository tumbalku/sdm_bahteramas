import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { logActivity } from "@/lib/security-log";
import type { AuthUser } from "@/lib/auth-utils";
import * as repo from "./repository";
import type { CreateUserInput, ImportUserError, ImportUsersResult } from "./types";
import {
  IMPORT_HEADERS,
  createNameLookup,
  emptyToNull,
  escapeCsvValue,
  isValidDateString,
  normalizeKey,
  parseBoolean,
  parseCsv,
  validateCsvHeaders,
} from "./utils";
import { createUserSchema } from "./validation";

export function getUsersImportTemplateCsv() {
  const exampleRow = [
    "199001012026011001",
    "7471010101900001",
    "pegawai@example.com",
    "Pegawai123!",
    "Nama Pegawai",
    "EMPLOYEE",
    "L",
    "1990-01-01",
    "Kendari",
    "S.Kep",
    "D4/S1",
    "Islam",
    "Kawin",
    "081234567890",
    "Alamat pegawai",
    "2026-01-01",
    "PNS",
    "PNS",
    "Keperawatan",
    "Perawat",
    "III/a",
    "Unit Rawat Inap",
    "true",
    "2026-01-01",
    "2026-12-31",
  ];

  return [IMPORT_HEADERS.join(","), exampleRow.map(escapeCsvValue).join(",")].join("\n");
}

export async function importUsersCsvService(
  csvText: string,
  actor: AuthUser,
  ipAddress?: string
): Promise<ImportUsersResult> {
  const errors: ImportUserError[] = validateCsvHeaders(csvText);
  const rows = errors.length > 0 ? [] : parseCsv(csvText);

  if (errors.length > 0) {
    return { totalRows: 0, validRows: 0, createdCount: 0, errorCount: errors.length, errors };
  }

  if (rows.length === 0) {
    return {
      totalRows: 0,
      validRows: 0,
      createdCount: 0,
      errorCount: 1,
      errors: [{ row: 1, message: "CSV tidak memiliki data pegawai" }],
    };
  }

  const refs = await repo.findUserImportReferenceData();
  const employmentStatusByName = createNameLookup(refs.employmentStatuses);
  const employeeGroupByName = createNameLookup(refs.employeeGroups);
  const professionGroupByName = createNameLookup(refs.professionGroups);
  const employeePositionByName = createNameLookup(refs.employeePositions);
  const employeeRankByName = createNameLookup(refs.employeeRanks);
  const workplaceByName = createNameLookup(refs.workplaces);

  const seenEmployeeIds = new Map<string, number>();
  const seenEmails = new Map<string, number>();
  const seenNiks = new Map<string, number>();
  const prepared: repo.BulkCreateUserInput[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const employeeId = row.employeeId?.trim();
    const email = row.email?.trim();
    const nik = emptyToNull(row.nik);

    const addError = (field: string, message: string) => errors.push({ row: rowNumber, field, message });

    if (employeeId) {
      const previousRow = seenEmployeeIds.get(employeeId);
      if (previousRow) addError("employeeId", `Duplikat NIP dengan baris ${previousRow}`);
      seenEmployeeIds.set(employeeId, rowNumber);
    }

    if (email) {
      const normalizedEmail = normalizeKey(email);
      const previousRow = seenEmails.get(normalizedEmail);
      if (previousRow) addError("email", `Duplikat email dengan baris ${previousRow}`);
      seenEmails.set(normalizedEmail, rowNumber);
    }

    if (nik) {
      const previousRow = seenNiks.get(nik);
      if (previousRow) addError("nik", `Duplikat NIK dengan baris ${previousRow}`);
      seenNiks.set(nik, rowNumber);
    }

    const roleValue = (row.role?.trim() || "EMPLOYEE") as Role;
    if (!Object.values(Role).includes(roleValue)) {
      addError("role", "Role harus ADMIN, STAFF, atau EMPLOYEE");
    }

    const dateFields = ["birthDate", "joinDate", "tmtStartDate", "tmtEndDate"] as const;
    dateFields.forEach((field) => {
      const value = row[field]?.trim();
      if (value && !isValidDateString(value)) {
        addError(field, `Format ${field} harus YYYY-MM-DD`);
      }
    });

    const hasTmt = parseBoolean(row.hasTmt);
    const tmtStartDate = emptyToNull(row.tmtStartDate);
    const tmtEndDate = emptyToNull(row.tmtEndDate);
    if (hasTmt && tmtStartDate && tmtEndDate && new Date(tmtEndDate) < new Date(tmtStartDate)) {
      addError("tmtEndDate", "Tanggal akhir TMT tidak boleh lebih awal dari tanggal mulai TMT");
    }

    const employmentStatusName = emptyToNull(row.employmentStatusName);
    const employeeGroupName = emptyToNull(row.employeeGroupName);
    const professionGroupName = emptyToNull(row.professionGroupName);
    const employeePositionName = emptyToNull(row.employeePositionName);
    const employeeRankName = emptyToNull(row.employeeRankName);
    const workplaceName = emptyToNull(row.workplaceName);

    const employmentStatus = employmentStatusName ? employmentStatusByName.get(normalizeKey(employmentStatusName)) : null;
    const employeeGroup = employeeGroupName ? employeeGroupByName.get(normalizeKey(employeeGroupName)) : null;
    const professionGroup = professionGroupName ? professionGroupByName.get(normalizeKey(professionGroupName)) : null;
    const employeePosition = employeePositionName ? employeePositionByName.get(normalizeKey(employeePositionName)) : null;
    const employeeRank = employeeRankName ? employeeRankByName.get(normalizeKey(employeeRankName)) : null;
    const workplace = workplaceName ? workplaceByName.get(normalizeKey(workplaceName)) : null;

    if (employmentStatusName && !employmentStatus) addError("employmentStatusName", "Status kepegawaian tidak ditemukan");
    if (employeeGroupName && !employeeGroup) addError("employeeGroupName", "Jenis kepegawaian tidak ditemukan");
    if (professionGroupName && !professionGroup) addError("professionGroupName", "Kelompok profesi tidak ditemukan");
    if (employeePositionName && !employeePosition) addError("employeePositionName", "Jabatan tidak ditemukan");
    if (employeeRankName && !employeeRank) addError("employeeRankName", "Pangkat/golongan tidak ditemukan");
    if (workplaceName && !workplace) addError("workplaceName", "Tempat/unit tugas tidak ditemukan");

    if (employmentStatus && employeeGroup && employeeGroup.employmentStatusId !== employmentStatus.id) {
      addError("employeeGroupName", "Jenis kepegawaian tidak berada di bawah status kepegawaian yang dipilih");
    }

    if (professionGroup && employeePosition && employeePosition.professionGroupId !== professionGroup.id) {
      addError("employeePositionName", "Jabatan tidak berada di bawah kelompok profesi yang dipilih");
    }

    const candidate: CreateUserInput = {
      employeeId,
      nik,
      email,
      password: row.password?.trim() || "Pegawai123!",
      name: row.name?.trim(),
      role: roleValue,
      gender: emptyToNull(row.gender),
      birthDate: emptyToNull(row.birthDate),
      birthPlace: emptyToNull(row.birthPlace),
      academicDegree: emptyToNull(row.academicDegree),
      lastEducation: emptyToNull(row.lastEducation),
      religion: emptyToNull(row.religion),
      maritalStatus: emptyToNull(row.maritalStatus),
      phone: emptyToNull(row.phone),
      address: emptyToNull(row.address),
      joinDate: emptyToNull(row.joinDate),
      hasTmt,
      tmtStartDate: hasTmt ? tmtStartDate : null,
      tmtEndDate: hasTmt ? tmtEndDate : null,
      employmentStatusId: employmentStatus?.id || null,
      employeeGroupId: employeeGroup?.id || null,
      professionGroupId: professionGroup?.id || null,
      employeePositionId: employeePosition?.id || null,
      employeeRankId: employeeRank?.id || null,
      workplaceId: workplace?.id || null,
    };

    const parsed = createUserSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        (messages || []).forEach((message) => addError(field, message));
      });
      return;
    }

    prepared.push({
      ...parsed.data,
      role: parsed.data.role,
      passwordHash: "",
    });
  });

  const existingUsers = await repo.findUsersByUniqueFields({
    employeeIds: Array.from(seenEmployeeIds.keys()),
    emails: Array.from(seenEmails.keys()),
    niks: Array.from(seenNiks.keys()),
  });

  existingUsers.forEach((existing) => {
    const employeeRow = seenEmployeeIds.get(existing.employeeId);
    if (employeeRow) errors.push({ row: employeeRow, field: "employeeId", message: `NIP '${existing.employeeId}' sudah terdaftar` });

    const emailRow = seenEmails.get(normalizeKey(existing.email));
    if (emailRow) errors.push({ row: emailRow, field: "email", message: `Email '${existing.email}' sudah terdaftar` });

    if (existing.nik) {
      const nikRow = seenNiks.get(existing.nik);
      if (nikRow) errors.push({ row: nikRow, field: "nik", message: `NIK '${existing.nik}' sudah terdaftar` });
    }
  });

  if (errors.length > 0) {
    return {
      totalRows: rows.length,
      validRows: 0,
      createdCount: 0,
      errorCount: errors.length,
      errors: errors.sort((a, b) => a.row - b.row),
    };
  }

  const usersWithHash = await Promise.all(
    prepared.map(async (user) => ({
      ...user,
      passwordHash: await bcrypt.hash(user.password || "Pegawai123!", 10),
    }))
  );

  const createdCount = await repo.createUsersBulk(usersWithHash);

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "USERS_IMPORTED",
    resource: "/api/v1/users/import",
    ipAddress,
    status: "success",
    metadata: {
      totalRows: rows.length,
      createdCount,
      employeeIds: usersWithHash.map((user) => user.employeeId),
    },
  });

  return {
    totalRows: rows.length,
    validRows: rows.length,
    createdCount,
    errorCount: 0,
    errors: [],
  };
}
