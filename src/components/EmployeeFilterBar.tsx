"use client";

import { BadgeCheck, BriefcaseBusiness, CalendarDays, Filter, GraduationCap, Heart, Search, Stethoscope } from "lucide-react";
import type { DocumentArchiveCategory } from "@prisma/client";
import type { MasterCategories } from "@/modules/users/types";
import { EDUCATION_OPTIONS, MARITAL_STATUS_OPTIONS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form";

export interface EmployeeFilterState {
  search: string;
  employmentStatusId: string;
  employeeGroupId: string;
  employeeRankId: string;
  professionGroupId: string;
  employeePositionId: string;
  workplaceId?: string;
  tmtStartDate?: string;
  tmtEndDate?: string;
  retirementAgeMin?: number | "";
  retirementAgeMax?: number | "";
  maritalStatus?: string;
  lastEducation?: string;
  archiveCategory?: DocumentArchiveCategory | "ALL";
}

interface EmployeeFilterBarProps {
  values: EmployeeFilterState;
  onChange: (newValues: EmployeeFilterState) => void;
  categories?: MasterCategories;
  showArchiveCategory?: boolean;
}

const ARCHIVE_CATEGORY_OPTIONS: { value: DocumentArchiveCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "Semua Kategori Arsip" },
  { value: "UTAMA", label: "Arsip Utama" },
  { value: "PROFESI", label: "Arsip Profesi" },
  { value: "KONDISIONAL", label: "Arsip Kondisional" },
];

