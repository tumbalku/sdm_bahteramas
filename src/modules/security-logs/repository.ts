import { prisma } from "@/lib/prisma";
import { SecurityLogFilterParams } from "./types";
import { Prisma } from "@prisma/client";

export async function findSecurityLogs(filters: SecurityLogFilterParams) {
  const where: Prisma.SecurityLogWhereInput = {};

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
  
  if (filters.eventType) {
    where.eventType = filters.eventType;
  }

  const limit = Math.min(filters.limit || 100, 500);
  const page = Math.max(filters.page || 1, 1);
  const skip = (page - 1) * limit;

  return prisma.securityLog.findMany({
    where,
    orderBy: {
      timestamp: "desc",
    },
    skip,
    take: limit,
  });
}
