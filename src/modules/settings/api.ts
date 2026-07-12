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

export async function downloadBackupApi() {
  const response = await fetch("/api/v1/backup/export");
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Gagal mengunduh backup database");
  }
  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `smdp_backup_${new Date().toISOString().slice(0, 10)}.sql`;
  if (contentDisposition && contentDisposition.includes("filename=")) {
    filename = contentDisposition.split("filename=")[1].replace(/"/g, "");
  }
  return { blob, filename };
}
