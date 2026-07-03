import { getContentTypeFromPath } from "./content-type";
import type {
  StorageFileResult,
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
} from "./types";

interface SupabaseStorageProviderConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
}

function encodeStoragePath(storagePath: string) {
  return storagePath
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export class SupabaseStorageProvider implements StorageProvider {
  private readonly url: string;
  private readonly serviceRoleKey: string;
  private readonly bucket: string;

  constructor(config: SupabaseStorageProviderConfig) {
    this.url = config.url;
    this.serviceRoleKey = config.serviceRoleKey;
    this.bucket = config.bucket;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.serviceRoleKey}`,
      apikey: this.serviceRoleKey,
    };
  }

  private getObjectUrl(storagePath: string) {
    return `${this.url}/storage/v1/object/${encodeURIComponent(this.bucket)}/${encodeStoragePath(storagePath)}`;
  }

  async uploadFile(
    file: Buffer,
    storagePath: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    const response = await fetch(this.getObjectUrl(storagePath), {
      method: "POST",
      headers: {
        ...this.headers,
        "Content-Type": options?.contentType || getContentTypeFromPath(storagePath),
        "x-upsert": options?.upsert === false ? "false" : "true",
      },
      body: new Uint8Array(file),
    });

    if (!response.ok) {
      throw new Error(
        `Gagal upload file ke Supabase Storage (${response.status}): ${await response.text()}`
      );
    }

    return {
      storagePath,
      provider: "supabase",
      bucket: this.bucket,
      publicUrl: null,
    };
  }

  async getFile(storagePath: string): Promise<StorageFileResult> {
    const response = await fetch(this.getObjectUrl(storagePath), {
      method: "GET",
      headers: this.headers,
    });

    if (response.status === 404) {
      throw new Error(`File tidak ditemukan: ${storagePath}`);
    }

    if (!response.ok) {
      throw new Error(
        `Gagal membaca file dari Supabase Storage (${response.status}): ${await response.text()}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      buffer,
      contentType: response.headers.get("content-type") || getContentTypeFromPath(storagePath),
      size: buffer.byteLength,
      fileName: storagePath.split("/").pop(),
      storagePath,
      provider: "supabase",
      bucket: this.bucket,
    };
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    const response = await fetch(
      `${this.url}/storage/v1/object/${encodeURIComponent(this.bucket)}`,
      {
        method: "DELETE",
        headers: {
          ...this.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefixes: [storagePath] }),
      }
    );

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(
        `Gagal menghapus file dari Supabase Storage (${response.status}): ${await response.text()}`
      );
    }

    return true;
  }

  getFileUrl(storagePath: string): string {
    return `/api/v1/documents/download?file=${encodeURIComponent(storagePath)}`;
  }

  async ensureFolder(_folderPath: string): Promise<void> {
    // Supabase Storage memakai object path virtual, jadi folder tidak perlu dibuat.
  }

  async fileExists(storagePath: string): Promise<boolean> {
    const response = await fetch(this.getObjectUrl(storagePath), {
      method: "HEAD",
      headers: this.headers,
    });

    return response.ok;
  }
}
