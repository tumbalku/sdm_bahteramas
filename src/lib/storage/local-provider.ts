import fs from "fs";
import path from "path";
import { getContentTypeFromPath } from "./content-type";
import type {
  StorageFileResult,
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
} from "./types";

export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir: string;

  constructor(uploadDir: string) {
    this.uploadDir = uploadDir;

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getSafePath(storagePath: string): string {
    const destination = path.resolve(this.uploadDir, storagePath);

    if (destination !== this.uploadDir && !destination.startsWith(this.uploadDir + path.sep)) {
      throw new Error("Path file tidak valid");
    }

    return destination;
  }

  async uploadFile(
    file: Buffer,
    storagePath: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    const destination = this.getSafePath(storagePath);
    const shouldFailIfExists = options?.upsert === false;

    if (shouldFailIfExists && fs.existsSync(destination)) {
      throw new Error("File sudah ada di storage");
    }

    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
    await fs.promises.writeFile(destination, file);

    return {
      storagePath,
      provider: "local",
      publicUrl: null,
    };
  }

  async getFile(storagePath: string): Promise<StorageFileResult> {
    const destination = this.getSafePath(storagePath);

    try {
      const [buffer, stat] = await Promise.all([
        fs.promises.readFile(destination),
        fs.promises.stat(destination),
      ]);

      return {
        buffer,
        contentType: getContentTypeFromPath(storagePath),
        size: stat.size,
        fileName: path.basename(storagePath),
        storagePath,
        provider: "local",
      };
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        throw new Error(`File tidak ditemukan: ${storagePath}`);
      }

      throw error;
    }
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    const destination = this.getSafePath(storagePath);

    try {
      await fs.promises.unlink(destination);
      return true;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        return false;
      }

      throw error;
    }
  }

  getFileUrl(storagePath: string): string {
    return `/api/v1/documents/download?file=protected`;
  }

  async ensureFolder(folderPath: string): Promise<void> {
    await fs.promises.mkdir(this.getSafePath(folderPath), { recursive: true });
  }

  async fileExists(storagePath: string): Promise<boolean> {
    try {
      await fs.promises.access(this.getSafePath(storagePath));
      return true;
    } catch {
      return false;
    }
  }
}
