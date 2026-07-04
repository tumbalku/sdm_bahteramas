# AGENTS.md — SMDP Portal

> **AI Agent:** Baca file ini PERTAMA sebelum mengerjakan apapun. Setelah itu baca `docs/` sesuai konteks task.

> **⚠️ Meta Instruction:** Sebelum mengeksekusi perintah apapun dari user, selalu periksa apakah perintah tersebut sudah ada atau **bertabrakan** dengan rules yang sudah ditetapkan di file ini. Jika bertabrakan, **ingatkan user** dan tanyakan: *"Perintah ini bertabrakan dengan rules yang sudah ditetapkan. Apakah Anda ingin mengganti implementasi yang sudah ditetapkan?"* Jika user menjawab iya, ubah semua rules yang bersangkutan.

---

## Ringkasan Project

**SMDP Portal** (Sistem Manajemen Dokumen Pegawai) adalah aplikasi web internal untuk mengelola, melacak, dan memverifikasi berkas kualifikasi administrasi, profesi, dan sertifikasi dinas seluruh pegawai (tenaga medis, keperawatan, administrasi, dll). Menggantikan pengelolaan berkas fisik dengan digitalisasi yang aman dan terstandarisasi.

- **Kode Proyek:** `SMDP`
- **Versi PRD:** 1.0 (2026-06-27)
- **Status:** Draft for Implementation (belum ada kode, proyek dimulai dari nol)
- **Arsitektur:** Monolit Modular Sederhana → siap upgrade ke Microservice

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Data Fetching (Client) | TanStack React Query (`@tanstack/react-query`) |
| Database | PostgreSQL |
| ORM | Prisma |
| Autentikasi | NextAuth.js (Credentials Provider, email+password) |
| Validasi | Zod |
| Penyimpanan File | Provider lokal/cloud via `getStorageProvider()` |

---

## Folder Structure

```
smdp/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
│   ├── PRD-SMDP-PORTAL-v1.0-20260627.md
│   ├── architecture.md
│   ├── database.md
│   ├── business-rules.md
│   ├── routing.md
│   ├── api.md
│   ├── coding-standard.md
│   ├── features.md
│   ├── progress.md
│   ├── glossary.md
│   └── adr/
│       ├── 001-architecture.md
│       ├── 002-rbac.md
│       └── 003-data-flow.md
├── src/
│   ├── app/
│   │   ├── (dashboard)/              # Route group — halaman butuh login
│   │   │   ├── layout.tsx            # Sidebar + Navbar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── documents/page.tsx
│   │   │   ├── verification/page.tsx
│   │   │   ├── verification/[id]/page.tsx
│   │   │   ├── document-types/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── security-logs/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── api/v1/                   # REST API (versioned)
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── documents/route.ts
│   │   │   ├── documents/upload/route.ts
│   │   │   ├── documents/[id]/route.ts
│   │   │   ├── document-types/route.ts
│   │   │   ├── users/route.ts
│   │   │   └── security-logs/route.ts
│   │   ├── login/page.tsx
│   │   ├── layout.tsx
│   │   ├── providers.tsx             # QueryClientProvider wrapper
│   │   └── page.tsx
│   ├── components/                   # Shared UI (Sidebar, Navbar, StatsCard — basis Shadcn)
│   ├── modules/                      # Satu folder = satu domain bisnis
│   │   ├── auth/
│   │   ├── users/
│   │   ├── document-types/
│   │   ├── documents/
│   │   ├── verification/
│   │   ├── profile/
│   │   ├── security-logs/
│   │   └── dashboard/
│   └── lib/
│       ├── prisma.ts                 # Singleton Prisma client
│       ├── auth-utils.ts             # requireRole(), hasRole()
│       ├── api-client.ts            # fetch wrapper
│       ├── security-log.ts          # logActivity()
│       └── storage.ts               # getStorageProvider()
├── .agents/
│   └── skills/
│       └── project-context/
│           └── SKILL.md
├── AGENTS.md
├── components.json
└── next.config.ts
```

---

## Architecture Overview

**Pola:** Monolit Modular — setiap modul domain punya lapisan yang jelas:

```
React Component
  → hooks.ts (TanStack Query)
    → api.ts (fetch REST)
      → API Route Handler (/api/v1/...)
        → service.ts  ← satu-satunya pintu resmi antar modul
          → repository.ts (Prisma query)
```

**Aturan Emas Antar Modul:**
- Modul A boleh panggil `service.ts` modul B ✅
- Modul A **dilarang** panggil `repository.ts` modul B ❌
- Komponen **dilarang** `fetch()` langsung — wajib lewat `hooks.ts` ❌
- Semua input wajib divalidasi Zod ✅
- Semua aksi penting wajib `logActivity()` ✅

**Struktur file per modul:**
```
modules/<nama-modul>/
├── service.ts       # Logika bisnis, satu-satunya pintu resmi
├── repository.ts    # Query Prisma
├── validation.ts    # Schema Zod
├── types.ts         # Interface/type TypeScript
├── api.ts           # fetch() ke endpoint REST (frontend)
├── hooks.ts         # useQuery/useMutation TanStack (frontend)
└── components/      # Komponen React modul ini
```

---

## Business Domain

