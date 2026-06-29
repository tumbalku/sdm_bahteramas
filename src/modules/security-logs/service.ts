import { findSecurityLogs } from "./repository";
import { SecurityLogFilterParams } from "./types";
import { getSystemSetting } from "@/lib/system-settings";

export async function getSecurityLogsService(filters: SecurityLogFilterParams) {
  const logs = await findSecurityLogs(filters);
  const retentionDays = await getSystemSetting("SECURITY_LOG_RETENTION_DAYS", "30");
  return { logs, retentionDays };
}
