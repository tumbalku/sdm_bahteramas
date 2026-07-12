import { prisma } from "@/lib/prisma";

export async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });
    if (setting && setting.value !== undefined && setting.value !== null) {
      return setting.value;
    }
  } catch (error) {
    console.error(`⚠️ Gagal membaca system setting [${key}] dari database:`, error);
  }

  // Fallback ke process.env atau defaultValue
  return process.env[key] || defaultValue;
}

export async function getAllSystemSettings() {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });
    return settings;
  } catch (error) {
    console.error("⚠️ Gagal mengambil daftar system settings:", error);
    return [];
  }
}

export async function updateSystemSetting(key: string, value: string) {
  return prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
