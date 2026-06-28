import { apiClient } from "@/lib/api-client";
import { SecurityLogDto, SecurityLogFilterParams } from "./types";

export const securityLogsApi = {
  getLogs: async (filters: SecurityLogFilterParams): Promise<SecurityLogDto[]> => {
    const query = new URLSearchParams();
    if (filters.startDate) query.append("startDate", filters.startDate);
    if (filters.endDate) query.append("endDate", filters.endDate);
    if (filters.actorId) query.append("actorId", filters.actorId);
    if (filters.eventType) query.append("eventType", filters.eventType);

    const queryString = query.toString();
    const url = `/api/v1/security-logs${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient<SecurityLogDto[]>(url);
    if (!response.success) throw new Error(response.error);
    return response.data || [];
  },
};
