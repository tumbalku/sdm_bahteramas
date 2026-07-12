import fs from "node:fs/promises";
import path from "node:path";
import { Role } from "@prisma/client";
import { logActivity } from "@/lib/security-log";
import { getStorageProvider } from "@/lib/storage";
import type { AuthUser } from "@/lib/auth-utils";
import { isDocumentTypeApplicableToUser } from "@/modules/document-types/service";
import * as repo from "./repository";
import type { UserFilter } from "./types";
import {
  EMPLOYEE_DOCUMENT_EXPORT_HEADERS,
  EXPORT_HEADERS,
  escapeCsvValue,
  formatDateTimeForFileName,
  formatDocumentStatusLabel,
  toDateOnly,
} from "./utils";
import { buildEmployeeProfilePdf } from "./pdf";

export async function exportUsersCsvService(
  filters: UserFilter | undefined,
  actor: AuthUser,
  ipAddress?: string
) {
  const users = await repo.findManyUsers(filters);
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
        user.birthPlace,
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

export async function exportUserDocumentsCsvService(
  userId: string,
  actor: AuthUser,
  ipAddress?: string
) {
  const source = await repo.findUserDocumentExportSource(userId);

  if (!source.user) {
    throw new Error("Pegawai tidak ditemukan");
  }

  const userProfile = {
    employmentStatusId: source.user.employmentStatusId,
    employeeGroupId: source.user.employeeGroupId,
    professionGroupId: source.user.professionGroupId,
    employeeRankId: source.user.employeeRankId,
    workplaceId: source.user.workplaceId,
  };

  const relevantDocumentTypes = source.documentTypes.filter((documentType) =>
    isDocumentTypeApplicableToUser(documentType, userProfile)
  );

  const latestDocumentByType = new Map<string, (typeof source.documents)[number]>();
  source.documents.forEach((document) => {
    if (!latestDocumentByType.has(document.documentTypeId)) {
      latestDocumentByType.set(document.documentTypeId, document);
    }
  });

  const rows = relevantDocumentTypes.map((documentType) => {
    const document = latestDocumentByType.get(documentType.id);
    const latestVerification = document?.verificationHistories?.[0];

    return [
      documentType.name,
      documentType.code,
      documentType.archiveCategory,
      document ? "Sudah Upload" : "Belum Upload",
      formatDocumentStatusLabel(document?.status),
      document?.documentNumber || "-",
      toDateOnly(document?.issueDate) || "-",
      toDateOnly(document?.expiryDate) || "-",
      toDateOnly(document?.uploadedAt) || "-",
      document?.fileName || "-",
      latestVerification?.reviewNote || "-",
    ].map(escapeCsvValue).join(",");
  });

  const csv = `\uFEFF${[
    EMPLOYEE_DOCUMENT_EXPORT_HEADERS.map(escapeCsvValue).join(","),
    ...rows,
  ].join("\n")}`;

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "DATA_EXPORTED",
    resource: `/api/v1/users/${userId}/documents/export`,
    ipAddress,
    status: "success",
    metadata: {
      entity: "employee-documents",
      scope: "EMPLOYEE_DOCUMENTS",
      format: "csv",
      ownerId: source.user.id,
      employeeId: source.user.employeeId,
      employeeName: source.user.name,
      rowCount: rows.length,
    },
  });

  return {
    csv,
    fileName: `dokumen-pegawai-${source.user.employeeId}-${formatDateTimeForFileName()}.csv`,
    rowCount: rows.length,
  };
}

function formatOptionalDate(value: Date | string | null | undefined) {
  return toDateOnly(value) || "-";
}

function formatRoleLabel(role: Role) {
  const labels: Record<Role, string> = {
    ADMIN: "Administrator",
    STAFF: "Staf Verifikator",
    EMPLOYEE: "Pegawai",
  };
  return labels[role] || role;
}

function formatGenderLabel(value?: string | null) {
  if (value === "L") return "Laki-laki";
  if (value === "P") return "Perempuan";
  return "-";
}

async function loadProfileImage(avatarUrl?: string | null) {
  try {
    if (!avatarUrl) return undefined;
    const fileName = new URL(avatarUrl, "http://localhost").searchParams.get("file");
    if (!fileName) return undefined;
    const file = await getStorageProvider().getFile(fileName);
    return { buffer: file.buffer, contentType: file.contentType };
  } catch {
    return undefined;
  }
}

export async function exportUserProfilePdfService(
  userId: string,
  actor: AuthUser,
  ipAddress?: string
) {
  return buildUserProfilePdfExport(userId, actor, ipAddress, {
    resource: `/api/v1/users/${userId}/profile/export-pdf`,
    scope: "EMPLOYEE_PROFILE_PDF",
    fileNamePrefix: "profil-pegawai",
  });
}

export async function exportOwnUserProfilePdfService(
  actor: AuthUser,
  ipAddress?: string
) {
  return buildUserProfilePdfExport(actor.id, actor, ipAddress, {
    resource: "/api/v1/profile/export-pdf",
    scope: "OWN_PROFILE_PDF",
    fileNamePrefix: "profil-saya",
  });
}

