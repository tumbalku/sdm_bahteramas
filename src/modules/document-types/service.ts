import { logActivity } from "@/lib/security-log";
import { AuthUser } from "@/lib/auth-utils";
import { getStorageProvider } from "@/lib/storage";
import * as repo from "./repository";
import {
  CreateDocumentTypeInput,
  DocumentArchiveFilter,
  DocumentArchiveRecap,
  DocumentArchiveExportResult,
  DocumentArchiveRow,
  DocumentTypeFilter,
  DocumentTypeRecord,
  UpdateDocumentTypeInput,
} from "./types";
import { createDocumentTypeSchema, updateDocumentTypeSchema } from "./validation";

import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";

function getDocumentTypeFolderName(docCode: string) {
  return docCode
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
}

export function isDocumentTypeApplicableToUser(docType: DocumentTypeRecord, userProfile: any): boolean {
  if (!userProfile) return true;

  // 1. Status Kepegawaian (ASN, Non ASN, dll)
  if (docType.targetStatuses && docType.targetStatuses.length > 0) {
    if (!userProfile.employmentStatusId || !docType.targetStatuses.some((s) => s.id === userProfile.employmentStatusId)) {
      return false;
    }
  }

  // 2. Jenis Kepegawaian (PNS, PPPK, BLUD, dll)
  if (docType.targetGroups && docType.targetGroups.length > 0) {
    if (!userProfile.employeeGroupId || !docType.targetGroups.some((g) => g.id === userProfile.employeeGroupId)) {
      return false;
    }
  }

  // 3. Kelompok Profesi (Medis, Keperawatan, dll)
  if (docType.targetProfessions && docType.targetProfessions.length > 0) {
    if (!userProfile.professionGroupId || !docType.targetProfessions.some((p) => p.id === userProfile.professionGroupId)) {
      return false;
    }
  }

  // 4. Pangkat / Golongan
  if (docType.targetRanks && docType.targetRanks.length > 0) {
    if (!userProfile.employeeRankId || !docType.targetRanks.some((r) => r.id === userProfile.employeeRankId)) {
      return false;
    }
  }

  // 5. Tempat / Unit Tugas
  if (docType.targetWorkplaces && docType.targetWorkplaces.length > 0) {
    if (!userProfile.workplaceId || !docType.targetWorkplaces.some((w) => w.id === userProfile.workplaceId)) {
      return false;
    }
  }

  return true;
}

export async function getAllDocumentTypes(
  filters?: DocumentTypeFilter,
  currentUser?: AuthUser | null
): Promise<DocumentTypeRecord[]> {
  const allTypes = await repo.findManyDocumentTypes(filters);

  if (filters?.forUser && currentUser) {
    const userProfile = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        employmentStatusId: true,
        employeeGroupId: true,
        professionGroupId: true,
        employeeRankId: true,
        workplaceId: true,
      },
    });

    if (userProfile) {
      return allTypes.filter((docType) => isDocumentTypeApplicableToUser(docType, userProfile));
    }
  }

  return allTypes;
}

export async function getDocumentTypeById(
  id: string
): Promise<DocumentTypeRecord | null> {
  return repo.findDocumentTypeById(id);
}

export async function createDocumentTypeService(
  input: CreateDocumentTypeInput,
  actor: AuthUser
): Promise<DocumentTypeRecord> {
  const validated = createDocumentTypeSchema.parse(input);

  // Cek keunikan kode
  const existingCode = await repo.findDocumentTypeByCode(validated.code);
  if (existingCode) {
    throw new Error(`Kode jenis dokumen '${validated.code}' sudah digunakan`);
  }

  await getStorageProvider().ensureFolder(getDocumentTypeFolderName(validated.code));

  const result = await repo.createDocumentType(validated);

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "DOCUMENT_TYPE_CREATED",
    resource: `/api/v1/document-types/${result.id}`,
    status: "success",
    metadata: { code: result.code, name: result.name },
  });

  return result;
}

