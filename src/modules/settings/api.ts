import { apiClient } from "@/lib/api-client";
import { SystemSettingItem, UpdateSettingsInput } from "./types";

export async function getSettingsApi() {
  return apiClient<SystemSettingItem[]>("/api/v1/settings", { method: "GET" });
}

export async function updateSettingsApi(input: UpdateSettingsInput) {
  return apiClient<{ message: string }>("/api/v1/settings", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
