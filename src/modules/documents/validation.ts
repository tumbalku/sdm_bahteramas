import { z } from "zod";
import { DocumentArchiveCategory, DocumentStatus } from "@prisma/client";

// Skema untuk input form upload (sebelum file diproses)
export const uploadDocumentSchema = z.object({
  documentTypeId: z.string().min(1, "Jenis dokumen wajib dipilih"),
  issueDate: z.string().nullable().optional().or(z.literal("")),
  expiryDate: z.string().nullable().optional().or(z.literal("")),
});

// Skema untuk query string filter dokumen
export const getDocumentsSchema = z.object({
  ownerId: z.string().optional(),
  archiveCategory: z.nativeEnum(DocumentArchiveCategory).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  search: z.string().optional(),
  employmentStatusId: z.string().optional(),
  employeeGroupId: z.string().optional(),
  professionGroupId: z.string().optional(),
  employeePositionId: z.string().optional(),
});
