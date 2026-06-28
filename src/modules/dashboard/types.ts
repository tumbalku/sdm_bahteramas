import { DocumentRecordDto } from "../documents/types";

export interface DashboardStatsDto {
  totalDocuments: number;
  pendingDocuments: number;
  approvedDocuments: number;
  rejectedDocuments: number;
  expiringCount: number;
  
  recentDocuments: DocumentRecordDto[];
  expiringDocuments: DocumentRecordDto[];
}
