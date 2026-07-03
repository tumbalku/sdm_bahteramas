import { findSecurityLogs } from "./repository";
import { SecurityLogFilterParams } from "./types";
import { getSystemSetting } from "@/lib/system-settings";
import { normalizeSecurityLogStatus } from "./status";

export async function getSecurityLogsService(filters: SecurityLogFilterParams) {
  const logs = await findSecurityLogs(filters);
  const retentionDays = await getSystemSetting("SECURITY_LOG_RETENTION_DAYS", "30");
  return {
    logs: logs.map((log) => ({
      ...log,
      status: normalizeSecurityLogStatus(log.status),
    })),
    retentionDays,
  };
}
