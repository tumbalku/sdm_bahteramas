import { DocumentArchiveCategory, DocumentStatus } from "@prisma/client";

export interface DocumentTypeDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  archiveCategory: DocumentArchiveCategory;
  isMandatory: boolean;
  requiresExpiryDate: boolean;
  requiresIssueDate: boolean;
  requiresDocumentNumber: boolean;
  allowedFormats: string;
  maxSizeMb: number;
  icon: string | null;
}

export interface DocumentRecordDto {
  id: string;
  ownerId: string;
  documentTypeId: string;
  status: DocumentStatus;
  fileName: string;
  filePath: string;
  documentNumber: string | null;
  issueDate: Date | null;
  expiryDate: Date | null;
  uploadedAt: Date;
  updatedAt: Date;
  
  // Relations
  documentType?: DocumentTypeDto;
  owner?: {
    id: string;
    name: string;
    employeeId: string;
    avatarUrl?: string | null;
  };
  verificationHistories?: {
    id: string;
    status: DocumentStatus;
    reviewNote: string | null;
    reviewedAt: Date;
    reviewedBy?: {
      id?: string;
      name: string;
      employeeId?: string;
    } | null;
  }[];
}

export interface DocumentUploadInput {
  ownerId: string;
  documentTypeId: string;
  replaceDocumentId?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  file: File;
}

export interface DocumentFilterDto {
  ownerId?: string;
  archiveCategory?: DocumentArchiveCategory;
  status?: DocumentStatus;
  search?: string;
  employmentStatusId?: string;
  employeeGroupId?: string;
  professionGroupId?: string;
  employeePositionId?: string;
}
