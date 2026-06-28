# Progress — SMDP Portal

> **Last Updated:** 2026-06-28
> **AI Agent:** Update file ini setelah menyelesaikan task besar. Tandai item sesuai statusnya.

---

## Status Keseluruhan

**Proyek dimulai dari nol** — belum ada satu baris kode implementasi pun.
Hanya tersedia PRD (`PRD-SMDP-PORTAL-v1.0-20260627.md`) dan dokumentasi awal.

---

## ✅ Yang Sudah Selesai

### Dokumentasi
- [x] PRD v1.0 (`PRD-SMDP-PORTAL-v1.0-20260627.md`) — selesai 2026-06-27
- [x] `AGENTS.md` — project context untuk AI agent
- [x] `docs/architecture.md` — arsitektur aplikasi
- [x] `docs/database.md` — skema database & entity
- [x] `docs/business-rules.md` — aturan bisnis & RBAC
- [x] `docs/routing.md` — routing & middleware
- [x] `docs/api.md` — dokumentasi REST API
- [x] `docs/coding-standard.md` — standar koding
- [x] `docs/features.md` — daftar fitur & status
- [x] `docs/progress.md` — file ini
- [x] `docs/glossary.md` — glosari istilah
- [x] `docs/adr/001-architecture.md` — ADR arsitektur monolit modular
- [x] `docs/adr/002-rbac.md` — ADR keputusan RBAC
- [x] `docs/adr/003-data-flow.md` — ADR pola alur data
- [x] `.agents/skills/project-context/SKILL.md` — skill untuk AI agent

### Infrastructure / Setup Awal
- [x] Inisialisasi project Next.js + TypeScript (selesai 2026-06-28)
- [x] Setup Tailwind CSS + Shadcn UI (selesai 2026-06-28)
- [x] Installasi dependensi npm (selesai 2026-06-28)

---

## 🟡 Sedang Dikerjakan

*(Kosong — belum ada implementasi dimulai)*

---

## 🔴 Yang Belum Dibuat

### Infrastructure / Setup Awal
- [ ] Setup Prisma + koneksi PostgreSQL
- [ ] Buat `prisma/schema.prisma` (lengkap sesuai PRD §8.4)
- [ ] Buat `prisma/seed.ts` (data master awal)
- [ ] Setup NextAuth.js (Credentials Provider)
- [ ] Buat `src/lib/prisma.ts` (singleton)
- [ ] Buat `src/lib/auth-utils.ts` (`requireRole`, `hasRole`)
- [ ] Buat `src/lib/api-client.ts` (fetch wrapper)
- [ ] Buat `src/lib/security-log.ts` (`logActivity`)
- [ ] Buat `src/lib/storage.ts` (`getStorageProvider`)
- [ ] Buat `src/lib/` utilities (`parseAllowedFormats`, `slugifyFileName`)
- [ ] Buat `src/app/providers.tsx` (QueryClientProvider)
- [ ] Buat `src/app/layout.tsx` (root layout)
- [ ] Buat `src/proxy.ts` (middleware autentikasi)
- [ ] Buat `src/app/(dashboard)/layout.tsx` (Sidebar + Navbar)

### F01 — Autentikasi
- [ ] `src/modules/auth/service.ts`
- [ ] `src/modules/auth/validation.ts`
- [ ] `src/modules/auth/types.ts`
- [ ] `src/modules/auth/api.ts`
- [ ] `src/modules/auth/hooks.ts`
- [ ] `src/modules/auth/components/` (LoginForm, dll)
- [ ] `src/app/login/page.tsx`
- [ ] `src/app/api/v1/auth/[...nextauth]/route.ts`

### F03 — Manajemen Jenis Dokumen
- [ ] `src/modules/document-types/service.ts`
- [ ] `src/modules/document-types/repository.ts`
- [ ] `src/modules/document-types/validation.ts`
- [ ] `src/modules/document-types/types.ts`
- [ ] `src/modules/document-types/api.ts`
- [ ] `src/modules/document-types/hooks.ts`
- [ ] `src/modules/document-types/components/`
- [ ] `src/app/api/v1/document-types/route.ts`
- [ ] `src/app/(dashboard)/document-types/page.tsx`

