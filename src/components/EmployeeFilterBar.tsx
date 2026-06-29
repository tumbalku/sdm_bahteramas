"use client";

import { Search, Filter, BadgeCheck, Stethoscope } from "lucide-react";
import { DocumentArchiveCategory } from "@prisma/client";
import { useMasterCategories } from "@/modules/users/hooks";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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

const ARCHIVE_CATEGORY_OPTIONS = [
  { value: "ALL", label: "Semua Kategori Arsip" },
  { value: "UTAMA", label: "Arsip Utama" },
  { value: "PROFESI", label: "Arsip Profesi" },
  { value: "KONDISIONAL", label: "Arsip Kondisional" },
];

export function EmployeeFilterBar({ values, onChange, showArchiveCategory = false }: EmployeeFilterBarProps) {
  const { data: categories } = useMasterCategories();

  const handleUpdate = (updates: Partial<EmployeeFilterState>) => {
    onChange({ ...values, ...updates });
  };

  const currentStatusObj = categories?.employmentStatuses.find((s: any) => s.id === values.employmentStatusId);
  const availableGroups = currentStatusObj?.employeeGroups || [];

  const currentProfessionObj = categories?.professionGroups.find((p: any) => p.id === values.professionGroupId);
  const availablePositions = currentProfessionObj?.employeePositions || [];

  return (
    <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
      {/* Top Row: Search Input & Optional Archive Category Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className={`relative ${showArchiveCategory ? "md:col-span-8" : "md:col-span-12"}`}>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Cari berdasarkan nama atau NIP pegawai..."
            value={values.search || ""}
            onChange={(e) => handleUpdate({ search: e.target.value })}
            className="pl-10 h-10 text-sm font-medium"
          />
        </div>

        {/* Archive Category Filter Select (If Enabled) */}
        {showArchiveCategory && (
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 whitespace-nowrap shrink-0">
              <Filter className="w-3.5 h-3.5 text-primary" /> Filter Arsip:
            </span>
            <Select
              value={values.archiveCategory || "ALL"}
              onChange={(e) => handleUpdate({ archiveCategory: e.target.value as DocumentArchiveCategory | "ALL" })}
              options={ARCHIVE_CATEGORY_OPTIONS}
              className="h-10 text-xs font-bold"
            />
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
          <Select
            value={values.employmentStatusId || ""}
            onChange={(e) => handleUpdate({ employmentStatusId: e.target.value, employeeGroupId: "" })}
            options={categories?.employmentStatuses.map((st: any) => ({ value: st.id, label: st.name }))}
            placeholder="Semua Status Kepegawaian"
            className="h-9 text-xs font-semibold"
          />
        </div>

        {/* Select 2: Jenis / Golongan Kepegawaian */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-muted-foreground">
            Golongan / Kelompok
          </label>
          <Select
            value={values.employeeGroupId || ""}
            onChange={(e) => handleUpdate({ employeeGroupId: e.target.value })}
            disabled={!values.employmentStatusId}
            options={availableGroups.map((grp: any) => ({ value: grp.id, label: grp.name }))}
            placeholder="Semua Golongan"
            className="h-9 text-xs font-semibold"
          />
        </div>

        {/* Select 3: Kelompok Profesi */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-primary" /> Kelompok Profesi
          </label>
          <Select
            value={values.professionGroupId || ""}
            onChange={(e) => handleUpdate({ professionGroupId: e.target.value, employeePositionId: "" })}
            options={categories?.professionGroups.map((pf: any) => ({ value: pf.id, label: pf.name }))}
            placeholder="Semua Kelompok Profesi"
            className="h-9 text-xs font-semibold"
          />
        </div>

        {/* Select 4: Jabatan */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-muted-foreground">
            Jabatan Pegawai
          </label>
          <Select
            value={values.employeePositionId || ""}
            onChange={(e) => handleUpdate({ employeePositionId: e.target.value })}
            disabled={!values.professionGroupId}
            options={availablePositions.map((pos: any) => ({ value: pos.id, label: pos.name }))}
            placeholder="Semua Jabatan"
            className="h-9 text-xs font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
