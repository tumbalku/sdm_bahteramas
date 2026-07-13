import { findSecurityLogs } from "./repository";
import { SecurityLogFilterParams } from "./types";
import { getSystemSetting } from "@/lib/system-settings";
import { normalizeSecurityLogStatus } from "./status";

export async function getSecurityLogsService(filters: SecurityLogFilterParams) {
  const { items, total } = await findSecurityLogs(filters);
  const retentionDays = await getSystemSetting("SECURITY_LOG_RETENTION_DAYS", "30");
  return {
    logs: items.map((log) => ({
      ...log,
      status: normalizeSecurityLogStatus(log.status),
    })),
    retentionDays,
    total,
    page: filters.page || 1,
    limit: filters.limit || 100,
  };
}
