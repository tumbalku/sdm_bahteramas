import { z } from "zod";
import { DocumentArchiveCategory, DocumentStatus } from "@prisma/client";

// Skema untuk input form upload (sebelum file diproses)
export const uploadDocumentSchema = z.object({
  documentTypeId: z.string().min(1, "Jenis dokumen wajib dipilih"),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

// Skema untuk query string filter dokumen
export const getDocumentsSchema = z.object({
  ownerId: z.string().optional(),
  archiveCategory: z.nativeEnum(DocumentArchiveCategory).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
});
