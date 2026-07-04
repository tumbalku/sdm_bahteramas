import { z } from "zod";

const dashboardRoleSchema = z.enum(["ADMIN", "STAFF", "EMPLOYEE"], {
  errorMap: () => ({ message: "Role dashboard tidak valid" }),
});

export const dashboardUserSchema = z.object({
  id: z.string().min(1, "User ID wajib diisi"),
  role: dashboardRoleSchema,
});

export const dashboardChartsUserSchema = dashboardUserSchema.superRefine((user, ctx) => {
  if (user.role !== "ADMIN") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["role"],
      message: "Akses ditolak. Hanya ADMIN.",
    });
  }
});

export type DashboardUserInput = z.infer<typeof dashboardUserSchema>;
