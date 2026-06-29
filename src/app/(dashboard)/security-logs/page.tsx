import { Metadata } from "next";
import { SecurityLogsView } from "@/modules/security-logs/components/SecurityLogsView";

export const metadata: Metadata = {
  title: "Security Logs | SMDP Portal",
  description: "Audit trail dan rekam aktivitas sistem",
};

export default function SecurityLogsPage() {
  return (
    <div className="page-container">
      <SecurityLogsView />
    </div>
  );
}
