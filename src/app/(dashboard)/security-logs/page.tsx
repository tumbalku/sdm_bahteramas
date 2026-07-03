import { Metadata } from "next";
import { SecurityLogsView } from "@/modules/security-logs/components/SecurityLogsView";

export const metadata: Metadata = {
  title: "Security Logs | SIMDP",
  description: "Audit trail dan rekam aktivitas sistem",
};

export default function SecurityLogsPage() {
  return <SecurityLogsView />;
}
