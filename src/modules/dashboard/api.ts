import { apiClient } from "@/lib/api-client";
import { DashboardChartsDto, DashboardStatsDto } from "./types";

export const dashboardApi = {
  getStats: async (): Promise<DashboardStatsDto> => {
    const response = await apiClient<DashboardStatsDto>("/api/v1/dashboard/stats");
    if (!response.success) throw new Error(response.error);
    return response.data as DashboardStatsDto;
  },
  getCharts: async (): Promise<DashboardChartsDto> => {
    const response = await apiClient<DashboardChartsDto>("/api/v1/dashboard/charts");
    if (!response.success) throw new Error(response.error);
    return response.data as DashboardChartsDto;
  },
};
