"use client";

import { DocumentArchiveCategory } from "@prisma/client";
import { cn } from "@/lib/utils";

interface DocumentTabsProps {
  activeTab: DocumentArchiveCategory;
  onChange: (tab: DocumentArchiveCategory) => void;
}

const TABS: { id: DocumentArchiveCategory; label: string }[] = [
  { id: "UTAMA", label: "Arsip Utama" },
  { id: "KONDISIONAL", label: "Arsip Kondisional" },
  { id: "PROFESI", label: "Arsip Profesi" },
];

export function DocumentTabs({ activeTab, onChange }: DocumentTabsProps) {
  return (
    <div className="flex space-x-1 bg-muted/50 p-1 rounded-xl w-fit mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-out",
            activeTab === tab.id
              ? "bg-background text-foreground shadow-sm scale-100"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50 scale-95 hover:scale-100"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
