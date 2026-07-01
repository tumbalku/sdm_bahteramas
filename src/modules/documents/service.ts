import { getStorageProvider } from "@/lib/storage";
import { DocumentUploadInput, DocumentFilterDto } from "./types";
import {
  createDocumentRecord,
  deleteDocumentRecord,
  findDocumentById,
  findDocuments,
  findDocumentTypeById,
} from "./repository";
import { prisma } from "@/lib/prisma";
import { parseAllowedFormats, slugifyFileName } from "@/lib/utils";
import { logActivity } from "@/lib/security-log";
import { DocumentStatus } from "@prisma/client";

function getDocumentTypeFolderName(docCode: string) {
  return docCode
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
}

async function generateStorageFileName(
  employeeId: string,
  category: string,
  docCode: string,
  originalExt: string,
  userId: string,
  documentTypeId: string
) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  // Hitung dokumen yang sudah ada untuk jenis ini untuk menentukan versi
  const existingCount = await prisma.documentRecord.count({
    where: {
      ownerId: userId,
      documentTypeId,
    },
  });
  
  const version = `v${existingCount + 1}`;
  
  const rawFileName = `${employeeId}_${category}_${docCode}_${dateStr}_${version}${originalExt}`;
  return slugifyFileName(rawFileName);
}

export async function uploadDocumentService(
  input: DocumentUploadInput,
  actor: { id: string; name: string; role: string; employeeId: string },
  ipAddress?: string
) {
  // 1. Dapatkan metadata jenis dokumen
  const docType = await findDocumentTypeById(input.documentTypeId);
  if (!docType) {
    throw new Error("Jenis dokumen tidak ditemukan");
  }

  // 2. Validasi file format
  const originalName = input.file.name;
  const ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
  const allowedFormats = parseAllowedFormats(docType.allowedFormats);
  
  // Karena `allowedFormats` mungkin hanya berisi "pdf", kita cek apakah ext (".pdf") termasuk
  const extWithoutDot = ext.replace(".", "");
  if (!allowedFormats.includes(extWithoutDot)) {
    throw new Error(`Format file tidak didukung. Harap unggah: ${docType.allowedFormats}`);
  }

  // 3. Validasi ukuran file
  const maxSizeInBytes = Math.round(docType.maxSizeMb * 1024 * 1024);
  if (input.file.size > maxSizeInBytes) {
    const formattedMax = docType.maxSizeMb < 1 ? `${Math.round(docType.maxSizeMb * 1024)} KB` : `${docType.maxSizeMb} MB`;
    throw new Error(`Ukuran file maksimal adalah ${formattedMax}`);
  }

  // 4. Generate nama file yang terstandarisasi
  const storageFileName = await generateStorageFileName(
    actor.employeeId,
    docType.archiveCategory,
    docType.code,
    ext,
    input.ownerId,
    input.documentTypeId
  );

  // 5. Simpan file fisik melalui StorageProvider
  const storage = getStorageProvider();
  const arrayBuffer = await input.file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const storageFolder = getDocumentTypeFolderName(docType.code);
  const storagePath = `${storageFolder}/${storageFileName}`;
  const filePath = await storage.uploadFile(buffer, storagePath);

  // 6. Simpan record di database
  const document = await createDocumentRecord({
    ownerId: input.ownerId,
    documentTypeId: input.documentTypeId,
    fileName: originalName,
    filePath,
    status: DocumentStatus.PENDING,
    issueDate: input.issueDate ? new Date(input.issueDate) : null,
    expiryDate: docType.requiresExpiryDate && input.expiryDate ? new Date(input.expiryDate) : null,
  });

  // 7. Catat aktivitas
  await logActivity(
    {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      eventType: "DOCUMENT_UPLOADED",
      resource: `DocumentRecord:${document.id}`,
      ipAddress,
      status: "success",
      metadata: { fileName: document.fileName, docType: docType.code },
    }
  );

  return document;
}

export async function getDocumentsService(
  filters: DocumentFilterDto,
  actor: { id: string; role: string }
) {
  // RBAC: EMPLOYEE & STAFF hanya bisa melihat dokumennya sendiri di "Dokumen Saya"
  if (actor.role !== "ADMIN") {
    filters.ownerId = actor.id;
  }

  return findDocuments(filters);
}

export async function deleteDocumentService(
  documentId: string,
  actor: { id: string; name: string; role: string },
  ipAddress?: string
) {
  const document = await findDocumentById(documentId);
  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  // RBAC rules:
  // EMPLOYEE & STAFF hanya bisa menghapus dokumen milik sendiri DAN statusnya bukan APPROVED
  if (actor.role === "EMPLOYEE" || actor.role === "STAFF") {
    if (document.ownerId !== actor.id) {
      throw new Error("Tidak memiliki akses untuk menghapus dokumen ini");
    }
    if (document.status === "APPROVED") {
      throw new Error("Tidak dapat menghapus dokumen yang sudah disetujui");
    }
  }
  // ADMIN boleh menghapus apapun

  // Hapus file fisik
  const storage = getStorageProvider();
  await storage.deleteFile(document.filePath);

  // Hapus dari database
  await deleteDocumentRecord(documentId);

  // Log activity
  await logActivity(
    {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      eventType: "DOCUMENT_DELETED",
      resource: `DocumentRecord:${document.id}`,
      ipAddress,
      status: "success",
      metadata: { fileName: document.fileName },
    }
  );

  return true;
}
