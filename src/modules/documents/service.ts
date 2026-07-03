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

function formatAuditDate(date?: Date | null) {
  return date ? date.toISOString() : null;
}

function getNextVersionFromFilePath(filePath?: string | null) {
  const match = filePath?.match(/_v(\d+)\.[^.]+$/i);
  if (!match) return undefined;

  const version = Number(match[1]);
  return Number.isFinite(version) ? version + 1 : undefined;
}

async function generateStorageFileName(
  employeeId: string,
  category: string,
  docCode: string,
  originalExt: string,
  userId: string,
  documentTypeId: string,
  minimumVersion?: number
) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  // Hitung dokumen yang sudah ada untuk jenis ini untuk menentukan versi
  const existingCount = await prisma.documentRecord.count({
    where: {
      ownerId: userId,
      documentTypeId,
    },
  });
  
  const nextVersion = Math.max(existingCount + 1, minimumVersion ?? 1);
  const version = `v${nextVersion}`;
  
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

  let replacementAuditSnapshot: Record<string, unknown> | undefined;
  let oldFilePathToDelete: string | undefined;
  let minimumStorageVersion: number | undefined;

  if (input.replaceDocumentId) {
    const rejectedDocument = await findDocumentById(input.replaceDocumentId);
    if (!rejectedDocument) {
      throw new Error("Dokumen yang akan diganti tidak ditemukan");
    }
    if (rejectedDocument.ownerId !== input.ownerId) {
      throw new Error("Tidak memiliki akses untuk mengganti dokumen ini");
    }
    if (rejectedDocument.status !== DocumentStatus.REJECTED) {
      throw new Error("Hanya dokumen yang ditolak yang dapat diupload ulang");
    }
    if (rejectedDocument.documentTypeId !== input.documentTypeId) {
      throw new Error("Upload ulang harus menggunakan jenis dokumen yang sama");
    }

    const latestVerification = rejectedDocument.verificationHistories?.[0];
    oldFilePathToDelete = rejectedDocument.filePath;
    minimumStorageVersion = getNextVersionFromFilePath(rejectedDocument.filePath);
    replacementAuditSnapshot = {
      action: "REUPLOAD_REPLACED_REJECTED_DOCUMENT",
      oldDocument: {
        id: rejectedDocument.id,
        ownerId: rejectedDocument.ownerId,
        ownerName: rejectedDocument.owner?.name ?? null,
        employeeId: rejectedDocument.owner?.employeeId ?? null,
        documentTypeId: rejectedDocument.documentTypeId,
        documentTypeCode: rejectedDocument.documentType?.code ?? null,
        documentTypeName: rejectedDocument.documentType?.name ?? null,
        archiveCategory: rejectedDocument.documentType?.archiveCategory ?? null,
        status: rejectedDocument.status,
        fileName: rejectedDocument.fileName,
        filePath: rejectedDocument.filePath,
        documentNumber: rejectedDocument.documentNumber,
        issueDate: formatAuditDate(rejectedDocument.issueDate),
        expiryDate: formatAuditDate(rejectedDocument.expiryDate),
        uploadedAt: formatAuditDate(rejectedDocument.uploadedAt),
      },
      latestVerification: latestVerification
        ? {
            id: latestVerification.id,
            status: latestVerification.status,
            reviewNote: latestVerification.reviewNote,
            reviewedAt: formatAuditDate(latestVerification.reviewedAt),
            reviewedById: latestVerification.reviewedBy?.id ?? null,
            reviewedByName: latestVerification.reviewedBy?.name ?? null,
            reviewedByEmployeeId: latestVerification.reviewedBy?.employeeId ?? null,
          }
        : null,
    };
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

  // 4. Validasi metadata wajib sesuai konfigurasi jenis dokumen
  const documentNumber = input.documentNumber?.trim();
  if (docType.requiresDocumentNumber && !documentNumber) {
    throw new Error("Nomor surat wajib diisi untuk jenis dokumen ini");
  }

  if (docType.requiresIssueDate && !input.issueDate) {
    throw new Error("Tanggal terbit wajib diisi untuk jenis dokumen ini");
  }

  if (docType.requiresExpiryDate && !input.expiryDate) {
    throw new Error("Tanggal kedaluwarsa wajib diisi untuk jenis dokumen ini");
  }

  // 5. Generate nama file yang terstandarisasi
  const storageFileName = await generateStorageFileName(
    actor.employeeId,
    docType.archiveCategory,
    docType.code,
    ext,
    input.ownerId,
    input.documentTypeId,
    minimumStorageVersion
  );

  // 6. Simpan file fisik melalui StorageProvider
  const storage = getStorageProvider();
  const arrayBuffer = await input.file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const storageFolder = getDocumentTypeFolderName(docType.code);
  const storagePath = `${storageFolder}/${storageFileName}`;
  const uploadResult = await storage.uploadFile(buffer, storagePath, {
    contentType: input.file.type || undefined,
  });
  const filePath = uploadResult.storagePath;

  // 7. Simpan record di database
  const document = await createDocumentRecord({
    ownerId: input.ownerId,
    documentTypeId: input.documentTypeId,
    fileName: originalName,
    filePath,
    status: DocumentStatus.PENDING,
    documentNumber: documentNumber || null,
    issueDate: input.issueDate ? new Date(input.issueDate) : null,
    expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
  });

  // 8. Catat aktivitas
  await logActivity(
    {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      eventType: "DOCUMENT_UPLOADED",
      resource: `DocumentRecord:${document.id}`,
      ipAddress,
      status: "success",
      metadata: {
        fileName: document.fileName,
        docType: docType.code,
        replacedDocumentId: input.replaceDocumentId ?? null,
        replacementDeleted: Boolean(input.replaceDocumentId),
        uploadMode: input.replaceDocumentId ? "REUPLOAD_REPLACED_REJECTED" : "NEW_UPLOAD",
        newDocument: {
          id: document.id,
          fileName: document.fileName,
          filePath: document.filePath,
          status: document.status,
          uploadedAt: formatAuditDate(document.uploadedAt),
        },
        replacementSnapshot: replacementAuditSnapshot ?? null,
      },
    }
  );

  if (input.replaceDocumentId) {
    if (oldFilePathToDelete && oldFilePathToDelete !== filePath) {
      try {
        await storage.deleteFile(oldFilePathToDelete);
      } catch (error) {
        console.warn("Gagal menghapus file dokumen lama setelah upload ulang:", error);
      }
    }

    await deleteDocumentRecord(input.replaceDocumentId);
  }

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
