import { apiClient } from "@/lib/api-client";
import { DashboardStatsDto } from "./types";

export const dashboardApi = {
  getStats: async (): Promise<DashboardStatsDto> => {
    const response = await apiClient<DashboardStatsDto>("/api/v1/dashboard/stats");
    if (!response.success) throw new Error(response.error);
    return response.data as DashboardStatsDto;
  },
};
