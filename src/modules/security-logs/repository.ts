import { prisma } from "@/lib/prisma";
import { SecurityLogFilterParams } from "./types";
import { Prisma } from "@prisma/client";
import { EXCLUDED_EVENT_TYPES } from "@/lib/security-log";
import { getSystemSetting } from "@/lib/system-settings";

export async function deleteExpiredSecurityLogs() {
  try {
    const retentionDaysStr = await getSystemSetting("SECURITY_LOG_RETENTION_DAYS", "30");
    const retentionDays = parseInt(retentionDaysStr, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.securityLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error("❌ Gagal menghapus security logs kadaluwarsa:", error);
    return 0;
  }
}

export async function findSecurityLogs(filters: SecurityLogFilterParams) {
  // Jalankan pembersihan log yang sudah kadaluwarsa secara otomatis
  await deleteExpiredSecurityLogs();

  const where: Prisma.SecurityLogWhereInput = {
    eventType: {
      notIn: EXCLUDED_EVENT_TYPES,
    },
  };

  if (filters.startDate && filters.endDate) {
    const endOfDay = new Date(filters.endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    where.timestamp = {
      gte: new Date(filters.startDate),
      lte: endOfDay,
    };
  } else if (filters.startDate) {
    where.timestamp = {
      gte: new Date(filters.startDate),
    };
  } else if (filters.endDate) {
    const endOfDay = new Date(filters.endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    where.timestamp = {
      lte: endOfDay,
    };
  }

  if (filters.actorId) {
    where.actorId = filters.actorId;
  }
  
  if (filters.eventType && !EXCLUDED_EVENT_TYPES.includes(filters.eventType)) {
    where.eventType = filters.eventType;
  }

  const limit = Math.min(filters.limit || 100, 500);
  const page = Math.max(filters.page || 1, 1);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.securityLog.findMany({
      where,
      orderBy: {
        timestamp: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.securityLog.count({ where }),
  ]);

  return {
    items,
    total,
  };
}
