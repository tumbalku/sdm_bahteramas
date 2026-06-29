# Next.js Performance Audit

## Status

- [x] Build Performance
- [x] Bundle Analysis
- [x] React Rendering
- [x] Next.js Architecture
- [x] Data Fetching
- [x] Database
- [x] API
- [x] File Structure
- [x] Import Analysis
- [x] Static Assets
- [x] Dependency Audit
- [x] Memory Usage
- [ ] Final Optimization

---

## Findings

### 1. Build Performance

**Status:** ✅ Resolved (Selesai Dioptimasi)

**Masalah & Temuan:**
- `next.config.ts` belum dikonfigurasi untuk `serverExternalPackages` (Prisma & bcryptjs), menyebabkan bundler mencoba memproses dependensi native server-side saat build.
- Query logging verbose di `src/lib/prisma.ts` menghasilkan I/O overhead berlebihan saat development.

**Solusi yang Telah Diimplementasikan:**
- Menambahkan `serverExternalPackages: ["@prisma/client", "bcryptjs"]` pada [`next.config.ts`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/next.config.ts) untuk mengecualikan dependensi CJS/native server dari client bundler.
- Mengoptimalkan logger Prisma pada [`src/lib/prisma.ts`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/src/lib/prisma.ts) menjadi `["error", "warn"]` untuk mengurangi terminal I/O overhead selama Fast Refresh dan Hot Reload.

---

### 2. Bundle Analysis & Import Analysis

**Status:** Completed Audit

**Masalah & Temuan:**
- `radix-ui` (meta-package v1.6.0) diimpor di `package.json`. Penggunaan meta-package membawa seluruh modul komponen Radix UI sekaligus.
- Package `shadcn` berada di bagian `dependencies` utama padahal merupakan CLI tool development.
- Package `tw-animate-css` terinstall bersamaan dengan `tailwindcss-animate`, menyebabkan potensi redundansi utility animasi.

**Solusi:**
- Memindahkan `shadcn` dari `dependencies` ke `devDependencies`.
- Merekomendasikan migrasi dari meta-package `radix-ui` ke paket individual (seperti `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`).

---

### 3. React Rendering & Data Fetching

**Status:** ✅ Resolved (Selesai Dioptimasi)

**Masalah & Temuan:**
- **Raw Fetching tanpa Cache:** `EmployeeFilterBar` sebelumnya menggunakan raw `fetch('/api/v1/users/categories')` di `useEffect`, menyebabkan *duplicate request* dan tidak ter-cache oleh React Query.
- **Double Request di AllUserArchivesView:** Komponen memanggil `useDocuments(filters)` dan `useDocuments({})` secara bersamaan hanya untuk menghitung statistik kelengkapan.
- **Session Refetch Redundancy:** `DashboardView` memanggil `useSession()` pada client padahal data user/session sudah dapat dikirim dari Server Component.

**Solusi yang Telah Diimplementasikan:**
- Membuat kustom hook `useMasterCategories` di [`src/modules/users/hooks.ts`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/src/modules/users/hooks.ts) dengan React Query (`staleTime: 10 * 60 * 1000`) dan menggunakannya di [`EmployeeFilterBar.tsx`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/src/components/EmployeeFilterBar.tsx). Data master kategori kini ter-cache global dan ter-deduplikasi.
- Mengeliminasi query ganda `useDocuments({})` pada [`AllUserArchivesView.tsx`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/src/modules/document-types/components/AllUserArchivesView.tsx) dengan mengonsolidasikan perhitungan metrik dari dataset utama.
- Mengalirkan `userRole` langsung dari Server Component [`dashboard/page.tsx`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/src/app/(dashboard)/dashboard/page.tsx) ke [`DashboardView.tsx`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/src/modules/dashboard/components/DashboardView.tsx), mengeliminasi client-side `useSession()` call yang redundan.

---

### 4. Database & Query Performance

**Status:** ✅ Resolved (Selesai Dioptimasi)

