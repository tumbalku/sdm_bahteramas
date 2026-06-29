import { prisma } from "@/lib/prisma";

export interface LogActivityParams {
  actorId?: string;
  actorName: string;
  actorRole: string;
  eventType: string;
  resource: string;
  ipAddress?: string;
  status: "success" | "failed";
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

    await prisma.securityLog.create({
      data: {
        actorId: params.actorId || null,
        actorName: params.actorName || "System / Unknown",
        actorRole: params.actorRole || "SYSTEM",
        eventType: params.eventType || "SYSTEM_EVENT",
        resource: params.resource || "/api/v1/system",
        ipAddress: params.ipAddress || null,
        status: params.status || "success",
        metadata: params.metadata || undefined,
      },
    });
  } catch (error) {
    console.error("❌ Failed to log activity to SecurityLog:", error);
  }
}
