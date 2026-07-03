import { apiClient } from "@/lib/api-client";
import { DocumentRecordDto, DocumentUploadInput, DocumentFilterDto } from "./types";

export const documentApi = {
  getDocument: async (id: string): Promise<DocumentRecordDto> => {
    const response = await apiClient<DocumentRecordDto>(`/api/v1/documents/${id}`);
    if (!response.success) throw new Error(response.error);
    return response.data as DocumentRecordDto;
  },

  getDocuments: async (filters: DocumentFilterDto): Promise<DocumentRecordDto[]> => {
    const params = new URLSearchParams();
    if (filters.ownerId) params.append("ownerId", filters.ownerId);
    if (filters.archiveCategory) params.append("archiveCategory", filters.archiveCategory);
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.employmentStatusId) params.append("employmentStatusId", filters.employmentStatusId);
    if (filters.employeeGroupId) params.append("employeeGroupId", filters.employeeGroupId);
    if (filters.professionGroupId) params.append("professionGroupId", filters.professionGroupId);
    if (filters.employeePositionId) params.append("employeePositionId", filters.employeePositionId);

    const response = await apiClient<DocumentRecordDto[]>(`/api/v1/documents?${params.toString()}`);
    if (!response.success) throw new Error(response.error);
    return response.data || [];
  },

  uploadDocument: async (input: DocumentUploadInput): Promise<DocumentRecordDto> => {
    const formData = new FormData();
    formData.append("documentTypeId", input.documentTypeId);
    if (input.replaceDocumentId) formData.append("replaceDocumentId", input.replaceDocumentId);
    if (input.documentNumber) formData.append("documentNumber", input.documentNumber);
    if (input.issueDate) formData.append("issueDate", input.issueDate);
    if (input.expiryDate) formData.append("expiryDate", input.expiryDate);
    formData.append("file", input.file);

    const response = await apiClient<DocumentRecordDto>("/api/v1/documents/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.success) throw new Error(response.error);
    return response.data as DocumentRecordDto;
  },

  deleteDocument: async (id: string): Promise<void> => {
    const response = await apiClient(`/api/v1/documents/${id}`, {
      method: "DELETE",
    });
    if (!response.success) throw new Error(response.error);
  },
};
