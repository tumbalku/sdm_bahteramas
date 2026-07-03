export type StorageProviderType = "local" | "supabase";

export interface StorageUploadOptions {
  contentType?: string;
  upsert?: boolean;
}

export interface StorageUploadResult {
  storagePath: string;
  provider: StorageProviderType;
  bucket?: string;
  publicUrl?: string | null;
}

export interface StorageFileResult {
  buffer: Buffer;
  contentType: string;
  size?: number;
  fileName?: string;
  storagePath: string;
  provider: StorageProviderType;
  bucket?: string;
}

export interface StorageProvider {
  uploadFile(
    file: Buffer,
    storagePath: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult>;
  getFile(storagePath: string): Promise<StorageFileResult>;
  deleteFile(storagePath: string): Promise<boolean>;
  getFileUrl(storagePath: string): string;
  ensureFolder(folderPath: string): Promise<void>;
  fileExists?(storagePath: string): Promise<boolean>;
}
