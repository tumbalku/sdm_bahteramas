import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  gender: z.string().optional(),
  birthDate: z.string().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
});
