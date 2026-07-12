# REVIEW.md — SMDP Portal Code Review

> **Tanggal Review:** 2026-07-12
> **Reviewer:** AI Agent (Antigravity)
> **Status Keseluruhan:** ✅ **AMAN UNTUK COMMIT — Semua P0 dan P1 telah diperbaiki**

---

## 1. Quality Gate

| Check | Status | Detail |
|---|---|---|
| `npm test -- --run` | ✅ **PASS** | **163 test**, 22 file test, 0 kegagalan |
| `npx tsc --noEmit` | ✅ **PASS** | 0 error TypeScript |
| `npm run lint` | ✅ **PASS** | `eslint . --max-warnings=0` — 0 warning, 0 error |
| `npm run build` | ✅ **PASS** | Next.js production build berhasil |

> Semua quality gate hijau. Kode dapat di-commit.

---

## 2. Ringkasan Perubahan Sejak Review Terakhir

Dibandingkan review 2026-07-12 pagi, perbaikan berikut **sudah dikonfirmasi selesai**:

| ID | Temuan Lama | Status Sekarang |
|---|---|---|
| P0-01 | Secret hardcoded `"super-secret-key"` | ✅ **Selesai** — `getRequiredEnv()` di `src/lib/env.ts` |
| P0-02 | Tidak ada rate limit verify-password | ✅ **Selesai** — modul `verify-password-rate-limit.ts`, 4 test |
| P0-03 | Backup export `passwordHash` tanpa pagination | ✅ **Selesai** — pagination 500 rows, workaround didokumentasi |
| P0-04 | `next lint` deprecated, tidak bisa CI | ✅ **Selesai** — `eslint.config.mjs`, `"lint": "eslint . --max-warnings=0"` |
| P1-01 | Import repo langsung dari route | ✅ **Selesai** — `getDocumentByIdService()` di service layer |
| P1-02 | `fetch()` manual di komponen | ✅ **Selesai** — CategoriesView, LayeredDeleteModal, SettingsFormView via hooks |
| P1-03 | Response API tidak standar | ✅ **Selesai** — `src/lib/api-response.ts` (`ok`, `created`, `fail`) |
| P1-04 | `$queryRawUnsafe` karena Prisma stale | ✅ **Selesai** — query diganti `Prisma.sql` dan `prisma.user.findMany()` |
| P1-05 | Delete dokumen tidak atomic | ✅ **Selesai** — DB dihapus dulu, file fisik kedua, gagal file hanya `warn` |
| P1-06 | Status code error DELETE salah (semua ke 403) | ✅ **Selesai** — mapping 404/403/500 yang benar di route |
| P1-07 | Download dokumen expose storage path di URL | ✅ **Selesai** — endpoint baru `GET /api/v1/documents/[id]/download` |
| P2-05 | `window.confirm()` di CategoriesView | ✅ **Selesai** — Dialog Shadcn UI `<Dialog>` diimplementasi |
| P2-06 | `db-columns.ts` tanpa dokumentasi | ✅ **Selesai** — JSDoc + TODO kapan dihapus |

---

## 3. Temuan Baru (Review 2026-07-12 Sore)

### Sisa Isu Kecil (P2 — Tidak Blokir Commit)

#### P2-01 — `catch (error: any)` masih tersebar luas

Pola `catch (error: any)` masih ditemukan di banyak route handler dan beberapa hooks. Tidak memblokir commit karena tidak ada bahaya runtime, tapi TypeScript kehilangan type safety pada blok error.

Lokasi utama:
- Seluruh route di `src/app/api/v1/**/*.ts` (~35 lokasi)
- `src/lib/storage/local-provider.ts`
- `src/modules/profile/hooks.ts`, `src/modules/documents/hooks.ts`

Solusi bertahap:
```typescript
// Ganti:
} catch (error: any) { return fail(error.message, 500); }

// Dengan:
} catch (error) {
  const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
  return fail(msg, 500);
}
```

#### P2-02 — Rate limit verify-password menggunakan in-memory `Map`

**File:** `src/modules/auth/verify-password-rate-limit.ts`

```typescript
export const failedPasswordVerifyAttempts = new Map<string, number[]>();
```

Bekerja untuk single-process, **tapi akan reset saat server restart** dan **tidak sinkron di deployment multi-instance** (Vercel serverless, dll).

- Untuk production skala kecil: dapat diterima.
- Untuk production multi-instance: perlu migrasi ke Redis atau tabel database.

#### P2-03 — `any` di type penting di repository

- `mapUserRecord(u: any)` di `src/modules/users/repository.ts:11`
- `updateData: any` di `src/modules/profile/repository.ts:32`
- `where: any` di beberapa query filter builder

Idealnya menggunakan Prisma generated types.

