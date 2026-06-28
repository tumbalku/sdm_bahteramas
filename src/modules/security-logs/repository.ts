import { prisma } from "@/lib/prisma";
import { SecurityLogFilterParams } from "./types";
import { Prisma } from "@prisma/client";

export async function findSecurityLogs(filters: SecurityLogFilterParams) {
  const where: Prisma.SecurityLogWhereInput = {};

  if (filters.startDate && filters.endDate) {
    const endOfDay = new Date(filters.endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    where.createdAt = {
      gte: new Date(filters.startDate),
      lte: endOfDay,
    };
  } else if (filters.startDate) {
    where.createdAt = {
      gte: new Date(filters.startDate),
    };
  } else if (filters.endDate) {
    const endOfDay = new Date(filters.endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    where.createdAt = {
      lte: endOfDay,
    };
  }

  if (filters.actorId) {
    where.actorId = filters.actorId;
  }
  
  if (filters.eventType) {
    where.eventType = filters.eventType;
  }

  return prisma.securityLog.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: 1000, // Hard limit to prevent massive payload, MVP
  });
}
