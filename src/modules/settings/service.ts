import { findAllSettings, updateSettingsBatch } from "./repository";
import { UpdateSettingsInput } from "./types";
import { logActivity } from "@/lib/security-log";

export async function getSettingsService() {
  return findAllSettings();
}

export async function updateSettingsService(
  input: UpdateSettingsInput,
  actor: { id: string; name: string; role: string },
  ipAddress?: string
) {
  const result = await updateSettingsBatch(input);

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "SYSTEM_SETTINGS_UPDATED",
    resource: "/api/v1/settings",
    ipAddress,
    status: "success",
    metadata: { updatedKeys: Object.keys(input) },
  });

  return result;
}
