"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  UserPlus,
  ArrowLeft,
  Save,
  User,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { useCreateUser, useUpdateUser, useUser } from "../hooks";
import { CreateUserInput } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  RELIGION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  GENDER_OPTIONS,
  EDUCATION_OPTIONS,
} from "@/lib/constants";

const ROLE_OPTIONS = [
  { value: "EMPLOYEE", label: "EMPLOYEE (Pegawai Biasa)" },
  { value: "STAFF", label: "STAFF (Verifikator Dokumen)" },
  { value: "ADMIN", label: "ADMIN (Administrator Akses Penuh)" },
];

interface UserFormViewProps {
  userId?: string;
}

interface MasterCategories {
  employmentStatuses: { id: string; name: string; employeeGroups: { id: string; name: string }[] }[];
  professionGroups: { id: string; name: string; employeePositions: { id: string; name: string }[] }[];
  employeeRanks: { id: string; name: string }[];
  workplaces: { id: string; name: string }[];
}

export function UserFormView({ userId }: UserFormViewProps) {
  const router = useRouter();
  const isEditMode = Boolean(userId);

  const { data: existingUser, isLoading: isLoadingUser } = useUser(userId || "");

  const [categories, setCategories] = useState<MasterCategories | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [employeeId, setEmployeeId] = useState("");
  const [nik, setNik] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [gender, setGender] = useState("L");
  const [birthDate, setBirthDate] = useState("");
  const [academicDegree, setAcademicDegree] = useState("");
  const [lastEducation, setLastEducation] = useState("");
  const [religion, setReligion] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [joinDate, setJoinDate] = useState("");

  const [employmentStatusId, setEmploymentStatusId] = useState("");
  const [employeeGroupId, setEmployeeGroupId] = useState("");
  const [professionGroupId, setProfessionGroupId] = useState("");
  const [employeePositionId, setEmployeePositionId] = useState("");
  const [employeeRankId, setEmployeeRankId] = useState("");
  const [workplaceId, setWorkplaceId] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/v1/users/categories");
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setCategories(json.data);
        }
      } catch (err) {
        toast.error("Gagal memuat master data kategori");
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditMode && existingUser) {
      setEmployeeId(existingUser.employeeId || "");
      setNik(existingUser.nik || "");
      setName(existingUser.name || "");
      setEmail(existingUser.email || "");
      setRole(existingUser.role || "EMPLOYEE");
      setGender(existingUser.gender || "L");
      setBirthDate(existingUser.birthDate ? format(new Date(existingUser.birthDate), "yyyy-MM-dd") : "");
      setAcademicDegree(existingUser.academicDegree || "");
      setLastEducation(existingUser.lastEducation || "");
      setReligion(existingUser.religion || "");
      setMaritalStatus(existingUser.maritalStatus || "");
      setPhone(existingUser.phone || "");
      setAddress(existingUser.address || "");
      setJoinDate(existingUser.joinDate ? format(new Date(existingUser.joinDate), "yyyy-MM-dd") : "");

      setEmploymentStatusId(existingUser.employmentStatus?.id || "");
      setEmployeeGroupId(existingUser.employeeGroup?.id || "");
      setProfessionGroupId(existingUser.professionGroup?.id || "");
      setEmployeePositionId(existingUser.employeePosition?.id || "");
      setEmployeeRankId(existingUser.employeeRank?.id || "");
      setWorkplaceId(existingUser.workplace?.id || "");
    }
  }, [isEditMode, existingUser]);

  const availableGroups =
    categories?.employmentStatuses.find((s) => s.id === employmentStatusId)?.employeeGroups || [];

  const availablePositions =
    categories?.professionGroups.find((p) => p.id === professionGroupId)?.employeePositions || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeId || !name || !email) {
      toast.error("NIP, Nama, dan Email wajib diisi!");
      return;
    }

    const payload: any = {
      employeeId,
      nik: nik || null,
      name,
      email,
      role,
      gender,
      birthDate: birthDate || null,
      academicDegree: academicDegree || null,
      lastEducation: lastEducation || null,
      religion: religion || null,
      maritalStatus: maritalStatus || null,
      phone: phone || null,
      address: address || null,
      joinDate: joinDate || null,
      employmentStatusId: employmentStatusId || null,
      employeeGroupId: employeeGroupId || null,
      professionGroupId: professionGroupId || null,
      employeePositionId: employeePositionId || null,
      employeeRankId: employeeRankId || null,
      workplaceId: workplaceId || null,
    };

    if (password) {
      payload.password = password;
    }

    if (isEditMode && userId) {
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
        payload.password = "Pegawai123!";
      }
      createMutation.mutate(payload as CreateUserInput, {
        onSuccess: () => {
          router.push("/users");
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingUser) {
    return (
      <div className="space-y-6 animate-fade-in max-w-5xl pb-8">
        <CardSkeleton count={3} gridClassName="grid grid-cols-1 gap-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <PageHeader
        icon={UserPlus}
        title={isEditMode ? "Edit Pegawai" : "Tambah Pegawai"}
        description={
          isEditMode
            ? "Perbarui informasi profil, biodata, serta kualifikasi kepegawaian pengguna"
            : "Tambahkan akun dan data kualifikasi pegawai baru ke dalam sistem"
        }
        action={
          <Link href="/users">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl">
        {/* Section 1: Kredensial Akses & Akun */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">1. Kredensial Akses & Identitas Otentikasi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="NIP / NRK (Nomor Induk Pegawai)" required>
              <Input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Contoh: 199001012015011001"
                className="font-mono"
                required
              />
            </FormField>

            <FormField label="NIK (Nomor Induk Kependudukan / KTP)">
              <Input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="16 Digit NIK KTP..."
                className="font-mono"
              />
            </FormField>

            <FormField label="Nama Lengkap (Tanpa Gelar)" required>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama sesuai KTP / Dokumen Resmi"
                required
              />
            </FormField>

            <FormField label="Alamat Email Aktif" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pegawai@rsudbahteramas.go.id"
                required
              />
            </FormField>

            <FormField label="Role Hak Akses" required>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                options={ROLE_OPTIONS}
              />
            </FormField>

            <FormField label={isEditMode ? "Kata Sandi Baru (Kosongkan jika tidak diganti)" : "Kata Sandi (Default: Pegawai123!)"}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditMode ? "Isi hanya jika ingin mengubah kata sandi..." : "Kosongkan untuk menggunakan sandi default (Pegawai123!)"}
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Biodata Tambahan Pegawai */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">2. Biodata & Informasi Pribadi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Gelar Akademik">
              <Input
                type="text"
                value={academicDegree}
                onChange={(e) => setAcademicDegree(e.target.value)}
                placeholder="Contoh: S.Kep., Ns. / Sp.B"
              />
            </FormField>

            <FormField label="Jenis Kelamin">
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={GENDER_OPTIONS}
              />
            </FormField>

            <FormField label="Tanggal Lahir">
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </FormField>

            <FormField label="Agama">
              <Select
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                options={RELIGION_OPTIONS}
                placeholder="-- Pilih Agama --"
              />
            </FormField>

            <FormField label="Status Pernikahan">
              <Select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                options={MARITAL_STATUS_OPTIONS}
                placeholder="-- Pilih Status Pernikahan --"
              />
            </FormField>

            <FormField label="Tanggal Masuk Kerja">
              <Input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
              />
            </FormField>

            <FormField label="Pendidikan Terakhir">
              <Select
                value={lastEducation}
                onChange={(e) => setLastEducation(e.target.value)}
                options={EDUCATION_OPTIONS}
                placeholder="-- Pilih Pendidikan Terakhir --"
              />
            </FormField>

            <FormField label="Nomor Telepon / WhatsApp">
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="font-mono"
              />
            </FormField>

            <FormField label="Alamat Lengkap" className="md:col-span-2">
              <Textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten..."
              />
            </FormField>
          </div>
        </div>

        {/* Section 3: Kategori & Kualifikasi Kepegawaian */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">3. Master Kategori & Kualifikasi Kepegawaian</h3>
          </div>

          {isLoadingCategories ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat daftar kategori...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Status Kepegawaian">
                <Select
                  value={employmentStatusId}
                  onChange={(e) => {
                    setEmploymentStatusId(e.target.value);
                    setEmployeeGroupId("");
                  }}
                  options={categories?.employmentStatuses.map((s) => ({ value: s.id, label: s.name }))}
                  placeholder="-- Pilih Status (e.g. ASN, Non ASN) --"
                />
              </FormField>

              <FormField label="Jenis Kepegawaian (Sub-Status)">
                <Select
                  value={employeeGroupId}
                  onChange={(e) => setEmployeeGroupId(e.target.value)}
                  disabled={!employmentStatusId || availableGroups.length === 0}
                  options={availableGroups.map((g) => ({ value: g.id, label: g.name }))}
                  placeholder="-- Pilih Jenis (e.g. PNS, PPPK) --"
                />
              </FormField>

              <FormField label="Kelompok Profesi">
                <Select
                  value={professionGroupId}
                  onChange={(e) => {
                    setProfessionGroupId(e.target.value);
                    setEmployeePositionId("");
                  }}
                  options={categories?.professionGroups.map((p) => ({ value: p.id, label: p.name }))}
                  placeholder="-- Pilih Profesi (e.g. Medis, Administrasi) --"
                />
              </FormField>

              <FormField label="Jabatan (Sub-Profesi)">
                <Select
                  value={employeePositionId}
                  onChange={(e) => setEmployeePositionId(e.target.value)}
                  disabled={!professionGroupId || availablePositions.length === 0}
                  options={availablePositions.map((pos) => ({ value: pos.id, label: pos.name }))}
                  placeholder="-- Pilih Jabatan --"
                />
              </FormField>

              <FormField label="Pangkat / Golongan">
                <Select
                  value={employeeRankId}
                  onChange={(e) => setEmployeeRankId(e.target.value)}
                  options={categories?.employeeRanks.map((r) => ({ value: r.id, label: r.name }))}
                  placeholder="-- Pilih Pangkat --"
                />
              </FormField>

              <FormField label="Tempat / Unit Tugas">
                <Select
                  value={workplaceId}
                  onChange={(e) => setWorkplaceId(e.target.value)}
                  options={categories?.workplaces.map((w) => ({ value: w.id, label: w.name }))}
                  placeholder="-- Pilih Tempat Tugas --"
                />
              </FormField>
            </div>
          )}
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href="/users">
            <Button type="button" variant="outline" className="rounded-xl px-5">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="rounded-xl px-6">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Menyimpan..." : "Menambahkan..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "Simpan Perubahan" : "Simpan Pegawai"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