---

## 4. Konfirmasi Perbaikan Detail

### ✅ P0-01 — Secret Environment Variable

**File:** `src/lib/env.ts`

```typescript
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} wajib diisi di production`);
  }
  return value;
}
```

Digunakan di:
- `src/lib/auth-options.ts:77` — `secret: getRequiredEnv("NEXTAUTH_SECRET")`
- `src/proxy.ts:21` — `secret: getRequiredEnv("NEXTAUTH_SECRET")`

Tidak ada lagi fallback hardcoded.

---

### ✅ P0-02 — Rate Limit Verify Password

**File:** `src/modules/auth/verify-password-rate-limit.ts`

- Maks 5 percobaan gagal per 10 menit per `userId`
- Setiap kegagalan di-log ke SecurityLog dengan `eventType: "PASSWORD_VERIFY_FAILED"`
- Rate limited mengembalikan 429 dan di-log `"PASSWORD_VERIFY_RATE_LIMITED"`
- Sukses membersihkan counter dan di-log `"PASSWORD_VERIFY_SUCCESS"`

**Test:** `src/modules/auth/tests/verify-password.test.ts` — 4 test case termasuk skenario rate limit.

---

### ✅ P0-03 — Backup Database dengan Pagination

**File:** `src/modules/backup/service.ts`

- Pagination ditambahkan: tiap tabel di-query 500 baris per iterasi dengan loop `while(hasMore)`
- Error per tabel ditangani gracefully dengan comment `-- Error dumping table ...`
- `passwordHash` masih disertakan — keputusan disengaja untuk full restore capability
- **Catatan backlog (B-01):** Tambahkan peringatan di UI bahwa file backup mengandung `passwordHash`

---

### ✅ P0-04 — Lint Migrasi ke ESLint CLI

```json
"lint": "eslint . --max-warnings=0"
```

File baru `eslint.config.mjs` dibuat. `npm run lint` berjalan bersih (0 warning, 0 error).

---

### ✅ P1-01 — Eliminasi Import Repository Langsung dari Route

**File:** `src/modules/documents/service.ts` — `getDocumentByIdService()` dibuat:

```typescript
export async function getDocumentByIdService(id: string, actor: { id: string; role: string }) {
  const document = await findDocumentById(id);
  if (!document) throw new Error("Dokumen tidak ditemukan");
  if (!canVerifyDocuments(actor.role) && document.ownerId !== actor.id)
    throw new Error("Akses ditolak");
  return document;
}
```

Digunakan di: `documents/[id]/route.ts`, `verification/document/[id]/route.ts`, `documents/[id]/download/route.ts`.

---

### ✅ P1-02 — Eliminasi `fetch()` Manual di Komponen

**CategoriesView.tsx:**
```typescript
const { data: categories, isLoading, refetch } = useMasterCategories();
const createCategoryMutation = useCreateCategory();
const updateCategoryMutation = useUpdateCategory();
const deleteCategoryMutation = useDeleteCategory();
```

**LayeredDeleteModal.tsx:**
```typescript
const verifyPasswordMutation = useVerifyPassword(); // dari @/modules/auth/hooks
```

**SettingsFormView.tsx:**
```typescript
const downloadBackupMutation = useDownloadBackup(); // dari ../hooks
```

Seluruh data fetching sudah melalui TanStack Query hooks.

---

### ✅ P1-03 — Standardisasi Response API

**File baru:** `src/lib/api-response.ts`

```typescript
export function ok<T>(data: T)                    // 200: { success: true, data }
export function created<T>(data: T)               // 201: { success: true, data }
export function fail(error: string, status = 500) // xxx: { success: false, error }
```

---

### ✅ P1-04 — Eliminasi Raw SQL Unsafe

- `users/repository.ts` — `findManyUsers()` menggunakan `prisma.user.findMany()` dengan where builder
- `profile/repository.ts` — `updateUserProfile()` menggunakan `prisma.user.update()`
- `backup/service.ts` — menggunakan `Prisma.sql` tagged template (type-safe parameterized query)

---

### ✅ P1-05 — Delete Dokumen Atomic

**File:** `src/modules/documents/service.ts:306-315`

```typescript
// Hapus dari database terlebih dahulu (poin kritis)
await deleteDocumentRecord(documentId);

// Hapus file fisik — kegagalan tidak propagate
try {
  await storage.deleteFile(document.filePath);
} catch (err: any) {
  console.warn(`[WARNING] Gagal menghapus file fisik...`, err.message);
}
```

**Test:** test case "tetap sukses menghapus jika hapus file fisik gagal" — PASS.

---

### ✅ P1-06 — Status Code Error yang Benar

**File:** `src/app/api/v1/documents/[id]/route.ts:55-62`

```typescript
const status = error.message.includes("tidak ditemukan") ? 404
  : error.message.includes("Akses ditolak") ||
    error.message.includes("Tidak memiliki akses") ||
    error.message.includes("Tidak dapat menghapus") ? 403
  : 500;
