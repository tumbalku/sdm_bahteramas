import { SecurityLogStatus } from "./status";

export interface SecurityLogDto {
  id: string;
  actorId: string | null;
  actorName: string;
  actorRole: string;
  eventType: string;
  resource: string;
  ipAddress: string | null;
  status: SecurityLogStatus;
  metadata: Record<string, unknown> | null;
  timestamp: Date;
  createdAt?: Date;
}

export interface SecurityLogFilterParams {
  startDate?: string;
  endDate?: string;
  actorId?: string;
  eventType?: string;
  page?: number;
  limit?: number;
}
