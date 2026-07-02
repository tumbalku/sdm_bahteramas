import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { logActivity } from "@/lib/security-log";
import { AuthUser } from "@/lib/auth-utils";
import * as repo from "./repository";
import { CreateUserInput, ImportUserError, ImportUsersResult, UpdateUserInput, UserFilter, UserRecord } from "./types";
import { createUserSchema, updateUserSchema } from "./validation";

const IMPORT_HEADERS = [
  "employeeId",
  "nik",
  "email",
  "password",
  "name",
  "role",
  "gender",
  "birthDate",
  "academicDegree",
  "lastEducation",
  "religion",
  "maritalStatus",
  "phone",
  "address",
  "joinDate",
  "employmentStatusName",
  "employeeGroupName",
  "professionGroupName",
  "employeePositionName",
  "employeeRankName",
  "workplaceName",
  "hasTmt",
  "tmtStartDate",
  "tmtEndDate",
] as const;

const EXPORT_HEADERS = [
  ...IMPORT_HEADERS.filter((header) => header !== "password"),
  "createdAt",
] as const;

export async function getAllUsers(filters?: UserFilter): Promise<UserRecord[]> {
  return repo.findManyUsers(filters);
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim() || "";
  return trimmed ? trimmed : null;
}

function parseBoolean(value?: string): boolean {
  const normalized = normalizeKey(value || "");
  return ["true", "1", "yes", "ya", "y"].includes(normalized);
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(text: string): Record<string, string>[] {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });
}

function escapeCsvValue(value: unknown) {
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toDateOnly(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatDateTimeForFileName(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function createNameLookup<T extends { id: string; name: string }>(items: T[]) {
  const map = new Map<string, T>();
  items.forEach((item) => map.set(normalizeKey(item.name), item));
  return map;
}

function validateCsvHeaders(rowsText: string): ImportUserError[] {
  const firstLine = rowsText.replace(/^\uFEFF/, "").split(/\r?\n/).find((line) => line.trim());
  if (!firstLine) {
    return [{ row: 1, message: "File CSV kosong" }];
  }

  const headers = parseCsvLine(firstLine);
  const missingHeaders = IMPORT_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    return [{ row: 1, message: `Header CSV tidak lengkap: ${missingHeaders.join(", ")}` }];
  }

  return [];
}

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

export async function exportUsersCsvService(
  filters: UserFilter | undefined,
  actor: AuthUser,
  ipAddress?: string
) {
  const users = await getAllUsers(filters);
  const lines = [
    EXPORT_HEADERS.join(","),
    ...users.map((user) =>
      [
        user.employeeId,
        user.nik,
        user.email,
        user.name,
        user.role,
        user.gender,
        toDateOnly(user.birthDate),
        user.academicDegree,
        user.lastEducation,
        user.religion,
        user.maritalStatus,
        user.phone,
        user.address,
        toDateOnly(user.joinDate),
        user.employmentStatus?.name,
        user.employeeGroup?.name,
        user.professionGroup?.name,
        user.employeePosition?.name,
        user.employeeRank?.name,
        user.workplace?.name,
        user.hasTmt,
        toDateOnly(user.tmtStartDate),
        toDateOnly(user.tmtEndDate),
        user.createdAt.toISOString(),
      ].map(escapeCsvValue).join(",")
    ),
  ];

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "DATA_EXPORTED",
    resource: "/api/v1/users/export",
    ipAddress,
    status: "success",
    metadata: {
      entity: "users",
      format: "csv",
      rows: users.length,
      filters: filters || {},
    },
  });

  return {
    csv: lines.join("\n"),
    fileName: `smdp-users-${formatDateTimeForFileName()}.csv`,
    rowCount: users.length,
  };
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  return repo.findUserById(id);
}

export async function createUserService(
  input: CreateUserInput,
  actor: AuthUser
): Promise<UserRecord> {
  const validated = createUserSchema.parse(input);

  // Cek keunikan NIP (employeeId)
  const existingEmployeeId = await repo.findUserByEmployeeId(validated.employeeId);
  if (existingEmployeeId) {
    throw new Error(`NIP '${validated.employeeId}' sudah terdaftar`);
  }

  // Cek keunikan email
  const existingEmail = await repo.findUserByEmail(validated.email);
  if (existingEmail) {
    throw new Error(`Email '${validated.email}' sudah terdaftar`);
  }

  const rawPassword = validated.password || "Pegawai123!";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const result = await repo.createUser({
    ...validated,
    passwordHash,
  });

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "USER_CREATED",
    resource: `/api/v1/users/${result.id}`,
    status: "success",
    metadata: {
      employeeId: result.employeeId,
      name: result.name,
      role: result.role,
      hasTmt: result.hasTmt,
      tmtStartDate: result.tmtStartDate,
      tmtEndDate: result.tmtEndDate,
    },
  });

  return result;
}

export async function updateUserService(
  id: string,
  input: UpdateUserInput,
  actor: AuthUser
): Promise<UserRecord> {
  const validated = updateUserSchema.parse(input);

  const existing = await repo.findUserById(id);
  if (!existing) {
    throw new Error("Pegawai tidak ditemukan");
  }

  if (validated.employeeId && validated.employeeId !== existing.employeeId) {
    const existingEmployeeId = await repo.findUserByEmployeeId(validated.employeeId);
    if (existingEmployeeId) {
      throw new Error(`NIP '${validated.employeeId}' sudah terdaftar`);
    }
  }

  if (validated.email && validated.email !== existing.email) {
    const existingEmail = await repo.findUserByEmail(validated.email);
    if (existingEmail) {
      throw new Error(`Email '${validated.email}' sudah terdaftar`);
    }
  }

  let passwordHash: string | undefined;
  if (validated.password) {
    passwordHash = await bcrypt.hash(validated.password, 10);
  }

  const result = await repo.updateUser(id, {
    ...validated,
    ...(passwordHash && { passwordHash }),
  });

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "USER_UPDATED",
    resource: `/api/v1/users/${id}`,
    status: "success",
    metadata: {
      employeeId: result.employeeId,
      name: result.name,
      hasTmt: result.hasTmt,
      tmtStartDate: result.tmtStartDate,
      tmtEndDate: result.tmtEndDate,
    },
  });

  return result;
}

export async function deleteUserService(
  id: string,
  actor: AuthUser
): Promise<boolean> {
  if (id === actor.id) {
    throw new Error("Anda tidak dapat menghapus akun Anda sendiri");
  }

  const existing = await repo.findUserById(id);
  if (!existing) {
    throw new Error("Pegawai tidak ditemukan");
  }

  await repo.deleteUser(id);

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "USER_DELETED",
    resource: `/api/v1/users/${id}`,
    status: "success",
    metadata: { employeeId: existing.employeeId, name: existing.name },
  });

  return true;
}
