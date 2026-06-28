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
- [x] Setup Prisma + koneksi PostgreSQL (selesai 2026-06-28)
- [x] Buat `prisma/schema.prisma` (selesai 2026-06-28)
- [x] Buat `prisma/seed.ts` (selesai 2026-06-28)
- [x] Setup NextAuth.js (Credentials Provider) (selesai 2026-06-28)
- [x] Buat `src/lib/prisma.ts` (singleton) (selesai 2026-06-28)
- [x] Buat `src/lib/auth-utils.ts` (`requireRole`, `hasRole`) (selesai 2026-06-28)
- [x] Buat `src/lib/api-client.ts` (fetch wrapper) (selesai 2026-06-28)
- [x] Buat `src/lib/security-log.ts` (`logActivity`) (selesai 2026-06-28)
- [x] Buat `src/lib/storage.ts` (`getStorageProvider`) (selesai 2026-06-28)
- [x] Buat `src/lib/` utilities (`parseAllowedFormats`, `slugifyFileName`) (selesai 2026-06-28)
- [x] Buat `src/app/providers.tsx` (QueryClientProvider) (selesai 2026-06-28)
- [x] Buat `src/app/layout.tsx` (root layout) (selesai 2026-06-28)
- [x] Buat `src/proxy.ts` (middleware autentikasi) (selesai 2026-06-28)
- [x] Buat `src/app/(dashboard)/layout.tsx` (Sidebar + Navbar) (selesai 2026-06-28)

### F01 — Autentikasi
- [x] `src/modules/auth/service.ts` (selesai 2026-06-28)
- [x] `src/modules/auth/validation.ts` (selesai 2026-06-28)
- [x] `src/modules/auth/types.ts` (selesai 2026-06-28)
- [x] `src/modules/auth/api.ts` (selesai 2026-06-28)
- [x] `src/modules/auth/hooks.ts` (selesai 2026-06-28)
- [x] `src/modules/auth/components/` (LoginForm, dll) (selesai 2026-06-28)
- [x] `src/app/login/page.tsx` (selesai 2026-06-28)
- [x] `src/app/api/v1/auth/[...nextauth]/route.ts` (selesai 2026-06-28)

### F03 — Manajemen Jenis Dokumen
- [x] `src/modules/document-types/service.ts` (selesai 2026-06-28)
- [x] `src/modules/document-types/repository.ts` (selesai 2026-06-28)
- [x] `src/modules/document-types/validation.ts` (selesai 2026-06-28)
- [x] `src/modules/document-types/types.ts` (selesai 2026-06-28)
- [x] `src/modules/document-types/api.ts` (selesai 2026-06-28)
- [x] `src/modules/document-types/hooks.ts` (selesai 2026-06-28)
- [x] `src/modules/document-types/components/` (selesai 2026-06-28)
- [x] `src/app/api/v1/document-types/route.ts` (selesai 2026-06-28)
- [x] `src/app/(dashboard)/document-types/page.tsx` (selesai 2026-06-28)

### F06 — Manajemen Pegawai (Users)
- [x] `src/modules/users/service.ts` (selesai 2026-06-28)
- [x] `src/modules/users/repository.ts` (selesai 2026-06-28)
- [x] `src/modules/users/validation.ts` (selesai 2026-06-28)
- [x] `src/modules/users/types.ts` (selesai 2026-06-28)
- [x] `src/modules/users/api.ts` (selesai 2026-06-28)
- `[x]` `src/modules/users/hooks.ts` (selesai 2026-06-28)
- `[x]` `src/modules/users/components/` (selesai 2026-06-28)
- `[x]` `src/app/api/v1/users/route.ts` (selesai 2026-06-28)
- `[x]` `src/app/(dashboard)/users/page.tsx` (selesai 2026-06-28)