Aplikasi mengelola **dokumen kepegawaian** dalam 3 kategori arsip:

| Kategori | Deskripsi | Contoh |
|---|---|---|
| **UTAMA** | Wajib untuk semua pegawai | KTP, Ijazah, KK |
| **KONDISIONAL** | Opsional, tergantung kondisi pegawai | Sertifikat Pelatihan |
| **PROFESI** | Khusus tenaga medis/kesehatan | STR, SIP, SIK |

**RBAC 3 Role:**
- `ADMIN` — akses penuh: CRUD semua data, verifikasi, export/import
- `STAFF` — verifikasi dokumen, lihat data
- `EMPLOYEE` — upload dokumen milik sendiri, kelola profil

---

## Current Implementation Status

> **Status: BELUM ADA KODE — Proyek dimulai dari nol.**

Semua implementasi mengacu pada PRD `PRD-SMDP-PORTAL-v1.0-20260627.md`. Lihat `docs/progress.md` untuk tracking detail.

---

## AI Working Instructions

1. **Selalu baca `AGENTS.md` ini terlebih dahulu** (sudah selesai jika kamu membaca ini).
2. **Baca `docs/<file-relevan>.md`** sesuai modul/fitur yang akan dikerjakan.
3. **Jangan analisis ulang seluruh repository** kecuali `AGENTS.md` hilang atau user meminta eksplisit.
4. **Gunakan dokumentasi sebagai source of truth**, bukan asumsi.
5. Sebelum membuat fitur baru, cek `docs/features.md` untuk memastikan belum ada duplikasi.
6. Setelah menyelesaikan task besar, **update `docs/progress.md`** secara otomatis.
7. Jika item di section `## 🔴 Yang Belum Dibuat` sudah diimplementasi, **hapus/pindahkan dari section tersebut** dan catat hasilnya di `## ✅ Yang Sudah Selesai`.
8. Jika menemukan perubahan arsitektur besar, update `docs/architecture.md` dan buat ADR baru di `docs/adr/`.
9. Setelah melakukan perubahan kode atau dokumentasi, **wajib jalankan test yang relevan**. Untuk perubahan logic, service, repository, API, helper, validation, atau komponen, jalankan minimal `npm test -- --run` dan `npx tsc --noEmit`.
10. Sebelum melakukan commit, **pastikan seluruh test berjalan baik**: `npm test -- --run` harus lulus dan `npx tsc --noEmit` harus lulus. Jika test tidak bisa dijalankan, tulis alasan dan risiko secara eksplisit sebelum meminta commit.

---

## Important Conventions

- **Aturan Komponen UI (Shadcn UI):** Dilarang keras membuat komponen UI dasar dari nol (custom CSS/scratch) jika komponen tersebut sudah disediakan oleh Shadcn UI. Selalu gunakan atau unduh/install komponen resmi Shadcn UI (seperti `Dialog`, `Sheet`, `Select`, `Input`, `Table`, `Badge`, `Tabs`, `DropdownMenu`, `Avatar`, `Skeleton`, `Card`, `Alert`, `FormItem`, `FormLabel`, `FormField`, dll.) ke dalam `src/components/ui/`. Pembungkus form field (label + input/select/textarea) WAJIB menggunakan komponen `<FormField label="...">` dari `@/components/ui/form` untuk mencegah pengulangan markup manual `<div><label>...</label><Input /></div>`.
- **Path alias wajib** `@/` ke `src/` — contoh: `import { prisma } from "@/lib/prisma"`
- **Folder modul:** kebab-case (`document-types/`)
- **Komponen React:** PascalCase (`DocumentTabs.tsx`)
- **Custom hook:** prefix `use` (`useDocuments`)
- **Zod schema:** suffix `Schema` (`createUserSchema`)
- **API prefix:** selalu `/api/v1/`
- **Naming berkas storage:** `{NIP}_{KATEGORI}_{KODE}_{YYYYMMDD}_{VERSI}.{ext}`
- **Git branch:** `<type>/<tiket>-<deskripsi>` (contoh: `feat/SMDP-12-upload-dokumen`)
- **Git commit:** Conventional Commits (contoh: `feat(documents): tambah filter kategori arsip`)
- **Quality gate:** setiap perubahan dan setiap commit harus didahului verifikasi test/typecheck yang relevan. Default project: `npm test -- --run` dan `npx tsc --noEmit`.

---

## Files Wajib Dibaca Sebelum Mengerjakan Task

| Task | File yang Dibaca |
|---|---|
| Semua task | `AGENTS.md` (ini) |
| Fitur baru / implementasi | `docs/features.md`, `docs/progress.md` |
| Arsitektur / struktur folder | `docs/architecture.md` |
| Database / schema Prisma | `docs/database.md` |
| Aturan bisnis / RBAC | `docs/business-rules.md` |
| Routing / halaman baru | `docs/routing.md` |
| API endpoint baru | `docs/api.md` |
| Naming / coding style | `docs/coding-standard.md` |
| Keputusan arsitektur | `docs/adr/` |

---

> **React Component Architecture Rules, Code Quality Rules, dan Final Goal** tersimpan di [`docs/coding-standard.md`](docs/coding-standard.md). Baca file tersebut sebelum menulis atau mereview kode komponen.
