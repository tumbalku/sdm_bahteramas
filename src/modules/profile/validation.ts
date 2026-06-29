import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nik: z.string().nullable().optional(),
  gender: z.string().optional(),
  birthDate: z.string().nullable().optional(),
  academicDegree: z.string().nullable().optional(),
  lastEducation: z.string().nullable().optional(),
  religion: z.string().nullable().optional(),
  maritalStatus: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
});
