import { z } from "zod";
import { Role } from "@prisma/client";

function validateTmtDates(data: { hasTmt?: boolean | null; tmtStartDate?: string | null; tmtEndDate?: string | null }, ctx: z.RefinementCtx) {
  if (!data.hasTmt) return;

  if (data.tmtStartDate && data.tmtEndDate) {
    const startDate = new Date(data.tmtStartDate);
    const endDate = new Date(data.tmtEndDate);

    if (Number.isNaN(startDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tmtStartDate"],
        message: "Tanggal mulai TMT tidak valid",
      });
    }

    if (Number.isNaN(endDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tmtEndDate"],
        message: "Tanggal akhir TMT tidak valid",
      });
    }

    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && endDate < startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tmtEndDate"],
        message: "Tanggal akhir TMT tidak boleh lebih awal dari tanggal mulai TMT",
      });
    }
  }
}

function validateOldNip(data: { hasOldEmployeeId?: boolean | null; oldEmployeeId?: string | null }, ctx: z.RefinementCtx) {
  if (data.hasOldEmployeeId === undefined) return;
  if (!data.hasOldEmployeeId) return;
  if (!data.oldEmployeeId || data.oldEmployeeId.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["oldEmployeeId"],
      message: "NIP Lama wajib diisi jika opsi NIP Lama diaktifkan",
    });
  }
}

const userSchema = z.object({
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
  birthPlace: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  academicDegree: z.string().optional().nullable(),
  lastEducation: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  joinDate: z.string().optional().nullable(),
  hasTmt: z.boolean().optional().default(false),
  tmtStartDate: z.string().optional().nullable(),
  tmtEndDate: z.string().optional().nullable(),
  hasOldEmployeeId: z.boolean().optional().default(false),
  oldEmployeeId: z.string().optional().nullable(),
  employmentStatusId: z.string().optional().nullable(),
  employeeGroupId: z.string().optional().nullable(),
  professionGroupId: z.string().optional().nullable(),
  employeePositionId: z.string().optional().nullable(),
  employeeRankId: z.string().optional().nullable(),
  workplaceId: z.string().optional().nullable(),
});

export const createUserSchema = userSchema.superRefine((data, ctx) => {
  validateTmtDates(data, ctx);
  validateOldNip(data, ctx);
});

export const updateUserSchema = userSchema.partial().superRefine((data, ctx) => {
  validateTmtDates(data, ctx);
  validateOldNip(data, ctx);
});

const optionalDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
  .optional();

const optionalAgeNumber = z.coerce
  .number()
  .int("Usia harus berupa angka bulat")
  .min(0, "Usia minimal 0")
  .max(100, "Usia maksimal 100")
  .optional();

export const userFilterSchema = z
  .object({
    search: z.string().trim().optional(),
    professionGroupId: z.string().optional(),
    workplaceId: z.string().optional(),
    employmentStatusId: z.string().optional(),
    employeeGroupId: z.string().optional(),
    employeePositionId: z.string().optional(),
    tmtStartDate: optionalDateString,
    tmtEndDate: optionalDateString,
    retirementAgeMin: optionalAgeNumber,
    retirementAgeMax: optionalAgeNumber,
    maritalStatus: z.string().trim().optional(),
    lastEducation: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.retirementAgeMin !== undefined &&
      data.retirementAgeMax !== undefined &&
      data.retirementAgeMax < data.retirementAgeMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["retirementAgeMax"],
        message: "Usia akhir pensiun tidak boleh lebih kecil dari usia awal",
      });
    }
  });
