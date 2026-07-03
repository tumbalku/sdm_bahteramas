import { apiClient } from "@/lib/api-client";
import {
  CreateDocumentTypeInput,
  DocumentArchiveFilter,
  DocumentArchiveRecap,
  DocumentTypeFilter,
  DocumentTypeRecord,
  UpdateDocumentTypeInput,
} from "./types";

function appendArchiveFilters(params: URLSearchParams, filters?: DocumentArchiveFilter) {
  if (!filters) return;
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value));
    }
  });
}

export async function getDocumentTypesApi(filters?: DocumentTypeFilter) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.professionGroupId)
    params.set("professionGroupId", filters.professionGroupId);
  if (filters?.forUser) params.set("forUser", "true");

  const url = `/api/v1/document-types${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  return apiClient<DocumentTypeRecord[]>(url, { method: "GET" });
}

export async function getDocumentTypeApi(id: string) {
  return apiClient<DocumentTypeRecord>(`/api/v1/document-types/${id}`, {
    method: "GET",
  });
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

export async function getDocumentArchiveRecapApi(filters?: DocumentArchiveFilter) {
  const params = new URLSearchParams();
  appendArchiveFilters(params, filters);
  const url = `/api/v1/document-types/archives${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient<DocumentArchiveRecap>(url, { method: "GET" });
}

export async function exportDocumentArchiveRecapApi(filters?: DocumentArchiveFilter) {
  const params = new URLSearchParams();
  appendArchiveFilters(params, filters);
  const url = `/api/v1/document-types/archives/export${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Gagal mengekspor rekap arsip dokumen");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);

  return {
    blob,
    fileName: fileNameMatch?.[1] || "smdp-rekap-arsip-dokumen.csv",
  };
}
