import { useQuery } from "@tanstack/react-query";
import { securityLogsApi } from "./api";
import { SecurityLogFilterParams } from "./types";

export const securityLogsKeys = {
  all: ["security-logs"] as const,
  list: (filters: SecurityLogFilterParams) => [...securityLogsKeys.all, "list", filters] as const,
};

export function useSecurityLogs(filters: SecurityLogFilterParams) {
  return useQuery({
    queryKey: securityLogsKeys.list(filters),
    queryFn: () => securityLogsApi.getLogs(filters),
  });
}
