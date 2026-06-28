import { DocumentArchiveCategory } from "@prisma/client";

export interface ProfessionGroupSummary {
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
  targetProfessions?: ProfessionGroupSummary[];
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
}

export interface DocumentTypeFilter {
  category?: DocumentArchiveCategory;
  professionGroupId?: string;
}
