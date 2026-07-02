import fs from "fs";
import path from "path";

export interface StorageProvider {
  uploadFile(file: Buffer, fileName: string): Promise<string>;
  deleteFile(filePath: string): Promise<boolean>;
  getFileUrl(filePath: string): string;
  ensureFolder(folderName: string): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(
      process.cwd(),
      process.env.STORAGE_LOCAL_PATH || "./uploads"
    );
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getSafePath(fileName: string): string {
    const destination = path.resolve(this.uploadDir, fileName);

    if (!destination.startsWith(this.uploadDir + path.sep)) {
      throw new Error("Path file tidak valid");
    }

    return destination;
  }

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    const destination = this.getSafePath(fileName);
    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
    await fs.promises.writeFile(destination, file);
    return fileName;
  }

  async deleteFile(fileName: string): Promise<boolean> {
    const destination = this.getSafePath(fileName);
    if (fs.existsSync(destination)) {
      await fs.promises.unlink(destination);
      return true;
    }
    return false;
  }

  getFileUrl(fileName: string): string {
    return `/api/v1/documents/download?file=${encodeURIComponent(fileName)}`;
  }

  async ensureFolder(folderName: string): Promise<void> {
    await fs.promises.mkdir(this.getSafePath(folderName), { recursive: true });
  }
}

export function getStorageProvider(): StorageProvider {
  const providerType = process.env.STORAGE_PROVIDER || "local";

  switch (providerType.toLowerCase()) {
    case "local":
      return new LocalStorageProvider();
    default:
      throw new Error(`Storage provider "${providerType}" tidak didukung. Gunakan "local".`);
  }
}