export function EmployeeFilterBar({ values, onChange, categories, showArchiveCategory = false }: EmployeeFilterBarProps) {
  const handleUpdate = (updates: Partial<EmployeeFilterState>) => {
    onChange({ ...values, ...updates });
  };

  const handleNumberUpdate = (key: "retirementAgeMin" | "retirementAgeMax", value: string) => {
    handleUpdate({ [key]: value === "" ? "" : Number(value) });
  };

  const currentStatusObj = categories?.employmentStatuses.find((status) => status.id === values.employmentStatusId);
  const availableGroups = currentStatusObj?.employeeGroups || [];

  const currentProfessionObj = categories?.professionGroups.find((profession) => profession.id === values.professionGroupId);
  const availablePositions = currentProfessionObj?.employeePositions || [];

  return (
    <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder="Cari berdasarkan nama atau NIP pegawai..."
          value={values.search || ""}
          onChange={(e) => handleUpdate({ search: e.target.value })}
          className="pl-10 h-10 text-sm font-medium"
        />
      </div>

      {/* Detailed Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/60">
        {showArchiveCategory && (
          <FormField
            label={
              <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <Filter className="w-3.5 h-3.5 text-primary" /> Filter Arsip
              </span>
            }
          >
            <Select
              value={values.archiveCategory || "ALL"}
              onChange={(e) => handleUpdate({ archiveCategory: e.target.value as DocumentArchiveCategory | "ALL" })}
              options={ARCHIVE_CATEGORY_OPTIONS}
              className="h-9 text-xs font-semibold"
            />
          </FormField>
        )}

        {/* Select 1: Status Kepegawaian */}
        <FormField
          label={
            <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <BadgeCheck className="w-3.5 h-3.5 text-primary" /> Status Kepegawaian
            </span>
          }
        >
          <Select
            value={values.employmentStatusId || ""}
            onChange={(e) => handleUpdate({ employmentStatusId: e.target.value, employeeGroupId: "" })}
            options={categories?.employmentStatuses.map((status) => ({ value: status.id, label: status.name }))}
            placeholder="Semua Status Kepegawaian"
            className="h-9 text-xs font-semibold"
          />
        </FormField>

        {/* Select 2: Jenis Kepegawaian */}
        <FormField label={<span className="text-[11px] font-semibold text-muted-foreground">Jenis kepegawaian</span>}>
          <Select
            value={values.employeeGroupId || ""}
            onChange={(e) => handleUpdate({ employeeGroupId: e.target.value })}
            disabled={!values.employmentStatusId}
            options={availableGroups.map((group) => ({ value: group.id, label: group.name }))}
            placeholder="Semua Jenis Kepegawaian"
            className="h-9 text-xs font-semibold"
          />
        </FormField>

        {/* Select 3: Kelompok Profesi */}
        <FormField
          label={
            <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Stethoscope className="w-3.5 h-3.5 text-primary" /> Kelompok Profesi
            </span>
          }
        >
          <Select
            value={values.professionGroupId || ""}
            onChange={(e) => handleUpdate({ professionGroupId: e.target.value, employeePositionId: "" })}
            options={categories?.professionGroups.map((profession) => ({ value: profession.id, label: profession.name }))}
            placeholder="Semua Kelompok Profesi"
            className="h-9 text-xs font-semibold"
          />
        </FormField>

        {/* Select 4: Jabatan */}
        <FormField label={<span className="text-[11px] font-semibold text-muted-foreground">Jabatan Pegawai</span>}>
          <Select
            value={values.employeePositionId || ""}
            onChange={(e) => handleUpdate({ employeePositionId: e.target.value })}
            disabled={!values.professionGroupId}
            options={availablePositions.map((position) => ({ value: position.id, label: position.name }))}
            placeholder="Semua Jabatan"
            className="h-9 text-xs font-semibold"
          />
        </FormField>

        <FormField label={<span className="text-[11px] font-semibold text-muted-foreground">Golongan</span>}>
          <Select
            value={values.employeeRankId || ""}
            onChange={(e) => handleUpdate({ employeeRankId: e.target.value })}
            options={categories?.employeeRanks.map((rank) => ({ value: rank.id, label: rank.name }))}
            placeholder="Semua Golongan"
            className="h-9 text-xs font-semibold"
          />
        </FormField>

        <FormField
          label={
            <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <BriefcaseBusiness className="w-3.5 h-3.5 text-primary" /> Unit Kerja
            </span>
          }
        >
          <Select
            value={values.workplaceId || ""}
            onChange={(e) => handleUpdate({ workplaceId: e.target.value })}
            options={categories?.workplaces.map((workplace) => ({ value: workplace.id, label: workplace.name }))}
            placeholder="Semua Unit Kerja"
            className="h-9 text-xs font-semibold"
          />
        </FormField>

        <FormField
          label={
            <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <Heart className="w-3.5 h-3.5 text-primary" /> Status Pernikahan
            </span>
          }
        >
          <Select
            value={values.maritalStatus || ""}
            onChange={(e) => handleUpdate({ maritalStatus: e.target.value })}
            options={MARITAL_STATUS_OPTIONS}
            placeholder="Semua Status Pernikahan"
            className="h-9 text-xs font-semibold"
          />
        </FormField>

        <FormField
          label={
            <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <GraduationCap className="w-3.5 h-3.5 text-primary" /> Pendidikan Terakhir
            </span>
          }
        >
          <Select
            value={values.lastEducation || ""}
            onChange={(e) => handleUpdate({ lastEducation: e.target.value })}
            options={EDUCATION_OPTIONS}
            placeholder="Semua Pendidikan"
            className="h-9 text-xs font-semibold"
          />
        </FormField>

        <FormField label={<span className="text-[11px] font-semibold text-muted-foreground">TMT Awal</span>}>
          <Input
            type="date"
            value={values.tmtStartDate || ""}
            onChange={(e) => handleUpdate({ tmtStartDate: e.target.value })}
            className="h-9 text-xs font-semibold"
          />
        </FormField>

        <FormField label={<span className="text-[11px] font-semibold text-muted-foreground">TMT Akhir / Kontrak</span>}>
          <Input
            type="date"
            value={values.tmtEndDate || ""}
            onChange={(e) => handleUpdate({ tmtEndDate: e.target.value })}
            className="h-9 text-xs font-semibold"
          />
        </FormField>

        <FormField
          label={
            <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5 text-primary" /> Usia Masa Pensiun
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              value={values.retirementAgeMin ?? ""}
              onChange={(e) => handleNumberUpdate("retirementAgeMin", e.target.value)}
              placeholder="Dari usia"
              className="h-9 text-xs font-semibold"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={values.retirementAgeMax ?? ""}
              onChange={(e) => handleNumberUpdate("retirementAgeMax", e.target.value)}
              placeholder="Sampai"
              className="h-9 text-xs font-semibold"
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}
