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

export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.securityLog.create({
      data: {
        actorId: params.actorId || null,
        actorName: params.actorName,
        actorRole: params.actorRole,
        eventType: params.eventType,
        resource: params.resource,
        ipAddress: params.ipAddress || null,
        status: params.status,
        metadata: params.metadata || undefined,
      },
    });
  } catch (error) {
    console.error("❌ Failed to log activity to SecurityLog:", error);
  }
}
