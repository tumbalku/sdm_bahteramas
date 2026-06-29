import { z } from "zod";
import { DocumentArchiveCategory } from "@prisma/client";

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
  allowedFormats: z
    .string()
    .min(1, "Format file diizinkan wajib diisi (contoh: pdf,jpg,png)"),
  maxSizeMb: z
    .number({ invalid_type_error: "Batas ukuran harus berupa angka" })
    .min(0.01, "Ukuran file minimal 10 KB")
    .max(100, "Ukuran file maksimal 100 MB"),
  icon: z.string().optional(),
  professionGroupIds: z.array(z.string()).optional().default([]),
});

export const updateDocumentTypeSchema = createDocumentTypeSchema.partial();
