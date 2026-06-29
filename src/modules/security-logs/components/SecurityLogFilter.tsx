"use client";

import { useState } from "react";
import { SecurityLogFilterParams } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";

interface SecurityLogFilterProps {
  onFilterChange: (filters: SecurityLogFilterParams) => void;
}

const EVENT_TYPE_OPTIONS = [
  { value: "DOCUMENT_UPLOADED", label: "Upload Dokumen" },
  { value: "DOCUMENT_DELETED", label: "Hapus Dokumen" },
  { value: "DOCUMENT_APPROVED", label: "Dokumen Disetujui" },
  { value: "DOCUMENT_REJECTED", label: "Dokumen Ditolak" },
];

export function SecurityLogFilter({ onFilterChange }: SecurityLogFilterProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventType, setEventType] = useState("");

  const handleApply = () => {
    onFilterChange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      eventType: eventType || undefined,
    });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setEventType("");
    onFilterChange({});
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Tanggal Mulai</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-10"
        />
      </div>
      
      <div className="flex-1 w-full">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Tanggal Selesai</label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-10"
        />
      </div>

      <div className="flex-1 w-full">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Jenis Aktivitas</label>
        <Select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          options={EVENT_TYPE_OPTIONS}
          placeholder="Semua Aktivitas Dokumen"
          className="h-10"
        />
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <Button onClick={handleReset} variant="outline" className="rounded-xl px-3 flex-1 md:flex-none h-10">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button onClick={handleApply} className="rounded-xl flex-1 md:flex-none h-10">
          <Search className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
    </div>
  );
}
