import { apiClient } from "@/lib/api-client";
import { CreateUserInput, UpdateUserInput, UserFilter, UserRecord } from "./types";

export async function getUsersApi(filters?: UserFilter) {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.professionGroupId) params.set("professionGroupId", filters.professionGroupId);
  if (filters?.workplaceId) params.set("workplaceId", filters.workplaceId);
  if (filters?.employmentStatusId) params.set("employmentStatusId", filters.employmentStatusId);
  if (filters?.employeeGroupId) params.set("employeeGroupId", filters.employeeGroupId);
  if (filters?.employeePositionId) params.set("employeePositionId", filters.employeePositionId);

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
