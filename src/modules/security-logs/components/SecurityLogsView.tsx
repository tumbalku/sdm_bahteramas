"use client";

import { useState } from "react";
import { SecurityLogFilterParams } from "../types";
import { useSecurityLogs } from "../hooks";
import { SecurityLogFilter } from "./SecurityLogFilter";
import { SecurityLogList } from "./SecurityLogList";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export function SecurityLogsView() {
  const [filters, setFilters] = useState<SecurityLogFilterParams>({});
  const { data: logs = [], isLoading } = useSecurityLogs(filters);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={ShieldAlert}
        title="Security Logs"
        description="Pantau dan audit jejak aktivitas penting seluruh pengguna di dalam sistem"
      />

      <SecurityLogFilter onFilterChange={setFilters} />
      
      <SecurityLogList logs={logs} isLoading={isLoading} />
    </div>
  );
}
