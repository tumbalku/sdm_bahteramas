import { DocumentArchiveCategory } from "@prisma/client";

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
