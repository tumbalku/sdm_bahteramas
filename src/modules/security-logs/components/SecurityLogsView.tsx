"use client";

import { useState } from "react";
import { SecurityLogFilterParams } from "../types";
import { useSecurityLogs } from "../hooks";
import { SecurityLogFilter } from "./SecurityLogFilter";
import { SecurityLogList } from "./SecurityLogList";
import { ShieldAlert } from "lucide-react";

export function SecurityLogsView() {
  const [filters, setFilters] = useState<SecurityLogFilterParams>({});
  const { data: logs = [], isLoading } = useSecurityLogs(filters);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            Security Logs
          </h2>
          <p className="text-muted-foreground mt-1">
            Pantau dan audit jejak aktivitas penting seluruh pengguna di dalam sistem
          </p>
        </div>
      </div>

      <SecurityLogFilter onFilterChange={setFilters} />
      
      <SecurityLogList logs={logs} isLoading={isLoading} />
    </div>
  );
}
