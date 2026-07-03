import { getLocalStorageConfig, getStorageProviderType, getSupabaseStorageConfig } from "./config";
import { LocalStorageProvider } from "./local-provider";
import { SupabaseStorageProvider } from "./supabase-provider";
import type { StorageProvider } from "./types";

export function getStorageProvider(): StorageProvider {
  const providerType = getStorageProviderType();

  switch (providerType) {
    case "local":
      return new LocalStorageProvider(getLocalStorageConfig().uploadDir);
    case "supabase":
      return new SupabaseStorageProvider(getSupabaseStorageConfig());
  }
}

export { getContentTypeFromPath } from "./content-type";
export type {
  StorageFileResult,
  StorageProvider,
  StorageProviderType,
  StorageUploadOptions,
  StorageUploadResult,
} from "./types";