### F04 — Manajemen Dokumen
- [x] `src/modules/documents/service.ts` (selesai 2026-06-28)
- [x] `src/modules/documents/repository.ts` (selesai 2026-06-28)
- [x] `src/modules/documents/validation.ts` (selesai 2026-06-28)
- [x] `src/modules/documents/types.ts` (selesai 2026-06-28)
- [x] `src/modules/documents/api.ts` (selesai 2026-06-28)
- [x] `src/modules/documents/hooks.ts` (selesai 2026-06-28)
- [x] `src/modules/documents/components/` (DocumentTabs, DocumentUploadForm, dll) (selesai 2026-06-28)
- [x] `src/app/api/v1/documents/route.ts` (selesai 2026-06-28)
- [x] `src/app/api/v1/documents/upload/route.ts` (selesai 2026-06-28)
- [x] `src/app/api/v1/documents/[id]/route.ts` (selesai 2026-06-28)
- [x] `src/app/api/v1/documents/download/route.ts` (selesai 2026-06-28)
- [x] `src/app/(dashboard)/documents/page.tsx` (selesai 2026-06-28)

### F05 — Verifikasi Dokumen
- [x] `src/modules/verification/service.ts` (selesai 2026-06-28)
- [x] `src/modules/verification/repository.ts` (selesai 2026-06-28)
- [x] `src/modules/verification/validation.ts` (selesai 2026-06-28)
- [x] `src/modules/verification/types.ts` (selesai 2026-06-28)
- [x] `src/modules/verification/api.ts` (selesai 2026-06-28)
- [x] `src/modules/verification/hooks.ts` (selesai 2026-06-28)
- [x] `src/modules/verification/components/` (selesai 2026-06-28)
- [x] `src/app/(dashboard)/verification/page.tsx` (selesai 2026-06-28)
- [x] `src/app/api/v1/verification/route.ts` (selesai 2026-06-28)
- [x] `src/app/api/v1/verification/[id]/approve/route.ts` (selesai 2026-06-28)
- [x] `src/app/api/v1/verification/[id]/reject/route.ts` (selesai 2026-06-28)
- [x] `src/app/api/v1/verification/document/[id]/route.ts` (selesai 2026-06-28)

### F07 — Profil
- [x] `src/modules/profile/service.ts` (selesai 2026-06-28)
- [x] `src/modules/profile/repository.ts` (selesai 2026-06-28)
- [x] `src/modules/profile/validation.ts` (selesai 2026-06-28)
- [x] `src/modules/profile/types.ts` (selesai 2026-06-28)
- [x] `src/modules/profile/api.ts` (selesai 2026-06-28)
- [x] `src/modules/profile/hooks.ts` (selesai 2026-06-28)
- [x] `src/modules/profile/components/` (selesai 2026-06-28)
- [x] `src/app/api/v1/profile/route.ts` (selesai 2026-06-28)
- [x] `src/app/api/v1/profile/password/route.ts` (selesai 2026-06-28)
- [x] `src/app/(dashboard)/profile/page.tsx` (selesai 2026-06-28)

### F08 — Security Logs
- [x] `src/modules/security-logs/service.ts` (selesai 2026-06-28)
- [x] `src/modules/security-logs/repository.ts` (selesai 2026-06-28)
- [x] `src/modules/security-logs/types.ts` (selesai 2026-06-28)
- [x] `src/modules/security-logs/api.ts` (selesai 2026-06-28)
- [x] `src/modules/security-logs/hooks.ts` (selesai 2026-06-28)
- [x] `src/modules/security-logs/components/` (selesai 2026-06-28)
- [x] `src/app/api/v1/security-logs/route.ts` (selesai 2026-06-28)
- [x] `src/app/(dashboard)/security-logs/page.tsx` (selesai 2026-06-28)

### F02 — Dashboard
- [x] `src/modules/dashboard/hooks.ts` (selesai 2026-06-28)
- [x] `src/modules/dashboard/components/` (StatsCard, dll) (selesai 2026-06-28)
- [x] `src/app/(dashboard)/dashboard/page.tsx` (selesai 2026-06-28)

---

## 🟡 Sedang Dikerjakan

*(Kosong — belum ada implementasi dimulai)*

---

## 🔴 Yang Belum Dibuat



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
