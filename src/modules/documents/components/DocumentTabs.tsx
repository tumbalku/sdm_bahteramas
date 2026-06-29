"use client";

import { DocumentArchiveCategory } from "@prisma/client";
import { cn } from "@/lib/utils";

export interface TabStat {
  uploaded: number;
  total: number;
  percentage: number;
}

interface DocumentTabsProps {
  activeTab: DocumentArchiveCategory;
  onChange: (tab: DocumentArchiveCategory) => void;
  stats?: Record<DocumentArchiveCategory, TabStat>;
}

const TABS: { id: DocumentArchiveCategory; label: string }[] = [
  { id: "UTAMA", label: "Arsip Utama" },
  { id: "KONDISIONAL", label: "Arsip Kondisional" },
  { id: "PROFESI", label: "Arsip Profesi" },
];

export function DocumentTabs({ activeTab, onChange, stats }: DocumentTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 bg-muted/50 p-1.5 rounded-2xl w-full sm:w-fit mb-6">
      {TABS.map((tab) => {
        const stat = stats?.[tab.id] || { uploaded: 0, total: 0, percentage: 0 };
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-out",
              isActive
                ? "bg-background text-foreground shadow-sm scale-100"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 scale-95 hover:scale-100"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-bold transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              ({stat.uploaded}/{stat.total})
            </span>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-md",
                stat.percentage === 100
                  ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                  : isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground"
              )}
            >
              {stat.percentage}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
