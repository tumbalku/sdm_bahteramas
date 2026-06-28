import { apiClient } from "@/lib/api-client";
import {
  CreateDocumentTypeInput,
  DocumentTypeFilter,
  DocumentTypeRecord,
  UpdateDocumentTypeInput,
} from "./types";

export async function getDocumentTypesApi(filters?: DocumentTypeFilter) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.professionGroupId)
    params.set("professionGroupId", filters.professionGroupId);

  const url = `/api/v1/document-types${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  return apiClient<DocumentTypeRecord[]>(url, { method: "GET" });
}

export async function createDocumentTypeApi(input: CreateDocumentTypeInput) {
  return apiClient<DocumentTypeRecord>("/api/v1/document-types", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateDocumentTypeApi(
  id: string,
  input: UpdateDocumentTypeInput
) {
  return apiClient<DocumentTypeRecord>(`/api/v1/document-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteDocumentTypeApi(id: string) {
  return apiClient<boolean>(`/api/v1/document-types/${id}`, {
    method: "DELETE",
  });
}
