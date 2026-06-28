"use client";

import { useEffect, useState } from "react";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { CreateUserInput, UserRecord } from "../types";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserInput) => void;
  isLoading: boolean;
  initialData?: UserRecord | null;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: UserFormModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [gender, setGender] = useState("L");

  useEffect(() => {
    if (initialData) {
      setEmployeeId(initialData.employeeId);
      setEmail(initialData.email);
      setPassword("");
      setName(initialData.name);
      setRole(initialData.role);
      setGender(initialData.gender || "L");
    } else {
      setEmployeeId("");
      setEmail("");
      setPassword("Pegawai123!");
      setName("");
      setRole("EMPLOYEE");
      setGender("L");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      employeeId,
      email,
      ...(password && { password }),
      name,
      role,
      gender,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {initialData ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">NIP / ID Pegawai</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Contoh: 19900101..."
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role Sistem</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-semibold"
              >
                <option value="EMPLOYEE">EMPLOYEE (Pegawai)</option>
                <option value="STAFF">STAFF (Verifikator)</option>
                <option value="ADMIN">ADMIN (Administrator)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap beserta gelar..."
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Log-in</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pegawai@domain.com"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {initialData ? "Kata Sandi Baru (Kosongkan jika tidak diubah)" : "Kata Sandi Default"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={initialData ? "••••••••" : "Default: Pegawai123!"}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required={!initialData}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl px-6">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Data"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
