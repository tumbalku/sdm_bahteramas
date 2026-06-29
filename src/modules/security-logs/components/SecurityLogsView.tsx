"use client";

import { useState } from "react";
import { SecurityLogFilterParams } from "../types";
import { useSecurityLogs } from "../hooks";
import { SecurityLogFilter } from "./SecurityLogFilter";
import { SecurityLogList } from "./SecurityLogList";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function SecurityLogsView() {
  const [filters, setFilters] = useState<SecurityLogFilterParams>({});
  const { data, isLoading } = useSecurityLogs(filters);

  const logs = data?.logs || [];
  const retentionDays = data?.retentionDays || process.env.NEXT_PUBLIC_SECURITY_LOG_RETENTION_DAYS || "30";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={ShieldAlert}
        title="Security Logs"
        description="Pantau dan audit jejak aktivitas penting seluruh pengguna di dalam sistem"
      />

      {/* Warning Banner Retensi Logs via Shadcn Alert */}
      <Alert variant="warning">
        <AlertTriangle className="w-5 h-5" />
        <div>
          <AlertTitle className="text-amber-700 dark:text-amber-300">
            Pemberitahuan Otomatisasi Retensi Logs
          </AlertTitle>
          <AlertDescription>
            Sesuai kebijakan sistem, seluruh rekam aktivitas audit (<span className="font-semibold">security logs</span>) akan dihapus secara otomatis dari basis data setelah melampaui masa simpan <strong className="font-semibold underline decoration-amber-500">{retentionDays} hari</strong> secara dinamis.
          </AlertDescription>
        </div>
      </Alert>

      <SecurityLogFilter onFilterChange={setFilters} />
      
      <SecurityLogList logs={logs} isLoading={isLoading} />
    </div>
  );
}
