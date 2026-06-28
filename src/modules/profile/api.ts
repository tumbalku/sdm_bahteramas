import { apiClient } from "@/lib/api-client";
import { UserProfileDto, UpdateProfileInput, ChangePasswordInput } from "./types";

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
};
