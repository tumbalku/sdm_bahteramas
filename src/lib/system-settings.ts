import { prisma } from "@/lib/prisma";

export async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
  try {
    if ((prisma as any).systemSetting) {
      const setting = await (prisma as any).systemSetting.findUnique({
        where: { key },
      });
      if (setting && setting.value !== undefined && setting.value !== null) {
        return setting.value;
      }
    } else {
      // Fallback Raw SQL untuk kompatibilitas runtime
      const rows: any[] = await prisma.$queryRaw`SELECT value FROM "SystemSetting" WHERE key = ${key} LIMIT 1`;
      if (rows && rows.length > 0 && rows[0].value !== undefined && rows[0].value !== null) {
        return rows[0].value;
      }
    }
  } catch (error) {
    console.error(`⚠️ Gagal membaca system setting [${key}] dari database:`, error);
  }

  // Fallback ke process.env atau defaultValue
  return process.env[key] || defaultValue;
}

export async function getAllSystemSettings() {
  try {
    if ((prisma as any).systemSetting) {
      const settings = await (prisma as any).systemSetting.findMany({
        orderBy: { key: "asc" },
      });
      return settings;
    } else {
      const rows: any[] = await prisma.$queryRaw`SELECT key, value, label, description, "updatedAt" FROM "SystemSetting" ORDER BY key ASC`;
      return rows;
    }
  } catch (error) {
    console.error("⚠️ Gagal mengambil daftar system settings:", error);
    return [];
  }
}

export async function updateSystemSetting(key: string, value: string) {
  if ((prisma as any).systemSetting) {
    return (prisma as any).systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  } else {
    return prisma.$executeRaw`
      INSERT INTO "SystemSetting" (key, value, "updatedAt")
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${value}, "updatedAt" = NOW()
    `;
  }
}
