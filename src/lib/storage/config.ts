import path from "path";
import type { StorageProviderType } from "./types";

export interface LocalStorageConfig {
  uploadDir: string;
}

export interface SupabaseStorageConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
  signedUrlTtlSeconds: number;
}

function requireEnv(key: string) {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`${key} wajib diisi ketika STORAGE_PROVIDER=supabase`);
  }

  return value;
}

export function getStorageProviderType(): StorageProviderType {
  const providerType = (process.env.STORAGE_PROVIDER || "local").toLowerCase();

  if (providerType === "local" || providerType === "supabase") {
    return providerType;
  }

  throw new Error(
    `Storage provider "${providerType}" tidak didukung. Gunakan "local" atau "supabase".`
  );
}

export function getLocalStorageConfig(): LocalStorageConfig {
  return {
    uploadDir: path.resolve(process.cwd(), process.env.STORAGE_LOCAL_PATH || "./uploads"),
  };
}

export function getSupabaseStorageConfig(): SupabaseStorageConfig {
  const ttlRaw = process.env.SUPABASE_STORAGE_SIGNED_URL_TTL_SECONDS || "300";
  const signedUrlTtlSeconds = Number.parseInt(ttlRaw, 10);

  return {
    url: requireEnv("SUPABASE_URL").replace(/\/+$/, ""),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    bucket: requireEnv("SUPABASE_STORAGE_BUCKET"),
    signedUrlTtlSeconds: Number.isFinite(signedUrlTtlSeconds)
      ? signedUrlTtlSeconds
      : 300,
  };
}
