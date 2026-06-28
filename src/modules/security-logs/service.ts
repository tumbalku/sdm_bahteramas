import { findSecurityLogs } from "./repository";
import { SecurityLogFilterParams } from "./types";

export async function getSecurityLogsService(filters: SecurityLogFilterParams) {
  return findSecurityLogs(filters);
}
