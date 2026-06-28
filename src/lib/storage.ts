import fs from "fs";
import path from "path";

export interface StorageProvider {
  uploadFile(file: Buffer, fileName: string): Promise<string>;
  deleteFile(filePath: string): Promise<boolean>;
  getFileUrl(filePath: string): string;
}

class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(
      process.cwd(),
      process.env.STORAGE_LOCAL_PATH || "./uploads"
    );
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    const destination = path.join(this.uploadDir, fileName);
    await fs.promises.writeFile(destination, file);
    return fileName;
  }

  async deleteFile(fileName: string): Promise<boolean> {
    const destination = path.join(this.uploadDir, fileName);
    if (fs.existsSync(destination)) {
      await fs.promises.unlink(destination);
      return true;
    }
    return false;
  }

  getFileUrl(fileName: string): string {
    return `/api/v1/documents/download?file=${encodeURIComponent(fileName)}`;
  }
}

export function getStorageProvider(): StorageProvider {
  const providerType = process.env.STORAGE_PROVIDER || "local";

  switch (providerType.toLowerCase()) {
    case "local":
    default:
      return new LocalStorageProvider();
  }
}
