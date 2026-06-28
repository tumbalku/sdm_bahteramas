---
name: project-context
description: >
  Skill untuk memuat konteks project SMDP Portal secara efisien.
  Gunakan skill ini di awal setiap sesi untuk menghindari analisis ulang repository secara penuh.
  Relevan ketika: memulai sesi baru, mengerjakan fitur apapun di project SMDP.
---

# Project Context Skill — SMDP Portal

## Instruksi untuk AI Agent

### 1. Selalu Baca AGENTS.md Terlebih Dahulu

Sebelum mengerjakan task apapun di project ini, baca `AGENTS.md` di root repository. File ini berisi:
- Ringkasan project
- Tech stack
- Folder structure
- Architecture overview
- Business domain
- Working instructions
- Conventions
- Daftar file yang perlu dibaca per jenis task

### 2. Baca Dokumentasi yang Relevan di `docs/`

Setelah `AGENTS.md`, baca file di `docs/` yang sesuai dengan task yang akan dikerjakan:

| Task | File yang Dibaca |
|---|---|
| Fitur baru / implementasi | `docs/features.md` + `docs/progress.md` |
| Arsitektur / struktur folder | `docs/architecture.md` |
| Database / schema Prisma | `docs/database.md` |
| Aturan bisnis / RBAC / validasi | `docs/business-rules.md` |
| Routing / halaman baru | `docs/routing.md` |
| API endpoint baru | `docs/api.md` |
| Naming / coding style | `docs/coding-standard.md` |
| Keputusan arsitektur | `docs/adr/` |
| Istilah / singkatan | `docs/glossary.md` |

### 3. Jangan Analisis Repository Secara Penuh

**Kecuali** salah satu kondisi berikut terpenuhi:
- `AGENTS.md` tidak ada atau tidak dapat dibaca
- Folder `docs/` tidak tersedia atau semua file di dalamnya kosong
- User secara **eksplisit** meminta analisis ulang repository

Analisis repository secara penuh sangat membuang token dan waktu. Dokumentasi di `docs/` sudah dirancang untuk menggantikan kebutuhan tersebut.

### 4. Dokumentasi Adalah Source of Truth

- Gunakan dokumentasi sebagai referensi utama, bukan asumsi
- Jika ada konflik antara dokumentasi dan source code, **source code yang aktual menang** — update dokumentasi setelah verifikasi
- Jangan membuat dokumentasi yang bertentangan dengan source code yang ada

### 5. Update Dokumentasi Setelah Task Besar

Setelah menyelesaikan implementasi fitur atau perubahan arsitektur yang signifikan:

1. Update `docs/progress.md`:
   - Tandai item yang selesai dengan `[x]`
   - Tambahkan baris di "Riwayat Update"

2. Update `docs/features.md` jika status fitur berubah (🔴 → 🟡 → 🟢)

3. Jika ada perubahan arsitektur signifikan:
   - Update `docs/architecture.md`
   - Buat ADR baru di `docs/adr/` dengan nomor urut berikutnya

4. Jika ada aturan bisnis baru yang ditemukan saat implementasi:
   - Tambahkan ke `docs/business-rules.md`

5. Jika ada endpoint API baru:
   - Dokumentasikan di `docs/api.md`

### 6. Konvensi yang Wajib Diikuti

Sebelum menulis kode apapun, pastikan mengikuti:

- **Path alias:** selalu `@/` ke `src/` (bukan relative `../../`)
- **Penamaan komponen:** PascalCase
- **Penamaan hook:** prefix `use`
- **Penamaan Zod schema:** suffix `Schema`
- **API prefix:** selalu `/api/v1/`
- **Antar modul:** hanya boleh impor `service.ts` — tidak boleh impor `repository.ts` modul lain
- **Komponen:** tidak boleh `fetch()` langsung — wajib via `hooks.ts`
- **Input API:** wajib divalidasi Zod
- **Aksi penting:** wajib panggil `logActivity()`

Detail lengkap di `docs/coding-standard.md`.

### 7. Checklist Sebelum Menganggap Task Selesai

- [ ] Tidak ada `fetch()` langsung di komponen
- [ ] `hooks.ts` hanya memanggil `api.ts` modul yang sama
- [ ] Route handler hanya memanggil `service.ts` modul yang sama
- [ ] Tidak ada import `repository.ts` dari modul lain
- [ ] Semua input divalidasi Zod
- [ ] Aksi penting memanggil `logActivity()`
- [ ] Endpoint baru pakai prefix `/api/v1/`
- [ ] Nama file sesuai konvensi
- [ ] Path alias `@/` digunakan
- [ ] `docs/progress.md` diupdate

---

## Catatan Penting

> Tujuan utama skill ini: pada sesi AI berikutnya, cukup baca `AGENTS.md` dan folder `docs/` sebagai konteks utama — sehingga tidak perlu menghabiskan token untuk memahami ulang seluruh repository dari awal.

> Dokumentasi harus selalu sinkron dengan kondisi project saat ini. Jika menemukan informasi yang belum terdokumentasi, tambahkan secara otomatis.
