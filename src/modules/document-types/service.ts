import { logActivity } from "@/lib/security-log";
import type { AuthUser } from "@/lib/auth-utils";
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
import {
  buildDocumentArchiveCsvContent,
  formatDateTimeForFileName,
  getDocumentTypeFolderName,
  rowPassesDocumentFilters,
} from "./utils";

import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";

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

export async function getDocumentArchiveRecapService(filters: DocumentArchiveFilter = {}): Promise<DocumentArchiveRecap> {
  const employees = await repo.findArchiveEmployees(filters);

  if (filters.uploadStatus === "UPLOADED") {
    const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
    const documents = await repo.findUploadedArchiveDocuments(
      employees.map((employee) => employee.id),
      filters
    );

    const rows: DocumentArchiveRow[] = documents
      .map((document) => {
        const employee = employeeById.get(document.ownerId);
        if (!employee) return null;

        const documentType = {
          ...document.documentType,
          targetProfessions: document.documentType.documentProfessions?.map((dp: any) => ({
            id: dp.professionGroup.id,
            name: dp.professionGroup.name,
          })) || [],
          targetStatuses: document.documentType.documentStatuses?.map((ds: any) => ({
            id: ds.employmentStatus.id,
            name: ds.employmentStatus.name,
          })) || [],
          targetGroups: document.documentType.documentGroups?.map((dg: any) => ({
            id: dg.employeeGroup.id,
            name: dg.employeeGroup.name,
          })) || [],
          targetRanks: document.documentType.documentRanks?.map((dr: any) => ({
            id: dr.employeeRank.id,
            name: dr.employeeRank.name,
          })) || [],
          targetWorkplaces: document.documentType.documentWorkplaces?.map((dw: any) => ({
            id: dw.workplace.id,
            name: dw.workplace.name,
          })) || [],
        };

        const row: DocumentArchiveRow = {
          key: document.id,
          uploadStatus: "UPLOADED",
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
          document: {
            id: document.id,
            fileName: document.fileName,
            filePath: document.filePath,
            documentNumber: document.documentNumber,
            issueDate: document.issueDate,
            expiryDate: document.expiryDate,
            uploadedAt: document.uploadedAt,
            status: document.status,
            latestReviewNote: document.verificationHistories[0]?.reviewNote ?? null,
          },
          status: document.status,
        };

        return rowPassesDocumentFilters(row, filters) ? row : null;
      })
      .filter((row): row is DocumentArchiveRow => row !== null);

    const approved = rows.filter((row) => row.status === DocumentStatus.APPROVED).length;
    const pending = rows.filter((row) => row.status === DocumentStatus.PENDING).length;
    const rejected = rows.filter((row) => row.status === DocumentStatus.REJECTED).length;

    return {
      rows,
      stats: {
        totalRequired: rows.length,
        uploaded: rows.length,
        approved,
        pending,
        rejected,
        missing: 0,
        percentage: rows.length > 0 ? 100 : 0,
        employeeCount: new Set(rows.map((row) => row.employee.id)).size,
        documentTypeCount: new Set(rows.map((row) => row.documentType.id)).size,
      },
      generatedAt: new Date().toISOString(),
      filters,
    };
  }

  const documentTypes = await repo.findMandatoryArchiveDocumentTypes(filters);

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
