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

export interface DashboardChartItem {
  label: string;
  value: number;
}

export interface DashboardMonthlyUploadByType {
  month: string;
  [documentType: string]: string | number;
}

export interface DashboardUploadTrendItem {
  month: string;
  total: number;
}

export interface DashboardExpiringSummaryItem {
  label: string;
  days: number;
  value: number;
}

export interface DashboardChartsDto {
  employeeByEmploymentStatus: DashboardChartItem[];
  employeeByEmployeeGroup: DashboardChartItem[];
  employeeByGender: DashboardChartItem[];
  employeeByWorkplace: DashboardChartItem[];
  documentUploadsByTypeLastSixMonths: DashboardMonthlyUploadByType[];
  documentUploadTypeKeys: string[];
  monthlyUploadTrend: DashboardUploadTrendItem[];
  verificationStatusSummary: DashboardChartItem[];
  missingMandatoryDocumentsTop: DashboardChartItem[];
  expiringDocumentsSummary: DashboardExpiringSummaryItem[];
  generatedAt: string;
}
