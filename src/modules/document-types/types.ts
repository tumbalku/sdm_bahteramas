import { DocumentArchiveCategory, DocumentStatus } from "@prisma/client";

export interface DocumentTypeFormState {
  code: string;
  name: string;
  description: string;
  archiveCategory: DocumentArchiveCategory;
  isMandatory: boolean;
  requiresExpiryDate: boolean;
  requiresIssueDate: boolean;
  requiresDocumentNumber: boolean;
  selectedFormats: string[];
  sizeValue: number;
  sizeUnit: "KB" | "MB";
  selectedStatuses: string[];
  selectedGroups: string[];
  selectedProfessions: string[];
  selectedRanks: string[];
  selectedWorkplaces: string[];
}


export interface TargetSummary {
  id: string;
  name: string;
}

export interface DocumentTypeRecord {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  archiveCategory: DocumentArchiveCategory;
  isMandatory: boolean;
  requiresExpiryDate: boolean;
  requiresIssueDate: boolean;
  requiresDocumentNumber: boolean;
  allowedFormats: string;
  maxSizeMb: number;
  icon?: string | null;
  createdAt: Date;
  updatedAt: Date;
  targetProfessions?: TargetSummary[];
  targetStatuses?: TargetSummary[];
  targetGroups?: TargetSummary[];
  targetRanks?: TargetSummary[];
  targetWorkplaces?: TargetSummary[];
}

export interface CreateDocumentTypeInput {
  code: string;
  name: string;
  description?: string;
  archiveCategory: DocumentArchiveCategory;
  isMandatory?: boolean;
  requiresExpiryDate?: boolean;
  requiresIssueDate?: boolean;
  requiresDocumentNumber?: boolean;
  allowedFormats: string;
  maxSizeMb: number;
  icon?: string;
  professionGroupIds?: string[];
  employmentStatusIds?: string[];
  employeeGroupIds?: string[];
  employeeRankIds?: string[];
  workplaceIds?: string[];
}

export interface UpdateDocumentTypeInput {
  code?: string;
  name?: string;
  description?: string;
  archiveCategory?: DocumentArchiveCategory;
  isMandatory?: boolean;
  requiresExpiryDate?: boolean;
  requiresIssueDate?: boolean;
  requiresDocumentNumber?: boolean;
  allowedFormats?: string;
  maxSizeMb?: number;
  icon?: string;
  professionGroupIds?: string[];
  employmentStatusIds?: string[];
  employeeGroupIds?: string[];
  employeeRankIds?: string[];
  workplaceIds?: string[];
}

export interface DocumentTypeFilter {
  category?: DocumentArchiveCategory;
  professionGroupId?: string;
  forUser?: boolean;
}

export type ArchiveUploadStatus = "UPLOADED" | "MISSING";

export interface DocumentArchiveFilter {
  search?: string;
  archiveCategory?: DocumentArchiveCategory;
  documentTypeId?: string;
  status?: DocumentStatus;
  uploadStatus?: ArchiveUploadStatus;
  employmentStatusId?: string;
  employeeGroupId?: string;
  professionGroupId?: string;
  employeePositionId?: string;
  employeeRankId?: string;
  workplaceId?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  uploadedAtFrom?: string;
  uploadedAtTo?: string;
}

export interface DocumentArchiveRow {
  key: string;
  uploadStatus: ArchiveUploadStatus;
  employee: {
    id: string;
    employeeId: string;
    name: string;
    avatarUrl?: string | null;
    employmentStatusName?: string | null;
    employeeGroupName?: string | null;
    professionGroupName?: string | null;
    employeePositionName?: string | null;
    employeeRankName?: string | null;
    workplaceName?: string | null;
  };
  documentType: {
    id: string;
    code: string;
    name: string;
    archiveCategory: DocumentArchiveCategory;
  };
  document: {
    id: string;
    fileName: string;
    filePath: string;
    documentNumber: string | null;
    issueDate: Date | null;
    expiryDate: Date | null;
    uploadedAt: Date;
    status: DocumentStatus;
    latestReviewNote?: string | null;
  } | null;
  status: DocumentStatus | null;
}

export interface DocumentArchiveStats {
  totalRequired: number;
  uploaded: number;
  approved: number;
  pending: number;
  rejected: number;
  missing: number;
  percentage: number;
  employeeCount: number;
  documentTypeCount: number;
}

export interface DocumentArchiveRecap {
  rows: DocumentArchiveRow[];
  stats: DocumentArchiveStats;
  generatedAt: string;
  filters: DocumentArchiveFilter;
}

export interface DocumentArchiveExportResult {
  content: string;
  fileName: string;
  rowCount: number;
}
