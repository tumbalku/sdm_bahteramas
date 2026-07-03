import { z } from "zod";
import { DocumentArchiveCategory, DocumentStatus } from "@prisma/client";

export const createDocumentTypeSchema = z.object({
  code: z
    .string()
    .min(2, "Kode dokumen minimal 2 karakter")
    .max(20, "Kode dokumen maksimal 20 karakter")
    .transform((val) => val.toUpperCase().trim()),
  name: z
    .string()
    .min(3, "Nama dokumen minimal 3 karakter")
    .max(100, "Nama dokumen maksimal 100 karakter")
    .trim(),
  description: z.string().optional(),
  archiveCategory: z.nativeEnum(DocumentArchiveCategory, {
    errorMap: () => ({ message: "Kategori arsip tidak valid" }),
  }),
  isMandatory: z.boolean().default(false),
  requiresExpiryDate: z.boolean().default(false),
  requiresIssueDate: z.boolean().default(false),
  requiresDocumentNumber: z.boolean().default(false),
  allowedFormats: z
    .string()
    .min(1, "Format file diizinkan wajib diisi (contoh: pdf,jpg,png)"),
  maxSizeMb: z
    .number({ invalid_type_error: "Batas ukuran harus berupa angka" })
    .min(0.01, "Ukuran file minimal 10 KB")
    .max(100, "Ukuran file maksimal 100 MB"),
  icon: z.string().optional(),
  professionGroupIds: z.array(z.string()).optional().default([]),
  employmentStatusIds: z.array(z.string()).optional().default([]),
  employeeGroupIds: z.array(z.string()).optional().default([]),
  employeeRankIds: z.array(z.string()).optional().default([]),
  workplaceIds: z.array(z.string()).optional().default([]),
});

export const updateDocumentTypeSchema = createDocumentTypeSchema.partial();

const optionalDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
  .optional();

export const documentArchiveFilterSchema = z.object({
  search: z.string().trim().optional(),
  archiveCategory: z.nativeEnum(DocumentArchiveCategory).optional(),
  documentTypeId: z.string().optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  uploadStatus: z.enum(["UPLOADED", "MISSING"]).optional(),
  employmentStatusId: z.string().optional(),
  employeeGroupId: z.string().optional(),
  professionGroupId: z.string().optional(),
  employeePositionId: z.string().optional(),
  employeeRankId: z.string().optional(),
  workplaceId: z.string().optional(),
  issueDateFrom: optionalDateString,
  issueDateTo: optionalDateString,
  expiryDateFrom: optionalDateString,
  expiryDateTo: optionalDateString,
  uploadedAtFrom: optionalDateString,
  uploadedAtTo: optionalDateString,
});
