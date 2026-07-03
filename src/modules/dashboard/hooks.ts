import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  charts: () => [...dashboardKeys.all, "charts"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getStats(),
  });
}

export function useDashboardCharts(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.charts(),
    queryFn: () => dashboardApi.getCharts(),
    enabled,
  });
}
