import { logActivity } from "@/lib/security-log";
import { AuthUser } from "@/lib/auth-utils";
import * as repo from "./repository";
import {
  CreateDocumentTypeInput,
  DocumentTypeFilter,
  DocumentTypeRecord,
  UpdateDocumentTypeInput,
} from "./types";
import { createDocumentTypeSchema, updateDocumentTypeSchema } from "./validation";

export async function getAllDocumentTypes(
  filters?: DocumentTypeFilter
): Promise<DocumentTypeRecord[]> {
  return repo.findManyDocumentTypes(filters);
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
