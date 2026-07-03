import { prisma } from "@/lib/prisma";
import { normalizeSecurityLogStatus, SecurityLogStatus } from "@/modules/security-logs/status";

export interface LogActivityParams {
  actorId?: string;
  actorName: string;
  actorRole: string;
  eventType: string;
  resource: string;
  ipAddress?: string;
  status?: SecurityLogStatus | string;
  metadata?: Record<string, any>;
}

export const EXCLUDED_EVENT_TYPES = [
  "USER_LOGIN",
  "USER_LOGIN_SUCCESS",
  "USER_LOGIN_FAILED",
  "USER_LOGOUT",
  "PROFILE_UPDATED",
  "PASSWORD_CHANGED",
];

export async function logActivity(params: LogActivityParams) {
  try {
    if (EXCLUDED_EVENT_TYPES.includes(params.eventType)) {
      return;
    }

    const status = normalizeSecurityLogStatus(params.status);

    await prisma.securityLog.create({
      data: {
        actorId: params.actorId || null,
        actorName: params.actorName || "System / Unknown",
        actorRole: params.actorRole || "SYSTEM",
        eventType: params.eventType || "SYSTEM_EVENT",
        resource: params.resource || "/api/v1/system",
        ipAddress: params.ipAddress || null,
        status,
        metadata: params.metadata || undefined,
      },
    });
  } catch (error) {
    console.error("❌ Failed to log activity to SecurityLog:", error);
  }
}
