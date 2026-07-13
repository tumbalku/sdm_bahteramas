import { prisma } from "@/lib/prisma";
import { UpdateSettingsInput } from "./types";

export async function findAllSettings() {
  return prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });
}

export async function updateSettingsBatch(input: UpdateSettingsInput) {
  const updates = Object.entries(input).map(([key, value]) =>
    prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  );
  return prisma.$transaction(updates);
}
