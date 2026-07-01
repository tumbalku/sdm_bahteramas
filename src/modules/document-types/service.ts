import { logActivity } from "@/lib/security-log";
import { AuthUser } from "@/lib/auth-utils";
import { getStorageProvider } from "@/lib/storage";
import * as repo from "./repository";
import {
  CreateDocumentTypeInput,
  DocumentTypeFilter,
  DocumentTypeRecord,
  UpdateDocumentTypeInput,
} from "./types";
import { createDocumentTypeSchema, updateDocumentTypeSchema } from "./validation";

import { prisma } from "@/lib/prisma";

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
