import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  employeeId: z
    .string()
    .min(3, "NIP / ID Pegawai minimal 3 karakter")
    .max(50, "NIP / ID Pegawai maksimal 50 karakter")
    .trim(),
  email: z.string().email("Format email tidak valid").trim(),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter")
    .trim(),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: "Role pengguna tidak valid" }),
  }),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  employmentStatusId: z.string().optional(),
  employeeGroupId: z.string().optional(),
  professionGroupId: z.string().optional(),
  employeePositionId: z.string().optional(),
  employeeRankId: z.string().optional(),
  workplaceId: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial();
