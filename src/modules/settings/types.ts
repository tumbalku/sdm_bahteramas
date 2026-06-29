export interface SystemSettingItem {
  key: string;
  value: string;
  label?: string | null;
  description?: string | null;
  updatedAt?: Date | string;
}

export type UpdateSettingsInput = Record<string, string>;
