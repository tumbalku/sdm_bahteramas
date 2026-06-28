import { apiClient } from "@/lib/api-client";
import { DocumentRecordDto } from "../documents/types";
import { RejectDocumentInput, VerificationHistoryDto } from "./types";

export const verificationApi = {
  getPendingDocuments: async (): Promise<DocumentRecordDto[]> => {
    const response = await apiClient<DocumentRecordDto[]>("/api/v1/verification");
    if (!response.success) throw new Error(response.error);
    return response.data || [];
  },

  approveDocument: async (id: string): Promise<void> => {
    const response = await apiClient(`/api/v1/verification/${id}/approve`, {
      method: "POST",
    });
    if (!response.success) throw new Error(response.error);
  },

  rejectDocument: async (id: string, input: RejectDocumentInput): Promise<void> => {
    const response = await apiClient(`/api/v1/verification/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!response.success) throw new Error(response.error);
  },

  getDocumentHistory: async (id: string): Promise<VerificationHistoryDto[]> => {
    const response = await apiClient<VerificationHistoryDto[]>(`/api/v1/verification/document/${id}`);
    if (!response.success) throw new Error(response.error);
    return response.data || [];
  },
};
