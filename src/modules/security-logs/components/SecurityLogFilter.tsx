"use client";

import { useState } from "react";
import { SecurityLogFilterParams } from "../types";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface SecurityLogFilterProps {
  onFilterChange: (filters: SecurityLogFilterParams) => void;
}

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
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      
      <div className="flex-1 w-full">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Tanggal Selesai</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex-1 w-full">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Jenis Aktivitas</label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Semua Aktivitas</option>
          <option value="USER_LOGIN">User Login</option>
          <option value="USER_LOGOUT">User Logout</option>
          <option value="DOCUMENT_UPLOADED">Upload Dokumen</option>
          <option value="DOCUMENT_DELETED">Hapus Dokumen</option>
          <option value="DOCUMENT_APPROVED">Dokumen Disetujui</option>
          <option value="DOCUMENT_REJECTED">Dokumen Ditolak</option>
          <option value="PROFILE_UPDATED">Update Profil</option>
          <option value="PASSWORD_CHANGED">Ganti Password</option>
        </select>
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <Button onClick={handleReset} variant="outline" className="rounded-xl px-3 flex-1 md:flex-none">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button onClick={handleApply} className="rounded-xl flex-1 md:flex-none">
          <Search className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
    </div>
  );
}