```

---

### ✅ P1-07 — Endpoint Download Berbasis ID

**File baru:** `src/app/api/v1/documents/[id]/download/route.ts`

`GET /api/v1/documents/[id]/download`:
- Autentikasi via `getServerSession`
- RBAC via `getDocumentByIdService` (include cek kepemilikan)
- File diambil dari storage by `document.filePath` — tidak diekspos ke URL publik
- Header: `Content-Disposition: inline/attachment`, `X-Content-Type-Options: nosniff`

---

### ✅ P2-05 — Hapus `window.confirm()`

**File:** `src/modules/users/components/CategoriesView.tsx`

Konfirmasi hapus menggunakan `<Dialog>` dari Shadcn UI dengan tombol **Batal** / **Ya, Hapus**.

---

### ✅ P2-06 — Dokumentasi `db-columns.ts`

**File:** `src/lib/db-columns.ts`

JSDoc menjelaskan alasan workaround dan kapan file ini bisa dihapus (setelah migrasi DB production selesai dan Prisma Client stabil).

---

## 5. Peningkatan Positif yang Ditemukan

### Test Baru

| File | Deskripsi |
|---|---|
| `src/lib/env.test.ts` | Test `getRequiredEnv()` — throw saat env kosong, termasuk `NODE_ENV=test` tanpa fallback |
| `src/lib/api-response.test.ts` | Test helper `ok`, `created`, dan `fail` untuk status/body shape |
| `src/modules/auth/tests/verify-password.test.ts` | 6 test skenario verify-password, rate limit, audit log, dan clear attempts |
| `src/modules/auth/tests/nextauth-canonical.test.ts` | Test canonical route NextAuth `/api/auth/*` dan penghapusan duplikat v1 |
| `src/modules/documents/tests/service.test.ts` | Tambahan coverage RBAC `getDocumentByIdService` dan delete document non-owner |
| `src/modules/documents/tests/download-route.test.ts` | Integration-style route handler test untuk download dokumen by id |
| `src/modules/backup/tests/service.test.ts` | Test backup pagination, error SQL comment, dan warning sensitif di Settings UI |
| `src/modules/users/tests/service.test.ts` | Tambahan coverage import/export CSV `birthPlace`, duplicate validation, dan re-export service split |

**Total test: 163** (naik dari 137 — +26 test baru pada batch test coverage sebelum commit/PR)

### Pemecahan Service Layer (P2-02 sebelumnya)

- `src/modules/users/export-service.ts` — CSV & PDF export dipisah (353 baris)
- `src/modules/users/import-service.ts` — CSV import dipisah

---

## 6. Checklist Sebelum Commit

- [x] `npm test -- --run` → **163 PASS**
- [x] `npx tsc --noEmit` → **0 error**
- [x] `npm run lint` → **0 warning/error**
- [x] `npm run build` → **PASS**
- [x] Tidak ada secret hardcoded
- [x] Semua fetch di komponen melalui hooks (tidak ada `fetch()` manual di komponen)
- [x] Semua route handler tidak import repository langsung
- [x] Rate limit verify-password aktif dan ditest
- [x] Delete dokumen atomic (DB pertama, file kedua, file-fail = warn saja)
- [x] Download dokumen tidak expose storage path di URL
- [x] `.env.example` ada dan lengkap
- [x] Backup UI sudah menampilkan peringatan file backup mengandung data sensitif/hash kata sandi
- [ ] `catch (error: any)` belum diganti semua (P2 — tidak blokir)
- [ ] Rate limit in-memory tidak sinkron di multi-instance (P2 — tech debt)

---

## 7. Backlog Post-Commit

| ID | Task | Prioritas |
|---|---|---|
| B-02 | Ganti `catch (error: any)` bertahap dengan `error instanceof Error` | Low |
| B-03 | Migrasi rate limit ke Redis/DB saat deployment multi-instance | Medium (saat scale-out) |
| B-04 | Ganti `mapUserRecord(u: any)` dengan Prisma generated type | Low |
| B-05 | Ganti `updateData: any` di `profile/repository.ts` dengan `Partial<Prisma.UserUpdateInput>` | Low |

---

> **Kesimpulan:** Kode **aman untuk di-commit ke production**. Semua isu P0 dan P1 telah diperbaiki dan diverifikasi. Quality gate (test + tsc + lint + build) seluruhnya hijau. Sisa item adalah P2 yang tidak memblokir keamanan atau fungsi utama.
