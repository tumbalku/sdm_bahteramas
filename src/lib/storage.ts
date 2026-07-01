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
    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
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

  async ensureFolder(folderName: string): Promise<void> {
    await fs.promises.mkdir(path.join(this.uploadDir, folderName), { recursive: true });
  }
}

class SupabaseStorageProvider implements StorageProvider {
  private supabaseUrl = process.env.SUPABASE_URL || "";
  private supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  private bucket = process.env.SUPABASE_STORAGE_BUCKET || "simdp-bucket";
  
  // We'll load the client dynamically or at the top, 
  // but to avoid requiring it if local is used, we can require it here.
  private getClient() {
    const { createClient } = require("@supabase/supabase-js");
    return createClient(this.supabaseUrl, this.supabaseKey);
  }

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    const supabase = this.getClient();
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    return fileName;
  }

  async deleteFile(fileName: string): Promise<boolean> {
    const supabase = this.getClient();
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .remove([fileName]);

    if (error) {
      console.error(`Failed to delete from Supabase: ${error.message}`);
      return false;
    }
    return true;
  }

  getFileUrl(fileName: string): string {
    const supabase = this.getClient();
    const { data } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);
    return data.publicUrl;
  }

  async ensureFolder(folderName: string): Promise<void> {
    const supabase = this.getClient();
    const placeholderPath = `${folderName}/.keep`;
    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(placeholderPath, Buffer.from(""), {
        contentType: "text/plain",
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to create Supabase folder: ${error.message}`);
    }
  }
}

export function getStorageProvider(): StorageProvider {
  const providerType = process.env.STORAGE_PROVIDER || "local";

  switch (providerType.toLowerCase()) {
    case "supabase":
      return new SupabaseStorageProvider();
    case "local":
    default:
      return new LocalStorageProvider();
  }
}
