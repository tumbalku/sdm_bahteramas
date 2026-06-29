"use client";

import { useState, useEffect } from "react";
import { useMasterCategories } from "@/modules/users/hooks";
import { Loader2, Users, ShieldCheck, Briefcase, Award, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TargetCriteriaSelectorProps {
  selectedStatuses: string[];
  setSelectedStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  selectedGroups: string[];
  setSelectedGroups: React.Dispatch<React.SetStateAction<string[]>>;
  selectedProfessions: string[];
  setSelectedProfessions: React.Dispatch<React.SetStateAction<string[]>>;
  selectedRanks: string[];
  setSelectedRanks: React.Dispatch<React.SetStateAction<string[]>>;
  selectedWorkplaces: string[];
  setSelectedWorkplaces: React.Dispatch<React.SetStateAction<string[]>>;
}

export function TargetCriteriaSelector({
  selectedStatuses,
  setSelectedStatuses,
  selectedGroups,
  setSelectedGroups,
  selectedProfessions,
  setSelectedProfessions,
  selectedRanks,
  setSelectedRanks,
  selectedWorkplaces,
  setSelectedWorkplaces,
}: TargetCriteriaSelectorProps) {
  const { data: categories, isLoading } = useMasterCategories();
  const [activeTab, setActiveTab] = useState<"STATUS" | "GROUP" | "PROFESSION" | "RANK" | "WORKPLACE">("STATUS");

  useEffect(() => {
    if (selectedStatuses.length > 0 && categories?.employmentStatuses) {
      const validGroupIds = new Set(
        categories.employmentStatuses
          .filter((s: any) => selectedStatuses.includes(s.id))
          .flatMap((s: any) => (s.employeeGroups || []).map((g: any) => g.id))
      );
      setSelectedGroups((prev) => prev.filter((id) => validGroupIds.has(id)));
    }
  }, [selectedStatuses, categories, setSelectedGroups]);

  if (isLoading) {
    return (
      <div className="p-6 bg-muted/20 rounded-2xl border border-border/60 flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="text-xs font-medium">Memuat kriteria target kepegawaian...</span>
      </div>
    );
  }

  const employmentStatuses = categories?.employmentStatuses || [];
  const professionGroups = categories?.professionGroups || [];
  const employeeRanks = categories?.employeeRanks || [];
  const workplaces = categories?.workplaces || [];

  // Filter visible statuses for the Group tab based on active status selections
  const visibleStatusesForGroups = selectedStatuses.length > 0
    ? employmentStatuses.filter((s: any) => selectedStatuses.includes(s.id))
    : employmentStatuses;

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, id: string) => {
    setList((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const tabs = [
    { id: "STATUS", label: "Status Kepegawaian", count: selectedStatuses.length, icon: ShieldCheck },
    { id: "GROUP", label: "Jenis Kepegawaian", count: selectedGroups.length, icon: Briefcase },
    { id: "PROFESSION", label: "Kelompok Profesi", count: selectedProfessions.length, icon: Users },
    { id: "RANK", label: "Pangkat / Golongan", count: selectedRanks.length, icon: Award },
    { id: "WORKPLACE", label: "Tempat Tugas", count: selectedWorkplaces.length, icon: Building2 },
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Target Sasaran Pegawai (Kualifikasi Unggah)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tentukan kelompok pegawai yang wajib atau diizinkan memiliki jenis dokumen ini. (Kosongkan jika berlaku untuk <span className="font-semibold text-foreground">Semua Pegawai</span>).
          </p>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-bold ml-1",
                    isActive ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="p-4 bg-muted/20 rounded-2xl border border-border/60 min-h-[120px]">
        {/* STATUS TAB */}
        {activeTab === "STATUS" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Pilih Status Kepegawaian Target:</span>
              {selectedStatuses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedStatuses([])}
                  className="text-[11px] text-destructive hover:underline font-semibold"
                >
                  Reset (Pilih Semua)
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {employmentStatuses.map((st: any) => {
                const isSelected = selectedStatuses.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleItem(selectedStatuses, setSelectedStatuses, st.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer select-none",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    <span>{st.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedStatuses.length === 0 && (
              <p className="text-[11px] text-muted-foreground italic mt-2">
                * Berlaku untuk seluruh status kepegawaian (ASN & Non ASN).
              </p>
            )}
          </div>
        )}

        {/* GROUP TAB */}
        {activeTab === "GROUP" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                Pilih Jenis Kepegawaian Target {selectedStatuses.length > 0 && `(Disaring berdasarkan Status yang dipilih)`}:
              </span>
              {selectedGroups.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedGroups([])}
                  className="text-[11px] text-destructive hover:underline font-semibold"
                >
                  Reset (Pilih Semua)
                </button>
              )}
            </div>

            <div className="space-y-3 pt-1">
              {visibleStatusesForGroups.map((st: any) => {
                const groups = st.employeeGroups || [];
                if (groups.length === 0) return null;

                return (
                  <div key={st.id} className="p-3 bg-card/60 rounded-xl border border-border/40 space-y-2">
                    <div className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Status: {st.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {groups.map((grp: any) => {
                        const isSelected = selectedGroups.includes(grp.id);
                        return (
                          <button
                            key={grp.id}
                            type="button"
                            onClick={() => toggleItem(selectedGroups, setSelectedGroups, grp.id)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                                : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                            <span>{grp.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedGroups.length === 0 && (
              <p className="text-[11px] text-muted-foreground italic mt-1">
                * Berlaku untuk seluruh jenis kepegawaian.
              </p>
            )}
          </div>
        )}

        {/* PROFESSION TAB */}
        {activeTab === "PROFESSION" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Pilih Kelompok Profesi Target:</span>
              {selectedProfessions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedProfessions([])}
                  className="text-[11px] text-destructive hover:underline font-semibold"
                >
                  Reset (Pilih Semua)
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {professionGroups.map((prof: any) => {
                const isSelected = selectedProfessions.includes(prof.id);
                return (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => toggleItem(selectedProfessions, setSelectedProfessions, prof.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer select-none",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    <span>{prof.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedProfessions.length === 0 && (
              <p className="text-[11px] text-muted-foreground italic mt-2">
                * Berlaku untuk seluruh kelompok profesi (Medis, Keperawatan, Administrasi, dll).
              </p>
            )}
          </div>
        )}

        {/* RANK TAB */}
        {activeTab === "RANK" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Pilih Pangkat / Golongan Target:</span>
              {selectedRanks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedRanks([])}
                  className="text-[11px] text-destructive hover:underline font-semibold"
                >
                  Reset (Pilih Semua)
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {employeeRanks.map((rnk: any) => {
                const isSelected = selectedRanks.includes(rnk.id);
                return (
                  <button
                    key={rnk.id}
                    type="button"
                    onClick={() => toggleItem(selectedRanks, setSelectedRanks, rnk.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer select-none",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    <span>{rnk.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedRanks.length === 0 && (
              <p className="text-[11px] text-muted-foreground italic mt-2">
                * Berlaku untuk seluruh pangkat dan golongan pegawai.
              </p>
            )}
          </div>
        )}

        {/* WORKPLACE TAB */}
        {activeTab === "WORKPLACE" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Pilih Tempat Tugas / Unit Kerja Target:</span>
              {selectedWorkplaces.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedWorkplaces([])}
                  className="text-[11px] text-destructive hover:underline font-semibold"
                >
                  Reset (Pilih Semua)
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1 max-h-44 overflow-y-auto pr-1">
              {workplaces.map((wp: any) => {
                const isSelected = selectedWorkplaces.includes(wp.id);
                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => toggleItem(selectedWorkplaces, setSelectedWorkplaces, wp.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer select-none",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    <span>{wp.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedWorkplaces.length === 0 && (
              <p className="text-[11px] text-muted-foreground italic mt-2">
                * Berlaku untuk seluruh unit kerja dan tempat tugas.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