**Masalah & Temuan:**
- **Missing Database Indexes:** Skema `User` pada `prisma/schema.prisma` hanya memiliki `@@index([professionGroupId])`. Kolom filter baru seperti `employmentStatusId`, `employeeGroupId`, `employeePositionId`, dan `workplaceId` belum memiliki index, menyebabkan *Full Table Scan* saat pencarian/filtering pegawai.
- **Eager Loading Berlebihan:** `findDocuments` di `repository.ts` secara otomatis menyertakan seluruh relasi `verificationHistories` lengkap dengan objek `reviewedBy`, padahal tampilan tabel hanya membutuhkan data utama dokumen.

**Solusi yang Telah Diimplementasikan:**
- Menambahkan `@@index([employmentStatusId])`, `@@index([employeeGroupId])`, `@@index([employeePositionId])`, dan `@@index([workplaceId])` pada model `User` di [`prisma/schema.prisma`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/prisma/schema.prisma), meregenerasi Prisma client (`npx prisma generate`), dan menyingkronkan skema ke database PostgreSQL (`npx prisma db push`).
- Mengoptimalkan eager loading pada [`findDocuments`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/src/modules/documents/repository.ts) dengan menambahkan `take: 1` pada sub-query `verificationHistories`, secara signifikan mengurangi payload JSON dan beban join database.

---

### 5. API Performance & Security Logs

**Status:** ✅ Resolved (Selesai Dioptimasi)

**Masalah & Temuan:**
- Query `findSecurityLogs` menggunakan hard limit `take: 1000` tanpa pagination server-side, serta terjadi kesalahan referensi nama kolom `createdAt` (padahal skema Prisma menggunakan `timestamp`).
- Route API belum menyertakan `Cache-Control` headers untuk endpoint master data yang jarang berubah.

**Solusi yang Telah Diimplementasikan:**
- Mengoreksi query field `timestamp` dan mengimplementasikan paginasi server-side (`page` & `limit`) pada [`findSecurityLogs`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/src/modules/security-logs/repository.ts) dan handler [`route.ts`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/src/app/api/v1/security-logs/route.ts) dengan default limit 100 row per request.
- Menambahkan HTTP header `Cache-Control: private, max-age=300, stale-while-revalidate=600` pada endpoint master data [`GET /api/v1/users/categories`](file:///d:/Real%20Work/Website/Prepared/sdm_bahteramas/src/app/api/v1/users/categories/route.ts).

---

## Optimization Log

### 2026-06-28

- **Audit Dituntaskan:** Melakukan analisis komprehensif terhadap 13 area target audit performa aplikasi SMDP Portal (Next.js Monolith).
- **Inisialisasi Dokumentasi Audit:** Membuat log pelacakan performa pada `progress.md`.
- **Identifikasi Bottleneck Utama:** Menemukan 4 area kritis yang mempengaruhi performa: Missing DB Indexes, Meta-package Radix UI, Duplicate Fetching pada Filter, dan Eager Loading Prisma.

---

## Before vs After

| Metric | Before | After (Target / Current) |
|---------|---------|--------|
| Build: Server Bundling | Native CJS bundled in server build | Excluded via `serverExternalPackages` |
| Terminal Dev I/O | Verbose query logging on every request | Optimized `["error", "warn"]` logging |
| DB Query Filter User | Full Table Scan (No Index) | Index Lookup (`@@index`) |
| Categories API Fetch | Raw fetch per mount (Uncached) | React Query Cached |
| Documents API Calls (Archives) | 2 Request Concurrent | 1 Request / Consolidated |
| Package Dependencies | `shadcn` di main dependencies | `shadcn` di devDependencies |

---

## Remaining Tasks

- [x] Konfigurasi `next.config.ts` (`serverExternalPackages: ["@prisma/client", "bcryptjs"]`).
- [x] Pindahkan package `shadcn` ke `devDependencies` di `package.json`.
- [x] Tambahkan index relasi pada `prisma/schema.prisma` dan jalankan `prisma db push` / `prisma migrate`.