export async function updateDocumentTypeService(
  id: string,
  input: UpdateDocumentTypeInput,
  actor: AuthUser
): Promise<DocumentTypeRecord> {
  const validated = updateDocumentTypeSchema.parse(input);

  const existing = await repo.findDocumentTypeById(id);
  if (!existing) {
    throw new Error("Jenis dokumen tidak ditemukan");
  }

  if (validated.code && validated.code !== existing.code) {
    const existingCode = await repo.findDocumentTypeByCode(validated.code);
    if (existingCode) {
      throw new Error(`Kode jenis dokumen '${validated.code}' sudah digunakan`);
    }

    await getStorageProvider().ensureFolder(getDocumentTypeFolderName(validated.code));
  }

  const result = await repo.updateDocumentType(id, validated);

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "DOCUMENT_TYPE_UPDATED",
    resource: `/api/v1/document-types/${id}`,
    status: "success",
    metadata: { code: result.code, name: result.name },
  });

  return result;
}

export async function deleteDocumentTypeService(
  id: string,
  actor: AuthUser
): Promise<boolean> {
  const existing = await repo.findDocumentTypeById(id);
  if (!existing) {
    throw new Error("Jenis dokumen tidak ditemukan");
  }

  await repo.deleteDocumentType(id);

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "DOCUMENT_TYPE_DELETED",
    resource: `/api/v1/document-types/${id}`,
    status: "success",
    metadata: { code: existing.code, name: existing.name },
  });

  return true;
}

