"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  UserPlus,
  ArrowLeft,
  Save,
  User,
  Briefcase,
  ShieldCheck,
  Building2,
  Award,
} from "lucide-react";
import { useCreateUser, useUpdateUser, useUser } from "../hooks";
import { CreateUserInput, UserRecord } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserFormViewProps {
  userId?: string; // Jika ada userId, maka mode EDIT
}

interface MasterCategories {
  employmentStatuses: { id: string; name: string; employeeGroups: { id: string; name: string }[] }[];
  professionGroups: { id: string; name: string; employeePositions: { id: string; name: string }[] }[];
  employeeRanks: { id: string; name: string }[];
  workplaces: { id: string; name: string }[];
}

export function UserFormView({ userId }: UserFormViewProps) {
  const router = useRouter();
  const isEditMode = !!userId;

  const { data: existingUser, isLoading: isLoadingUser } = useUser(userId || "");
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  // Categories Master Data
  const [categories, setCategories] = useState<MasterCategories | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Form States
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [gender, setGender] = useState("L");
  const [birthDate, setBirthDate] = useState("");

  const [employmentStatusId, setEmploymentStatusId] = useState("");
  const [employeeGroupId, setEmployeeGroupId] = useState("");
  const [professionGroupId, setProfessionGroupId] = useState("");
  const [employeePositionId, setEmployeePositionId] = useState("");
  const [employeeRankId, setEmployeeRankId] = useState("");
  const [workplaceId, setWorkplaceId] = useState("");

  // Fetch Master Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/v1/users/categories");
        const json = await res.json();
        if (res.ok && json.success) {
          setCategories(json.data);
        }
      } catch (err) {
        toast.error("Gagal memuat data master kategori");
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Populate Existing User Data in Edit Mode
  useEffect(() => {
    if (existingUser) {
      setEmployeeId(existingUser.employeeId);
      setEmail(existingUser.email);
      setPassword("");
      setName(existingUser.name);
      setRole(existingUser.role);
      setGender(existingUser.gender || "L");
      setBirthDate(
        existingUser.birthDate ? format(new Date(existingUser.birthDate), "yyyy-MM-dd") : ""
      );

      setEmploymentStatusId(existingUser.employmentStatus?.id || "");
      setEmployeeGroupId(existingUser.employeeGroup?.id || "");
      setProfessionGroupId(existingUser.professionGroup?.id || "");
      setEmployeePositionId(existingUser.employeePosition?.id || "");
      setEmployeeRankId(existingUser.employeeRank?.id || "");
      setWorkplaceId(existingUser.workplace?.id || "");
    }
  }, [existingUser]);

  // Available sub-items based on parent selection
  const selectedStatusObj = categories?.employmentStatuses.find((s) => s.id === employmentStatusId);
  const availableGroups = selectedStatusObj?.employeeGroups || [];

  const selectedProfObj = categories?.professionGroups.find((p) => p.id === professionGroupId);
  const availablePositions = selectedProfObj?.employeePositions || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateUserInput = {
      employeeId,
      email,
      name,
      role,
      gender,
      birthDate: birthDate || undefined,
      employmentStatusId: employmentStatusId || undefined,
      employeeGroupId: employeeGroupId || undefined,
      professionGroupId: professionGroupId || undefined,
      employeePositionId: employeePositionId || undefined,
      employeeRankId: employeeRankId || undefined,
      workplaceId: workplaceId || undefined,
    };

    if (password) {
      payload.password = password;
    }

    if (isEditMode) {
      updateMutation.mutate(
        { id: userId, input: payload },
        {
          onSuccess: () => {
            router.push("/users");
          },
        }
      );
    } else {
      if (!password) {
        payload.password = "Pegawai123!"; // Default password
      }
      createMutation.mutate(payload, {
        onSuccess: () => {
          router.push("/users");
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-10 h-10 mb-4 animate-spin text-primary" />
        <p className="text-sm font-semibold">Memuat Data Pegawai...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={UserPlus}
        title={isEditMode ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
        description={
          isEditMode
            ? `Memperbarui profil dan kualifikasi pegawai (${existingUser?.name})`
            : "Tambahkan akun pengguna dan isi lengkap data master kepegawaian."
        }
        action={
          <Link href="/users">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Batal & Kembali
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        {/* Section 1: Informasi Akun & Demografi */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">1. Informasi Akun & Biodata</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                NIP / ID Pegawai <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Contoh: 199001012020011001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: dr. Ahmad Fajar, Sp.PD"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email Sistem (Login) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pegawai@rsud.go.id"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Role Hak Akses <span className="text-red-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="EMPLOYEE">EMPLOYEE (Pegawai Biasa)</option>
                <option value="STAFF">STAFF (Verifikator Dokumen)</option>
                <option value="ADMIN">ADMIN (Administrator Akses Penuh)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                {isEditMode ? "Kata Sandi Baru (Kosongkan jika tidak diganti)" : "Kata Sandi (Default: Pegawai123!)"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditMode ? "Isi hanya jika ingin mengubah kata sandi" : "Pegawai123!"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Kategori & Kualifikasi Kepegawaian */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">2. Master Kategori & Kualifikasi Kepegawaian</h3>
          </div>

          {isLoadingCategories ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat daftar kategori...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Kepegawaian */}
              <div>
                <label className="block text-sm font-medium mb-1">Status Kepegawaian</label>
                <select
                  value={employmentStatusId}
                  onChange={(e) => {
                    setEmploymentStatusId(e.target.value);
                    setEmployeeGroupId(""); // Reset child selection
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">-- Pilih Status (e.g. ASN, Non ASN) --</option>
                  {categories?.employmentStatuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jenis Kepegawaian */}
              <div>
                <label className="block text-sm font-medium mb-1">Jenis Kepegawaian (Sub-Status)</label>
                <select
                  value={employeeGroupId}
                  onChange={(e) => setEmployeeGroupId(e.target.value)}
                  disabled={!employmentStatusId || availableGroups.length === 0}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                >
                  <option value="">-- Pilih Jenis (e.g. PNS, PPPK) --</option>
                  {availableGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kelompok Profesi */}
              <div>
                <label className="block text-sm font-medium mb-1">Kelompok Profesi</label>
                <select
                  value={professionGroupId}
                  onChange={(e) => {
                    setProfessionGroupId(e.target.value);
                    setEmployeePositionId(""); // Reset child selection
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">-- Pilih Profesi (e.g. Medis, Administrasi) --</option>
                  {categories?.professionGroups.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jabatan */}
              <div>
                <label className="block text-sm font-medium mb-1">Jabatan (Sub-Profesi)</label>
                <select
                  value={employeePositionId}
                  onChange={(e) => setEmployeePositionId(e.target.value)}
                  disabled={!professionGroupId || availablePositions.length === 0}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                >
                  <option value="">-- Pilih Jabatan (e.g. Dokter, Programmer) --</option>
                  {availablePositions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pangkat & Golongan */}
              <div>
                <label className="block text-sm font-medium mb-1">Pangkat / Golongan</label>
                <select
                  value={employeeRankId}
                  onChange={(e) => setEmployeeRankId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">-- Pilih Pangkat (e.g. Pembina (IV/a)) --</option>
                  {categories?.employeeRanks.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tempat Tugas */}
              <div>
                <label className="block text-sm font-medium mb-1">Tempat Tugas / Unit Kerja</label>
                <select
                  value={workplaceId}
                  onChange={(e) => setWorkplaceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">-- Pilih Tempat Tugas (e.g. Ruang ICCU) --</option>
                  {categories?.workplaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Action Submit Buttons */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Link href="/users">
            <Button type="button" variant="outline" className="rounded-xl px-6">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 shadow-md shadow-primary/25">
            {isSubmitting ? (
              <span className="inline-flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Menyimpan...</span>
              </span>
            ) : (
              <span className="inline-flex items-center">
                <Save className="w-4 h-4 mr-2" />
                <span>{isEditMode ? "Simpan Perubahan" : "Simpan Pegawai Baru"}</span>
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
