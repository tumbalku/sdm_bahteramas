import { z } from "zod";

export const rejectDocumentSchema = z.object({
  reviewNote: z.string().min(5, "Alasan penolakan minimal 5 karakter"),
});
