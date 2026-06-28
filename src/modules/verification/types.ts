import { DocumentStatus } from "@prisma/client";

export interface VerificationHistoryDto {
  id: string;
  documentRecordId: string;
  status: DocumentStatus;
  reviewedById: string | null;
  reviewNote: string | null;
  reviewedAt: Date;
  reviewer?: {
    id: string;
    name: string;
  } | null;
}

export interface RejectDocumentInput {
  reviewNote: string;
}
