import { apiClient } from "@/lib/api-client";
import type {
  CreateUserInput,
  ImportUsersResult,
  MasterCategories,
  UpdateUserInput,
  UserFilter,
  UserRecord,
} from "./types";

function buildUserFilterParams(filters?: UserFilter) {
  const params = new URLSearchParams();
  if (!filters) return params;

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value));
    }
  });
  return params;
}

async function downloadFile(endpoint: string, fallbackFileName: string, fileLabel: string) {
  const response = await fetch(endpoint, { method: "GET" });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Gagal mengunduh file ${fileLabel}`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const fileName = match?.[1] || fallbackFileName;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  if (anchor.parentNode) {
    anchor.parentNode.removeChild(anchor);
  }
  URL.revokeObjectURL(url);
}

export async function getUsersApi(filters?: UserFilter) {
  const params = buildUserFilterParams(filters);

  const url = `/api/v1/users${params.toString() ? `?${params.toString()}` : ""}`;
  return apiClient<UserRecord[]>(url, { method: "GET" });
}

export async function getUserApi(id: string) {
  return apiClient<UserRecord>(`/api/v1/users/${id}`, { method: "GET" });
}

export async function createUserApi(input: CreateUserInput) {
  return apiClient<UserRecord>("/api/v1/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateUserApi(id: string, input: UpdateUserInput) {
  return apiClient<UserRecord>(`/api/v1/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteUserApi(id: string) {
  return apiClient<boolean>(`/api/v1/users/${id}`, {
    method: "DELETE",
  });
}

export async function importUsersApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<ImportUsersResult>("/api/v1/users/import", {
    method: "POST",
    body: formData,
  });
}

export async function downloadUsersImportTemplateApi() {
  return downloadFile("/api/v1/users/import/template", "smdp-users-import-template.csv", "CSV");
}

export async function exportUsersApi(filters?: UserFilter) {
  const params = buildUserFilterParams(filters);
  const url = `/api/v1/users/export${params.toString() ? `?${params.toString()}` : ""}`;
  return downloadFile(url, "smdp-users.csv", "CSV");
}

export async function exportUserDocumentsCsvApi(userId: string) {
  return downloadFile(
    `/api/v1/users/${userId}/documents/export`,
    `dokumen-pegawai-${userId}.csv`,
    "CSV"
  );
}

export async function exportUserProfilePdfApi(userId: string) {
  return downloadFile(
    `/api/v1/users/${userId}/profile/export-pdf`,
    `profil-pegawai-${userId}.pdf`,
    "PDF"
  );
}

export async function fetchUserCategoriesApi() {
  return apiClient<MasterCategories>("/api/v1/users/categories", { method: "GET" });
}

export async function createCategoryApi(payload: { type: string; name: string; parentId?: string | null }) {
  return apiClient<{ success: boolean }>("/api/v1/users/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategoryApi(payload: { id: string; type: string; name: string; parentId?: string | null }) {
  return apiClient<{ success: boolean }>("/api/v1/users/categories", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategoryApi(id: string, type: string) {
  return apiClient<{ success: boolean }>(`/api/v1/users/categories?id=${id}&type=${type}`, {
    method: "DELETE",
  });
}

