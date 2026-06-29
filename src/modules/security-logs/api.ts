import { apiClient } from "@/lib/api-client";
import { SecurityLogDto, SecurityLogFilterParams } from "./types";

export interface SecurityLogsResponseData {
  logs: SecurityLogDto[];
  retentionDays: string;
}

export const securityLogsApi = {
  getLogs: async (filters: SecurityLogFilterParams): Promise<SecurityLogsResponseData> => {
    const query = new URLSearchParams();
    if (filters.startDate) query.append("startDate", filters.startDate);
    if (filters.endDate) query.append("endDate", filters.endDate);
    if (filters.actorId) query.append("actorId", filters.actorId);
    if (filters.eventType) query.append("eventType", filters.eventType);

    const queryString = query.toString();
    const url = `/api/v1/security-logs${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient<SecurityLogsResponseData>(url);
    if (!response.success) throw new Error(response.error);
    return response.data || { logs: [], retentionDays: "30" };
  },
};
