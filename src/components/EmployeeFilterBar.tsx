"use client";

import { Search, Filter, BadgeCheck, Stethoscope } from "lucide-react";
import { DocumentArchiveCategory } from "@prisma/client";
import { useMasterCategories } from "@/modules/users/hooks";

export interface EmployeeFilterState {
  search: string;
  employmentStatusId: string;
  employeeGroupId: string;
  professionGroupId: string;
  employeePositionId: string;
  archiveCategory?: DocumentArchiveCategory | "ALL";
}

interface EmployeeFilterBarProps {
  values: EmployeeFilterState;
  onChange: (newValues: EmployeeFilterState) => void;
  showArchiveCategory?: boolean;
}

export function EmployeeFilterBar({ values, onChange, showArchiveCategory = false }: EmployeeFilterBarProps) {
  const { data: categories } = useMasterCategories();

  const handleUpdate = (updates: Partial<EmployeeFilterState>) => {
    onChange({ ...values, ...updates });
  };

  const currentStatusObj = categories?.employmentStatuses.find((s) => s.id === values.employmentStatusId);
  const availableGroups = currentStatusObj?.employeeGroups || [];

  const currentProfessionObj = categories?.professionGroups.find((p) => p.id === values.professionGroupId);
  const availablePositions = currentProfessionObj?.employeePositions || [];

  return (
    <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
      {/* Top Row: Search Input & Optional Archive Category Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className={`relative ${showArchiveCategory ? "md:col-span-8" : "md:col-span-12"}`}>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau NIP pegawai..."
            value={values.search || ""}
            onChange={(e) => handleUpdate({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
          />
        </div>

        {/* Archive Category Filter Select (If Enabled) */}
        {showArchiveCategory && (
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 whitespace-nowrap shrink-0">
              <Filter className="w-3.5 h-3.5 text-primary" /> Filter Arsip:
            </span>
            <select
              value={values.archiveCategory || "ALL"}
              onChange={(e) => handleUpdate({ archiveCategory: e.target.value as DocumentArchiveCategory | "ALL" })}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="ALL">Semua Kategori Arsip</option>
              <option value="UTAMA">Arsip Utama</option>
              <option value="PROFESI">Arsip Profesi</option>
              <option value="KONDISIONAL">Arsip Kondisional</option>
            </select>
          </div>
        )}
      </div>

      {/* Bottom Row: Detailed Employment Select Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/60">
        {/* Select 1: Status Kepegawaian */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-primary" /> Status Kepegawaian
          </label>
          <select
            value={values.employmentStatusId || ""}
            onChange={(e) => handleUpdate({ employmentStatusId: e.target.value, employeeGroupId: "" })}
            className="w-full px-3 py-1.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="">Semua Status Kepegawaian</option>
            {categories?.employmentStatuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Select 2: Jenis / Golongan Kepegawaian */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-muted-foreground">
            Golongan / Kelompok
          </label>
          <select
            value={values.employeeGroupId || ""}
            onChange={(e) => handleUpdate({ employeeGroupId: e.target.value })}
            disabled={!values.employmentStatusId}
            className="w-full px-3 py-1.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Semua Golongan</option>
            {availableGroups.map((grp) => (
              <option key={grp.id} value={grp.id}>
                {grp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Select 3: Kelompok Profesi */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-primary" /> Kelompok Profesi
          </label>
          <select
            value={values.professionGroupId || ""}
            onChange={(e) => handleUpdate({ professionGroupId: e.target.value, employeePositionId: "" })}
            className="w-full px-3 py-1.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="">Semua Kelompok Profesi</option>
            {categories?.professionGroups.map((pf) => (
              <option key={pf.id} value={pf.id}>
                {pf.name}
              </option>
            ))}
          </select>
        </div>

        {/* Select 4: Jabatan */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-muted-foreground">
            Jabatan Pegawai
          </label>
          <select
            value={values.employeePositionId || ""}
            onChange={(e) => handleUpdate({ employeePositionId: e.target.value })}
            disabled={!values.professionGroupId}
            className="w-full px-3 py-1.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Semua Jabatan</option>
            {availablePositions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
