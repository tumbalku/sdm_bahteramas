import { prisma } from "@/lib/prisma";
import { UpdateSettingsInput } from "./types";

export async function findAllSettings() {
  if ((prisma as any).systemSetting) {
    return (prisma as any).systemSetting.findMany({
      orderBy: { key: "asc" },
    });
  }

  // Fallback Raw SQL
  const rows: any[] = await prisma.$queryRaw`SELECT key, value, label, description, "updatedAt" FROM "SystemSetting" ORDER BY key ASC`;
  return rows;
}

export async function updateSettingsBatch(input: UpdateSettingsInput) {
  if ((prisma as any).systemSetting) {
    const updates = Object.entries(input).map(([key, value]) =>
      (prisma as any).systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );
    return prisma.$transaction(updates);
  }

  // Fallback Raw SQL jika delegate belum terload di memory Prisma Client
  for (const [key, value] of Object.entries(input)) {
    await prisma.$executeRaw`
      INSERT INTO "SystemSetting" (key, value, "updatedAt")
      VALUES (${key}, ${String(value)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${String(value)}, "updatedAt" = NOW()
    `;
  }
  return true;
}
