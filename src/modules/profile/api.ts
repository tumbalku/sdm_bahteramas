import { apiClient } from "@/lib/api-client";
import { UserProfileDto, UpdateProfileInput, ChangePasswordInput } from "./types";

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

export const profileApi = {
  getProfile: async (): Promise<UserProfileDto> => {
    const response = await apiClient<UserProfileDto>("/api/v1/profile");
    if (!response.success) throw new Error(response.error);
    return response.data as UserProfileDto;
  },

  updateProfile: async (input: UpdateProfileInput): Promise<UserProfileDto> => {
    const response = await apiClient<UserProfileDto>("/api/v1/profile", {
      method: "PUT",
      body: JSON.stringify(input),
    });
    if (!response.success) throw new Error(response.error);
    return response.data as UserProfileDto;
  },

  changePassword: async (input: ChangePasswordInput): Promise<void> => {
    const response = await apiClient("/api/v1/profile/password", {
      method: "PUT",
      body: JSON.stringify(input),
    });
    if (!response.success) throw new Error(response.error);
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient<{ avatarUrl: string }>("/api/v1/profile/avatar", {
      method: "POST",
      body: formData,
    });
    if (!response.success) throw new Error(response.error);
    return response.data?.avatarUrl || "";
  },

  exportProfilePdf: async (): Promise<void> => {
    return downloadFile("/api/v1/profile/export-pdf", "profil-saya.pdf", "PDF");
  },
};