async function buildUserProfilePdfExport(
  userId: string,
  actor: AuthUser,
  ipAddress: string | undefined,
  options: {
    resource: string;
    scope: "EMPLOYEE_PROFILE_PDF" | "OWN_PROFILE_PDF";
    fileNamePrefix: string;
  }
) {
  const [profile, source] = await Promise.all([
    repo.findUserById(userId),
    repo.findUserDocumentExportSource(userId),
  ]);

  if (!profile || !source.user) {
    throw new Error("Pegawai tidak ditemukan");
  }

  const userProfile = {
    employmentStatusId: source.user.employmentStatusId,
    employeeGroupId: source.user.employeeGroupId,
    professionGroupId: source.user.professionGroupId,
    employeeRankId: source.user.employeeRankId,
    workplaceId: source.user.workplaceId,
  };

  const relevantDocumentTypes = source.documentTypes.filter((documentType) =>
    isDocumentTypeApplicableToUser(documentType, userProfile)
  );

  const latestDocumentByType = new Map<string, (typeof source.documents)[number]>();
  source.documents.forEach((document) => {
    if (!latestDocumentByType.has(document.documentTypeId)) {
      latestDocumentByType.set(document.documentTypeId, document);
    }
  });

  const documentRows = relevantDocumentTypes.map((documentType) => {
    const document = latestDocumentByType.get(documentType.id);
    return {
      cells: [
        documentType.name,
        document?.documentNumber || "-",
        documentType.archiveCategory,
        document ? formatDocumentStatusLabel(document.status) : "Belum Upload",
        formatOptionalDate(document?.issueDate),
        formatOptionalDate(document?.expiryDate),
      ],
    };
  });

  const [logoBuffer, avatar] = await Promise.all([
    fs.readFile(path.join(process.cwd(), "public", "logo.png")).catch(() => undefined),
    loadProfileImage(profile.avatarUrl),
  ]);

  const pdf = await buildEmployeeProfilePdf({
    title: "Preview Profil Pegawai",
    subtitle: `${profile.name} - ${profile.employeeId}`,
    generatedAt: new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" }),
    verificationText: `SMDP-${profile.employeeId}-${profile.updatedAt.toISOString()}`,
    logo: logoBuffer ? { buffer: logoBuffer, contentType: "image/png" } : undefined,
    avatar,
    badges: [
      formatRoleLabel(profile.role),
      profile.employmentStatus?.name || "Status belum diatur",
      profile.employeeGroup?.name || "Golongan belum diatur",
      profile.hasTmt ? "TMT Aktif" : "Tanpa TMT",
    ],
    identity: [
      ["Nama Lengkap", profile.name],
      ["NIP", profile.employeeId],
      ...(profile.hasOldEmployeeId ? [["NIP Lama", profile.oldEmployeeId || "-"] as [string, string]] : []),
      ["NIK", profile.nik || "-"],
      ["Email", profile.email],
      ["Telepon", profile.phone || "-"],
      ["Role Akses", formatRoleLabel(profile.role)],
    ],
    profileSections: [
      {
        title: "Biodata",
        rows: [
          ["Gelar Akademik", profile.academicDegree || "-"],
          ["Jenis Kelamin", formatGenderLabel(profile.gender)],
          ["Tempat Lahir", profile.birthPlace || "-"],
          ["Tanggal Lahir", formatOptionalDate(profile.birthDate)],
          ["Agama", profile.religion || "-"],
          ["Status Pernikahan", profile.maritalStatus || "-"],
          ["Pendidikan Terakhir", profile.lastEducation || "-"],
          ["Alamat", profile.address || "-"],
        ],
      },
      {
        title: "Kepegawaian",
        rows: [
          ["Tmt mulai", formatOptionalDate(profile.joinDate)],
          ["Status Kepegawaian", profile.employmentStatus?.name || "-"],
          ["Jenis/Golongan Pegawai", profile.employeeGroup?.name || "-"],
          ["Kelompok Profesi", profile.professionGroup?.name || "-"],
          ["Jabatan", profile.employeePosition?.name || "-"],
          ["Pangkat/Golongan", profile.employeeRank?.name || "-"],
          ["Unit Kerja", profile.workplace?.name || "-"],
          ["Memiliki TMT", profile.hasTmt ? "Ya" : "Tidak"],
          ["TMT Awal", formatOptionalDate(profile.tmtStartDate)],
          ["TMT Akhir/Kontrak", formatOptionalDate(profile.tmtEndDate)],
        ],
      },
    ],
    documentRows,
  });

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "DATA_EXPORTED",
    resource: options.resource,
    ipAddress,
    status: "success",
    metadata: {
      entity: "employee-profile",
      scope: options.scope,
      format: "pdf",
      ownerId: profile.id,
      employeeId: profile.employeeId,
      employeeName: profile.name,
      rowCount: documentRows.length,
    },
  });

  return {
    pdf,
    fileName: `${options.fileNamePrefix}-${profile.employeeId}-${formatDateTimeForFileName()}.pdf`,
    rowCount: documentRows.length,
  };
}
