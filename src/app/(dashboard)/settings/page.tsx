import { Metadata } from "next";
import { SettingsFormView } from "@/modules/settings/components/SettingsFormView";

export const metadata: Metadata = {
  title: "Pengaturan Sistem | SIMDP",
  description: "Kelola konfigurasi global aplikasi dan kebijakan sistem",
};

export default function SettingsPage() {
  return <SettingsFormView />;
}