function toStartOfDay(date?: string) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toEndOfDay(date?: string) {
  if (!date) return null;
  const parsed = new Date(`${date}T23:59:59.999Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isWithinDateRange(value: Date | null | undefined, from?: Date | null, to?: Date | null) {
  if (!from && !to) return true;
  if (!value) return false;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

function hasDateFilters(filters: DocumentArchiveFilter) {
  return Boolean(
    filters.issueDateFrom ||
      filters.issueDateTo ||
      filters.expiryDateFrom ||
      filters.expiryDateTo ||
      filters.uploadedAtFrom ||
      filters.uploadedAtTo
  );
}

function formatDateOnly(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatDateTimeForFileName(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function formatStatusLabel(status?: DocumentStatus | null) {
  if (status === DocumentStatus.APPROVED) return "Disetujui";
  if (status === DocumentStatus.REJECTED) return "Ditolak";
  if (status === DocumentStatus.PENDING) return "Menunggu";
  return "Belum Upload";
}

function escapeCsvValue(value: unknown) {
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function rowPassesDocumentFilters(row: DocumentArchiveRow, filters: DocumentArchiveFilter) {
  if (filters.uploadStatus && row.uploadStatus !== filters.uploadStatus) return false;
  if (filters.status && row.status !== filters.status) return false;

  if (hasDateFilters(filters)) {
    if (!row.document) return false;

    if (!isWithinDateRange(row.document.issueDate, toStartOfDay(filters.issueDateFrom), toEndOfDay(filters.issueDateTo))) {
      return false;
    }
    if (!isWithinDateRange(row.document.expiryDate, toStartOfDay(filters.expiryDateFrom), toEndOfDay(filters.expiryDateTo))) {
      return false;
    }
    if (!isWithinDateRange(row.document.uploadedAt, toStartOfDay(filters.uploadedAtFrom), toEndOfDay(filters.uploadedAtTo))) {
      return false;
    }
  }

  return true;
}

export async function getDocumentArchiveRecapService(filters: DocumentArchiveFilter = {}): Promise<DocumentArchiveRecap> {
  const [employees, documentTypes] = await Promise.all([
    repo.findArchiveEmployees(filters),
    repo.findMandatoryArchiveDocumentTypes(filters),
  ]);

  const documents = await repo.findArchiveDocuments(
    employees.map((employee) => employee.id),
    documentTypes.map((documentType) => documentType.id)
  );

  const latestDocumentByPair = new Map<string, (typeof documents)[number]>();
  documents.forEach((document) => {
    const key = `${document.ownerId}:${document.documentTypeId}`;
    if (!latestDocumentByPair.has(key)) {
      latestDocumentByPair.set(key, document);
    }
  });

  const rows: DocumentArchiveRow[] = [];

  employees.forEach((employee) => {
    const userProfile = {
      employmentStatusId: employee.employmentStatusId,
      employeeGroupId: employee.employeeGroupId,
      professionGroupId: employee.professionGroupId,
      employeeRankId: employee.employeeRankId,
      workplaceId: employee.workplaceId,
    };

    documentTypes.forEach((documentType) => {
      if (!isDocumentTypeApplicableToUser(documentType, userProfile)) return;

      const key = `${employee.id}:${documentType.id}`;
      const document = latestDocumentByPair.get(key);
      const row: DocumentArchiveRow = {
        key,
        uploadStatus: document ? "UPLOADED" : "MISSING",
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          name: employee.name,
          avatarUrl: employee.avatarUrl,
          employmentStatusName: employee.employmentStatus?.name ?? null,
          employeeGroupName: employee.employeeGroup?.name ?? null,
          professionGroupName: employee.professionGroup?.name ?? null,
          employeePositionName: employee.employeePosition?.name ?? null,
          employeeRankName: employee.employeeRank?.name ?? null,
          workplaceName: employee.workplace?.name ?? null,
        },
        documentType: {
          id: documentType.id,
          code: documentType.code,
          name: documentType.name,
          archiveCategory: documentType.archiveCategory,
        },
        document: document
          ? {
              id: document.id,
              fileName: document.fileName,
              filePath: document.filePath,
              documentNumber: document.documentNumber,
              issueDate: document.issueDate,
              expiryDate: document.expiryDate,
              uploadedAt: document.uploadedAt,
              status: document.status,
              latestReviewNote: document.verificationHistories[0]?.reviewNote ?? null,
            }
          : null,
        status: document?.status ?? null,
      };

      if (rowPassesDocumentFilters(row, filters)) {
        rows.push(row);
      }
    });
  });

  const uploaded = rows.filter((row) => row.uploadStatus === "UPLOADED").length;
  const approved = rows.filter((row) => row.status === DocumentStatus.APPROVED).length;
  const pending = rows.filter((row) => row.status === DocumentStatus.PENDING).length;
  const rejected = rows.filter((row) => row.status === DocumentStatus.REJECTED).length;
  const missing = rows.filter((row) => row.uploadStatus === "MISSING").length;
  const totalRequired = rows.length;

  return {
    rows,
    stats: {
      totalRequired,
      uploaded,
      approved,
      pending,
      rejected,
      missing,
      percentage: totalRequired > 0 ? Math.round((uploaded / totalRequired) * 100) : 0,
      employeeCount: new Set(rows.map((row) => row.employee.id)).size,
      documentTypeCount: new Set(rows.map((row) => row.documentType.id)).size,
    },
    generatedAt: new Date().toISOString(),
    filters,
  };
}

function buildDocumentArchiveCsvContent(recap: DocumentArchiveRecap) {
  const headers = [
    "NIP",
    "Nama Pegawai",
    "Unit Kerja",
    "Profesi",
    "Status Kepegawaian",
    "Jenis Pegawai",
    "Jenis Dokumen",
    "Kode Dokumen",
    "Kategori Arsip",
    "Status Upload",
    "Status Verifikasi",
    "Nomor Surat",
    "Tanggal Terbit",
    "Tanggal Kedaluwarsa",
    "Tanggal Upload",
    "Nama File",
    "Catatan Terakhir",
  ];

  const dataRows = recap.rows
    .map((row) => {
      const values = [
        row.employee.employeeId,
        row.employee.name,
        row.employee.workplaceName,
        row.employee.professionGroupName,
        row.employee.employmentStatusName,
        row.employee.employeeGroupName,
        row.documentType.name,
        row.documentType.code,
        row.documentType.archiveCategory,
        row.uploadStatus === "UPLOADED" ? "Sudah Upload" : "Belum Upload",
        formatStatusLabel(row.status),
        row.document?.documentNumber,
        formatDateOnly(row.document?.issueDate),
        formatDateOnly(row.document?.expiryDate),
        formatDateOnly(row.document?.uploadedAt),
        row.document?.fileName,
        row.document?.latestReviewNote,
      ];

      return values.map(escapeCsvValue).join(",");
    });

  return `\uFEFF${[
    headers.map(escapeCsvValue).join(","),
    ...dataRows,
  ].join("\n")}`;
}

export async function exportDocumentArchiveRecapService(
  filters: DocumentArchiveFilter,
  actor: AuthUser,
  ipAddress?: string
): Promise<DocumentArchiveExportResult> {
  const recap = await getDocumentArchiveRecapService(filters);
  const content = buildDocumentArchiveCsvContent(recap);

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "DATA_EXPORTED",
    resource: "/api/v1/document-types/archives/export",
    ipAddress,
    status: "success",
    metadata: {
      entity: "document-archives",
      format: "csv",
      rows: recap.rows.length,
      stats: recap.stats,
      filters,
    },
  });

  return {
    content,
    fileName: `smdp-rekap-arsip-dokumen-${formatDateTimeForFileName()}.csv`,
    rowCount: recap.rows.length,
  };
}
