export interface SecurityLogDto {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  eventType: string;
  resource: string;
  ipAddress: string | null;
  status: string;
  metadata: any | null;
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