### F06 — Manajemen Pegawai (Users)
- [ ] `src/modules/users/service.ts`
- [ ] `src/modules/users/repository.ts`
- [ ] `src/modules/users/validation.ts`
- [ ] `src/modules/users/types.ts`
- [ ] `src/modules/users/api.ts`
- [ ] `src/modules/users/hooks.ts`
- [ ] `src/modules/users/components/`
- [ ] `src/app/api/v1/users/route.ts`
- [ ] `src/app/(dashboard)/users/page.tsx`

### F04 — Manajemen Dokumen
- [ ] `src/modules/documents/service.ts`
- [ ] `src/modules/documents/repository.ts`
- [ ] `src/modules/documents/validation.ts`
- [ ] `src/modules/documents/types.ts`
- [ ] `src/modules/documents/api.ts`
- [ ] `src/modules/documents/hooks.ts`
- [ ] `src/modules/documents/components/` (DocumentTabs, DocumentUploadForm, dll)
- [ ] `src/app/api/v1/documents/route.ts`
- [ ] `src/app/api/v1/documents/upload/route.ts`
- [ ] `src/app/api/v1/documents/[id]/route.ts`
- [ ] `src/app/(dashboard)/documents/page.tsx`

### F05 — Verifikasi Dokumen
- [ ] `src/modules/verification/service.ts`
- [ ] `src/modules/verification/repository.ts`
- [ ] `src/modules/verification/validation.ts`
- [ ] `src/modules/verification/types.ts`
- [ ] `src/modules/verification/api.ts`
- [ ] `src/modules/verification/hooks.ts`
- [ ] `src/modules/verification/components/`
- [ ] `src/app/(dashboard)/verification/page.tsx`
- [ ] `src/app/(dashboard)/verification/[id]/page.tsx`

### F07 — Profil
- [ ] `src/modules/profile/service.ts`
- [ ] `src/modules/profile/repository.ts`
- [ ] `src/modules/profile/validation.ts`
- [ ] `src/modules/profile/types.ts`
- [ ] `src/modules/profile/api.ts`
- [ ] `src/modules/profile/hooks.ts`
- [ ] `src/modules/profile/components/`
- [ ] `src/app/api/v1/profile/route.ts`
- [ ] `src/app/(dashboard)/profile/page.tsx`

### F08 — Security Logs
- [ ] `src/modules/security-logs/service.ts`
- [ ] `src/modules/security-logs/repository.ts`
- [ ] `src/modules/security-logs/types.ts`
- [ ] `src/modules/security-logs/api.ts`
- [ ] `src/modules/security-logs/hooks.ts`
- [ ] `src/modules/security-logs/components/`
- [ ] `src/app/api/v1/security-logs/route.ts`
- [ ] `src/app/(dashboard)/security-logs/page.tsx`

### F02 — Dashboard
- [ ] `src/modules/dashboard/hooks.ts`
- [ ] `src/modules/dashboard/components/` (StatsCard, dll)
- [ ] `src/app/(dashboard)/dashboard/page.tsx`

---

## 📋 TODO Dari Analisis PRD

- [ ] **Tentukan threshold peringatan kedaluwarsa** — PRD menyebut "mendekati kedaluwarsa" tapi tidak spesifik hari. Implementor tentukan (misal: 30 hari).
- [ ] **Tentukan behavior ganti password** — PRD tidak mendefinisikan apakah EMPLOYEE bisa ganti password sendiri.
- [ ] **Tentukan paginasi default** — PRD belum mendefinisikan ukuran halaman default untuk list API.
- [ ] **Konfigurasi Middleware path** — PRD menyebut `src/proxy.ts` untuk middleware Next.js, konfirmasi apakah ini di-alias di `next.config.ts` atau rename ke `src/middleware.ts`.
- [ ] **Seed data master** — Tentukan data awal untuk: EmploymentStatus, EmployeeGroup, ProfessionGroup, EmployeePosition, EmployeeRank, Workplace, dan DocumentType awal.
- [ ] **Format CSV import pegawai** — Header dan format kolom CSV untuk import belum didefinisikan di PRD.
- [ ] **Reset password** — Belum ada di PRD, perlu klarifikasi apakah diperlukan.

---

## 🗓️ Riwayat Update

| Tanggal | Diupdate oleh | Perubahan |
|---|---|---|
| 2026-06-28 | AI Agent (setup awal) | Inisialisasi dokumentasi dari PRD v1.0 |
