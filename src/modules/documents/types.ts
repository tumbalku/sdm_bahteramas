import { DocumentArchiveCategory, DocumentStatus } from "@prisma/client";

export interface DocumentTypeDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  archiveCategory: DocumentArchiveCategory;
  isMandatory: boolean;
  requiresExpiryDate: boolean;
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
  };
}

export interface DocumentUploadInput {
  ownerId: string;
  documentTypeId: string;
  issueDate?: string;
  expiryDate?: string;
  file: File;
}

export interface DocumentFilterDto {
  ownerId?: string;
  archiveCategory?: DocumentArchiveCategory;
  status?: DocumentStatus;
}
