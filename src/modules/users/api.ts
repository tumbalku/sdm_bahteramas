import { apiClient } from "@/lib/api-client";
import { CreateUserInput, ImportUsersResult, UpdateUserInput, UserFilter, UserRecord } from "./types";

function buildUserFilterParams(filters?: UserFilter) {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.professionGroupId) params.set("professionGroupId", filters.professionGroupId);
  if (filters?.workplaceId) params.set("workplaceId", filters.workplaceId);
  if (filters?.employmentStatusId) params.set("employmentStatusId", filters.employmentStatusId);
  if (filters?.employeeGroupId) params.set("employeeGroupId", filters.employeeGroupId);
  if (filters?.employeePositionId) params.set("employeePositionId", filters.employeePositionId);
  return params;
}

async function downloadCsv(endpoint: string, fallbackFileName: string) {
  const response = await fetch(endpoint, { method: "GET" });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Gagal mengunduh file CSV");
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
  return downloadCsv("/api/v1/users/import/template", "smdp-users-import-template.csv");
}

export async function exportUsersApi(filters?: UserFilter) {
  const params = buildUserFilterParams(filters);
  const url = `/api/v1/users/export${params.toString() ? `?${params.toString()}` : ""}`;
  return downloadCsv(url, "smdp-users.csv");
}

export async function exportUserDocumentsCsvApi(userId: string) {
  return downloadCsv(
    `/api/v1/users/${userId}/documents/export`,
    `dokumen-pegawai-${userId}.csv`
  );
}

export async function fetchUserCategoriesApi() {
  return apiClient<{
    employmentStatuses: { id: string; name: string; employeeGroups: { id: string; name: string }[] }[];
    professionGroups: { id: string; name: string; employeePositions: { id: string; name: string }[] }[];
    employeeRanks: { id: string; name: string }[];
    workplaces: { id: string; name: string }[];
  }>("/api/v1/users/categories", { method: "GET" });
}

