import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  employeeId: z
    .string()
    .min(3, "NIP / ID Pegawai minimal 3 karakter")
    .max(50, "NIP / ID Pegawai maksimal 50 karakter")
    .trim(),
  nik: z.string().optional().nullable(),
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
  gender: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  academicDegree: z.string().optional().nullable(),
  lastEducation: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  joinDate: z.string().optional().nullable(),
  employmentStatusId: z.string().optional().nullable(),
  employeeGroupId: z.string().optional().nullable(),
  professionGroupId: z.string().optional().nullable(),
  employeePositionId: z.string().optional().nullable(),
  employeeRankId: z.string().optional().nullable(),
  workplaceId: z.string().optional().nullable(),
});

export const updateUserSchema = createUserSchema.partial();
