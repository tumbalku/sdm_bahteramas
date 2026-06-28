import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "NIP atau Email wajib diisi"),
  password: z
    .string()
    .min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;
