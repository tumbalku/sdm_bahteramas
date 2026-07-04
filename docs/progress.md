# Progress — SMDP Portal

> **Last Updated:** 2026-07-04
> **AI Agent:** Update file ini setelah menyelesaikan task besar. Tandai item sesuai statusnya.
> **Rule:** Jika item pada `## 🔴 Yang Belum Dibuat` sudah diimplementasi, pindahkan/catat hasilnya ke `## ✅ Yang Sudah Selesai` dan hapus dari backlog.

---

## Status Keseluruhan

**Status saat ini:** implementasi inti aplikasi sudah tersedia. Fitur utama SMDP Portal sudah dibuat, termasuk autentikasi, dashboard, master jenis dokumen, dokumen pegawai, verifikasi, profil, security logs, settings, dan backup export.

Dokumentasi sudah dirapikan agar mengikuti kondisi source code aktual per 2026-07-02.

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
- [x] `docs/security-report.md` — laporan audit Supabase RLS
- [x] `docs/verification-checklist.md` — checklist verifikasi Supabase RLS
- [x] `docs/refactor-progress.md` — catatan refactor UI ringan
- [x] `docs/README.md` — indeks dokumentasi
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
- [x] Buat `src/lib/storage/` (`getStorageProvider`) (selesai 2026-06-28; direfactor local/Supabase 2026-07-03)
- [x] Buat `src/lib/` utilities (`parseAllowedFormats`, `slugifyFileName`) (selesai 2026-06-28)
- [x] Konfigurasi environment lokal: PostgreSQL lokal + storage lokal `uploads/` tanpa Supabase (selesai 2026-07-02)
- [x] Tambah Docker Compose PostgreSQL lokal dan script `prisma:push` (selesai 2026-07-02)
- [x] Buat `src/app/providers.tsx` (QueryClientProvider) (selesai 2026-06-28)
- [x] Buat `src/app/layout.tsx` (root layout) (selesai 2026-06-28)
- [x] Buat `src/middleware.ts` + `src/proxy.ts` (middleware autentikasi) (selesai 2026-06-28)
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
- [x] `src/app/(dashboard)/document-types/add/page.tsx` (selesai 2026-06-28)
- [x] `src/app/(dashboard)/document-types/[id]/edit/page.tsx` (route canonical, selesai 2026-07-03)
- [x] Refactor route master jenis dokumen: semua link tambah/edit distandarkan ke `/document-types`, route typo lama dihapus, dan dokumentasi routing diperbarui (selesai 2026-07-03)

### F06 — Manajemen Pegawai (Users)
- [x] `src/modules/users/service.ts` (selesai 2026-06-28)
- [x] `src/modules/users/repository.ts` (selesai 2026-06-28)
- [x] `src/modules/users/validation.ts` (selesai 2026-06-28)
- [x] `src/modules/users/types.ts` (selesai 2026-06-28)
- [x] `src/modules/users/api.ts` (selesai 2026-06-28)
- [x] `src/modules/users/hooks.ts` (selesai 2026-06-28)
- [x] `src/modules/users/components/` (selesai 2026-06-28)
- [x] `src/app/api/v1/users/route.ts` (selesai 2026-06-28)
- [x] `src/app/(dashboard)/users/page.tsx` (selesai 2026-06-28)

### Bulk Import & Export Pegawai
- [x] `src/modules/users/service.ts`
- [x] `src/modules/users/repository.ts`
- [x] `src/modules/users/types.ts`
- [x] `src/modules/users/api.ts`
- [x] `src/modules/users/hooks.ts`
- [x] `src/modules/users/components/UsersBulkActions.tsx`
- [x] `src/modules/users/components/UsersView.tsx`
- [x] `src/app/api/v1/users/import/route.ts`
- [x] `src/app/api/v1/users/import/template/route.ts`
- [x] `src/app/api/v1/users/export/route.ts`
- [x] `docs/api.md`
- [x] `docs/business-rules.md`

### Data TMT / Masa Kontrak Pegawai
- [x] `prisma/schema.prisma`
- [x] `src/modules/users/types.ts`
- [x] `src/modules/users/validation.ts`
- [x] `src/modules/users/repository.ts`
- [x] `src/modules/users/service.ts`
- [x] `src/modules/users/components/UserFormView.tsx`
- [x] `src/modules/users/components/UserFormModal.tsx`
- [x] `src/modules/users/components/UserDetailView.tsx`
- [x] `src/modules/profile/types.ts`
- [x] `src/modules/profile/repository.ts`
- [x] `src/modules/profile/components/ProfileView.tsx`
- [x] `docs/database.md`
- [x] `docs/api.md`
- [x] `docs/business-rules.md`

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

### Upload Dokumen — Metadata Wajib
- [x] `prisma/schema.prisma`
- [x] `src/modules/document-types/types.ts`
- [x] `src/modules/document-types/validation.ts`
- [x] `src/modules/document-types/components/AddDocumentTypeView.tsx`
- [x] `src/modules/document-types/components/EditDocumentTypeView.tsx`
- [x] `src/modules/document-types/components/DocumentTypeTable.tsx`
- [x] `src/modules/documents/types.ts`
- [x] `src/modules/documents/validation.ts`
- [x] `src/modules/documents/service.ts`
- [x] `src/modules/documents/api.ts`
- [x] `src/modules/documents/components/DocumentUploadModal.tsx`
- [x] `src/modules/documents/components/DocumentList.tsx`
- [x] `src/modules/verification/components/VerificationActionModal.tsx`
- [x] `src/app/api/v1/documents/upload/route.ts`
- [x] `docs/database.md`
- [x] `docs/api.md`
- [x] `docs/business-rules.md`

### Tampilan TMT Awal CPNS vs Masa Kontrak
- [x] `Akhir TMT / Kontrak` dipertegas sebagai field opsional pada form tambah/edit pegawai.
- [x] Jika `hasTmt=true`, `tmtStartDate` terisi, dan `tmtEndDate` kosong, profil menampilkan label `TMT Awal CPNS`.
- [x] Jika `tmtStartDate` dan `tmtEndDate` sama-sama terisi, profil menampilkan label `Masa Kontrak`.
- [x] Detail profil admin hanya menampilkan field akhir kontrak ketika `tmtEndDate` tersedia.
- [x] Helper pure TMT ditambahkan agar label profil user dan preview admin konsisten.
- [x] Unit test ditambahkan untuk helper TMT dan validasi `tmtEndDate` opsional.
- [x] `docs/business-rules.md`, `docs/api.md`, dan `docs/progress.md` diperbarui.

### Upload Dokumen — Anti-Duplikasi Jenis Dokumen
- [x] Select input upload normal hanya menampilkan jenis dokumen yang belum pernah diupload oleh user pada kategori aktif.
- [x] Jika seluruh jenis dokumen pada kategori aktif sudah pernah diupload, modal menampilkan informasi bahwa semua jenis dokumen sudah diunggah.
- [x] Backend menolak upload normal jika user sudah memiliki dokumen dengan `documentTypeId` yang sama.
- [x] Flow `Upload Ulang` untuk dokumen `REJECTED` tetap menjadi jalur resmi perbaikan dokumen yang ditolak dan jenis dokumennya tetap dikunci.
- [x] Unit test service documents ditambahkan untuk memastikan upload duplikat ditolak sebelum file disimpan.
- [x] `docs/business-rules.md`, `docs/api.md`, dan `docs/progress.md` diperbarui.

### Upload Ulang Dokumen Ditolak
- [x] Page Dokumen Saya menampilkan aksi utama `Upload Ulang` pada dokumen `REJECTED`, bukan `Unduh`.
- [x] Tombol `Unduh` pada dokumen `REJECTED` dipertahankan sebagai aksi sekunder untuk referensi file lama.
- [x] Modal upload dokumen dapat dipakai ulang untuk upload ulang dan otomatis mengunci jenis dokumen yang sama.
- [x] Metadata dokumen lama (`documentNumber`, `issueDate`, `expiryDate`) dipakai sebagai nilai awal saat upload ulang.
- [x] API upload menerima `replaceDocumentId` untuk konteks upload ulang.
- [x] Service memvalidasi dokumen lama harus ada, milik user login, berstatus `REJECTED`, dan memakai jenis dokumen yang sama.
- [x] Upload ulang membuat `DocumentRecord` baru dengan status `PENDING`, lalu menggantikan dokumen lama agar tidak tampil lagi.
- [x] Snapshot audit dokumen lama, pemilik, jenis dokumen, file lama, dan verifikasi terakhir disimpan ke `SecurityLog.metadata`.
- [x] File lama dan `DocumentRecord` lama dihapus setelah upload ulang berhasil; `VerificationHistory` lama boleh ikut terhapus oleh cascade karena snapshot audit sudah tersimpan.
- [x] Aktivitas upload ulang dicatat melalui `logActivity("DOCUMENT_UPLOADED", ...)` dengan metadata `REUPLOAD_REPLACED_REJECTED`.
- [x] Dokumen `APPROVED` tetap tidak bisa diganti melalui flow upload ulang ini.
- [x] `docs/api.md` dan `docs/business-rules.md` diperbarui.

### Preview Profil Pegawai — Dokumen Terkait
- [x] Page Preview Profil Pegawai menampilkan section dokumen terkait pegawai untuk `ADMIN`.
- [x] Komponen `DocumentSummaryTable` dibuat reusable dan tampilannya mengikuti table `Dokumen Terbaru` di dashboard.
- [x] Dashboard `Dokumen Terbaru` direfactor agar memakai `DocumentSummaryTable`.
- [x] Tabel dokumen pegawai menampilkan jenis dokumen, kategori, tanggal upload, tanggal terbit, tanggal kedaluwarsa, dan status.
- [x] Klik row dokumen membuka halaman detail dokumen `/documents/[id]`.
- [x] Page Detail Dokumen dibuat sebagai page terpisah dan dapat dibuka ulang via URL.
- [x] Page Detail Dokumen menampilkan preview file PDF/gambar, fallback download, properti dokumen, dan verifikasi terakhir.
- [x] Akses detail dokumen mengikuti RBAC: `ADMIN`/`STAFF` dapat melihat semua, `EMPLOYEE` hanya dokumen milik sendiri.
- [x] Data frontend tetap lewat `hooks.ts` dan `api.ts` modul documents.
- [x] `docs/routing.md`, `docs/api.md`, dan `docs/business-rules.md` diperbarui.

### Preview Profil Pegawai — Export CSV Dokumen Pegawai
- [x] Table `Dokumen Pegawai` pada Preview Profil Pegawai memiliki tombol `Export CSV` di sisi kiri header table.
- [x] Export memakai endpoint server-side `GET /api/v1/users/[id]/documents/export`.
- [x] Endpoint hanya bisa diakses oleh `ADMIN`.
- [x] CSV berisi kolom `Jenis Dokumen`, `Kode Dokumen`, `Kategori Arsip`, `Status Upload`, `Status Verifikasi`, `Nomor Surat`, `Tanggal Terbit`, `Tanggal Kedaluwarsa`, `Tanggal Upload`, `Nama File`, dan `Catatan Terakhir`.
- [x] Export mencakup seluruh jenis dokumen yang relevan dengan pegawai berdasarkan target status/golongan/profesi/pangkat/unit kerja.
- [x] Jenis dokumen yang belum diupload tetap muncul dengan `Status Upload = Belum Upload` dan fallback `-` pada field dokumen.
- [x] Query export dibuat batch: satu query pegawai, satu query jenis dokumen, dan satu query dokumen pegawai sehingga tidak N+1 per jenis dokumen.
- [x] Jika ada beberapa dokumen pada jenis yang sama, export mengambil dokumen terbaru berdasarkan `uploadedAt desc` lalu `updatedAt desc`.
- [x] Export mencatat audit `DATA_EXPORTED` dengan metadata `scope: "EMPLOYEE_DOCUMENTS"`, `ownerId`, `employeeId`, `rowCount`, dan `format: "csv"`.
- [x] `DocumentSummaryTable` mendapat slot `headerAction` agar action header tetap reusable.
- [x] `docs/api.md`, `docs/business-rules.md`, `docs/routing.md`, dan `docs/progress.md` diperbarui.

### Preview Dokumen Saya
- [x] Card dokumen pada Page Dokumen Saya memiliki tombol `Preview`.
- [x] Tombol `Preview` mengarah ke page detail `/documents/[id]`.
- [x] Detail dan download dokumen dibatasi: hanya `ADMIN` yang dapat melihat dokumen pegawai lain, role lain hanya dokumen milik sendiri.

### Rekapitulasi Arsip Dokumen Pegawai — Export CSV & Progress Bar
- [x] Page Rekapitulasi Arsip Dokumen Pegawai memakai endpoint rekap khusus, bukan lagi menghitung dari daftar dokumen milik user/session saat ini.
- [x] Progress bar `Rekapitulasi Dokumen Seluruh Pegawai` menghitung pasangan user internal dengan kemampuan `EMPLOYEE` (`ADMIN`, `STAFF`, `EMPLOYEE`) dan jenis dokumen wajib (`isMandatory=true`) yang berlaku sesuai target status/profesi/golongan/pangkat/unit kerja.
- [x] Numerator `Sudah Upload` menghitung kewajiban yang sudah memiliki dokumen terbaru; metrik `Terverifikasi`, `Menunggu`, `Ditolak`, dan `Belum Upload` ditampilkan terpisah.
- [x] Query rekap menggunakan batch query untuk pegawai, jenis dokumen wajib, dan dokumen terkait sehingga tidak melakukan N+1 query per pegawai.
- [x] Tabel rekap menampilkan baris dokumen yang sudah diupload dan baris kewajiban yang `Belum Upload`.
- [x] Filter rekap mengikuti pencarian, kategori arsip, status kepegawaian, kelompok pegawai, profesi, jabatan, status verifikasi, dan status upload.
- [x] Tombol `Export CSV` tersedia di antara filter dan table, lalu memanggil endpoint server-side.
- [x] Export menghasilkan file `.csv` dengan tanggal export, ringkasan filter, statistik, header, dan data utama dokumen.
- [x] Export mencatat aktivitas `DATA_EXPORTED` beserta ringkasan filter dan statistik rekap.
- [x] `docs/api.md`, `docs/business-rules.md`, `docs/routing.md`, dan `docs/progress.md` diperbarui.
- [x] Card ringkasan kecil `Pegawai`, `Jenis Dokumen`, `Terverifikasi`, dan `Belum Upload` dihapus dari page rekap.

### Refactor Komponen Table — Input Jumlah Data Per Halaman Bebas
- [x] Komponen reusable `DataTable` mengganti kontrol `Tampilkan` dari select opsi tetap menjadi input number.
- [x] Admin dapat mengetik jumlah data per halaman langsung, tanpa dibatasi pilihan `10/hal`, `25/hal`, dan seterusnya.
- [x] Nilai page size divalidasi dan di-clamp pada rentang aman `1` sampai `500`.
- [x] Perubahan page size tetap mereset halaman aktif ke page `1`.
- [x] Input page size memakai komponen UI `Input` dari `@/components/ui/input`.
- [x] Master Jenis Dokumen, Security Logs, Manajemen Pegawai, dan table lain yang memakai `DataTable` otomatis mendapat perilaku baru.
- [x] Prop opsi tetap `pageSizeOptions` dihapus dari pemakaian Security Logs agar tidak ada lagi pembatasan pilihan tetap.

### Refactor Storage Bridge — Adapter Penyimpanan Dokumen Lokal/Supabase
- [x] `src/lib/storage.ts` direfactor menjadi folder adapter `src/lib/storage/`.
- [x] Kontrak `StorageProvider` diperluas dengan `uploadFile`, `getFile`, `deleteFile`, `getFileUrl`, `ensureFolder`, dan `fileExists`.
- [x] `StorageUploadResult` dan `StorageFileResult` dibuat agar hasil upload/baca file punya shape konsisten.
- [x] Adapter local mempertahankan perilaku existing, path traversal protection, folder fisik, upload, baca, hapus, dan cek file.
- [x] Adapter Supabase Storage dibuat menggunakan server-side `SUPABASE_SERVICE_ROLE_KEY`, bucket, dan object path yang sama dengan `filePath` database.
- [x] Factory `getStorageProvider()` memilih provider dari `STORAGE_PROVIDER=local|supabase` dan memberi error config yang jelas.
- [x] Endpoint download dokumen membaca file melalui `getStorageProvider().getFile()`, bukan `fs` langsung.
- [x] Endpoint view avatar membaca file melalui `getStorageProvider().getFile()`, bukan `fs` langsung.
- [x] Upload dokumen dan avatar memakai hasil `storagePath` dari bridge, sehingga database tetap menyimpan path relatif provider-agnostic.
- [x] Delete dokumen, delete avatar lama, dan pembuatan folder `DocumentType` tetap melalui storage bridge.
- [x] Helper `getContentTypeFromPath()` ditambahkan untuk MIME type konsisten pada local/Supabase.
- [x] `.env.example`, `docs/architecture.md`, `docs/business-rules.md`, `docs/coding-standard.md`, `docs/api.md`, `docs/features.md`, dan `docs/glossary.md` diperbarui.

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

### Perbaikan Security Logs — Status Aksi Sukses Tercatat Gagal
- [x] Akar masalah ditemukan pada `SecurityLogList`: UI membandingkan status dengan `SUCCESS`, sementara data audit ditulis sebagai `success`.
- [x] Kontrak status audit distandarkan menjadi `success` dan `failed`.
- [x] Helper `normalizeSecurityLogStatus()` dibuat agar variasi data lama seperti `SUCCESS`, `sukses`, `FAILED`, atau `gagal` tetap terbaca benar.
- [x] `logActivity()` menormalisasi status sebelum menyimpan ke `SecurityLog` dan memakai fallback aman `success` jika status kosong.
- [x] Service `GET /api/v1/security-logs` menormalisasi status sebelum data dikirim ke frontend.
- [x] Badge status Security Logs sekarang menampilkan `Sukses` untuk `success` dan `Gagal` untuk `failed`.
- [x] Semua pemanggilan `logActivity()` yang dicek pada jalur sukses memakai `status: "success"`; login gagal tetap memakai `status: "failed"`.
- [x] Dokumentasi aturan status audit diperbarui di `docs/business-rules.md`, `docs/api.md`, dan `docs/progress.md`.

### Konsistensi Layout `page-container`
- [x] Komponen View top-level sekarang menjadi pemilik class `page-container`, bukan wrapper route `page.tsx`.
- [x] Dashboard, Dokumen Saya, Verifikasi Dokumen, Security Logs, Tambah Dokumen, Tambah Pegawai, dan Manajemen Kategori memakai `page-container` langsung pada root komponen.
- [x] Manajemen Pegawai, Master Jenis Dokumen, Rekap Arsip Dokumen Pegawai, Settings, Profil, Detail Dokumen, dan Preview Profil Pegawai juga diselaraskan agar layout tetap konsisten.
- [x] Wrapper `page-container` berlebih pada route dashboard terkait dihapus untuk mencegah nested container.

### F02 — Dashboard
- [x] `src/modules/dashboard/hooks.ts` (selesai 2026-06-28)
- [x] `src/modules/dashboard/components/` (StatsCard, dll) (selesai 2026-06-28)
- [x] `src/app/(dashboard)/dashboard/page.tsx` (selesai 2026-06-28)

### Dashboard Analytics Charts Admin dengan Recharts
- [x] Dependency `recharts` ditambahkan untuk render chart dashboard.
- [x] Endpoint `GET /api/v1/dashboard/charts` dibuat khusus `ADMIN`.
- [x] Payload chart dikirim sebagai data agregat kecil, bukan data mentah seluruh pegawai/dokumen.
- [x] Query pegawai memakai `groupBy` untuk status kepegawaian, jenis kepegawaian, jenis kelamin, dan unit kerja.
- [x] Query status dokumen memakai `DocumentRecord.groupBy({ by: ["status"] })`.
- [x] Upload dokumen 6 bulan terakhir memakai select minimal (`uploadedAt`, `documentTypeId`, dan nama/kode jenis dokumen), lalu diagregasi di service.
- [x] Chart upload dokumen membatasi top 8 jenis dokumen dan menggabungkan sisanya sebagai `Lainnya`.
- [x] Chart dokumen wajib belum upload dihitung secara batch dari pegawai, jenis dokumen wajib applicable, dan dokumen terbaru tanpa N+1 query.
- [x] Dashboard Admin menampilkan chart pegawai berdasarkan status kepegawaian, jenis kepegawaian, jenis kelamin, upload dokumen 6 bulan terakhir, status verifikasi, tren upload, top dokumen wajib belum upload, dokumen hampir kedaluwarsa, dan unit kerja.
- [x] Komponen chart memakai `ResponsiveContainer`, loading skeleton, empty state, dan tooltip Bahasa Indonesia.
- [x] Layout chart dipadatkan agar tidak memakan terlalu banyak ruang: card lebih rendah, grid responsif sampai 3 kolom, tinggi chart dikurangi, dan typography header dibuat lebih ringkas.
- [x] Chart hanya dirender untuk role `ADMIN`; role lain tetap memakai dashboard existing.
- [x] `docs/api.md`, `docs/features.md`, dan `docs/progress.md` diperbarui.

### F09 — Settings
- [x] `src/modules/settings/service.ts`
- [x] `src/modules/settings/repository.ts`
- [x] `src/modules/settings/types.ts`
- [x] `src/modules/settings/api.ts`
- [x] `src/modules/settings/hooks.ts`
- [x] `src/modules/settings/components/SettingsFormView.tsx`
- [x] `src/app/api/v1/settings/route.ts`
- [x] `src/app/(dashboard)/settings/page.tsx`

### Backup Export
- [x] `src/modules/backup/service.ts`
- [x] `src/app/api/v1/backup/export/route.ts`

### Normalisasi Database Prisma - RBAC Single Role
- [x] `prisma/schema.prisma` mempertahankan `User.role` sebagai source of truth dan menghapus `model UserRole`.
- [x] Index `User.role` ditambahkan untuk filter role pada dashboard/list pegawai.
- [x] Migration `prisma/migrations/20260704000000_remove_user_roles/migration.sql` dibuat untuk drop tabel `UserRole` dan menambahkan index role.
- [x] `prisma/seed.ts` tidak lagi membuat data `UserRole`.
- [x] `src/modules/users/repository.ts` tidak lagi melakukan nested create/update/delete `userRoles`.
- [x] `src/modules/backup/service.ts` tidak lagi mengekspor tabel `UserRole`.
- [x] Auth/session tetap single-role dengan `session.user.role`; tidak ada `session.user.roles`.
- [x] Dokumentasi `docs/database.md`, `docs/business-rules.md`, `docs/api.md`, `docs/adr/002-rbac.md`, dan `docs/security-report.md` disinkronkan dengan keputusan single-role.
- [x] `npx prisma generate` dan `npx tsc --noEmit` berhasil.

### TDD & Refactor Ringan Module Users
- [x] Dependency `vitest` ditambahkan sebagai dev dependency.
- [x] Script `test` dan `test:watch` ditambahkan ke `package.json`.
- [x] Konfigurasi `vitest.config.ts` dibuat dengan environment `node` dan alias `@/` ke `src/`.
- [x] `src/modules/users/validation.test.ts` dibuat untuk mengetes `createUserSchema` dan `updateUserSchema`.
- [x] Validation test mencakup input user valid, email invalid, NIP terlalu pendek, nama terlalu pendek, password terlalu pendek, password kosong, TMT valid, TMT akhir lebih awal dari TMT mulai, dan payload update partial.
- [x] Helper pure users dipindahkan dari `src/modules/users/service.ts` ke `src/modules/users/utils.ts`.
- [x] Helper yang dipindahkan mencakup header CSV, CSV parsing/escaping, normalisasi string/boolean, date formatting, status label dokumen, lookup by name, dan validasi header CSV.
- [x] `src/modules/users/utils.test.ts` dibuat untuk mengetes helper CSV, normalisasi, tanggal, label status dokumen, dan lookup.
- [x] `src/modules/users/service.test.ts` dibuat untuk unit test service users dengan mock repository, bcrypt, security log, dan service document-types.
- [x] Service unit test mencakup create user, update user, delete user, template import CSV, error import CSV, export CSV users, dan error export dokumen pegawai ketika user tidak ditemukan.
- [x] `users/service.ts` tetap menjadi public service modul users, sementara helper non-DB dipisahkan agar service lebih fokus pada orchestration bisnis.
- [x] `npm.cmd test -- --run src/modules/users/validation.test.ts src/modules/users/utils.test.ts src/modules/users/service.test.ts` berhasil: 3 file test, 45 test passed.
- [x] `npx.cmd tsc --noEmit` berhasil.

### Unit Test Users Category Service
- [x] Rencana pengetesan `src/modules/users/categories-service.ts` ditambahkan ke `docs/progress.md` sebelum implementasi test.
- [x] `src/modules/users/tests/categories-service.test.ts` dibuat untuk unit test service kategori master pegawai.
- [x] Dependency `../categories-repository` dimock agar test tidak menyentuh Prisma/database.
- [x] Dependency `@/lib/security-log` dimock agar audit log dapat diverifikasi tanpa menulis ke database.
- [x] `getCategoriesService()` dites agar memanggil `findAllCategories()` dan mengembalikan payload repository.
- [x] `createCategoryService()` dites untuk path dengan actor, tanpa actor, dan fallback `actor.email` ketika `actor.name` kosong.
- [x] `updateCategoryService()` dites agar memanggil repository dengan argumen benar dan mencatat audit `CATEGORY_UPDATED`.
- [x] `deleteCategoryService()` dites agar memanggil repository dengan argumen benar dan mencatat audit `CATEGORY_DELETED`.
- [x] `categories-service.ts` memakai `import type { AuthUser }` agar dependency type-only tidak ditarik sebagai runtime dependency.
- [x] `npm.cmd test -- --run` berhasil: 4 file test, 51 test passed.
- [x] `npx.cmd tsc --noEmit` berhasil.

### TDD Module Auth
- [x] Rencana TDD module auth ditambahkan ke `docs/progress.md` sebelum implementasi test.
- [x] `src/modules/auth/tests/validation.test.ts` dibuat untuk test `loginSchema`.
- [x] Validation test mencakup identifier email, identifier NIP/employeeId, identifier kosong, password kosong, pesan error wajib, dan fakta bahwa identifier tidak wajib format email karena bisa berisi NIP.
- [x] Helper pure auth dibuat di `src/modules/auth/utils.ts`.
- [x] Helper `buildLoginLookupWhere()` dibuat untuk membentuk lookup user berdasarkan employeeId atau email.
- [x] Helper `toAuthUserSession()` dibuat agar mapping session tidak menyertakan `passwordHash`.
- [x] Konstanta `INVALID_LOGIN_MESSAGE` dibuat untuk menjaga pesan gagal login konsisten.
- [x] `src/modules/auth/tests/utils.test.ts` dibuat untuk test helper pure auth.
- [x] `src/modules/auth/tests/service.test.ts` dibuat untuk unit test `authenticateUser()`.
- [x] Service unit test memock `@/lib/prisma`, `bcryptjs`, dan `@/lib/security-log`.
- [x] Service unit test mencakup input invalid, user tidak ditemukan, password salah, login sukses, error Prisma bubble, dan error bcrypt bubble.
- [x] Event audit login sukses tetap mengikuti behavior source code aktual: `USER_LOGIN_SUCCESS`.
- [x] Catatan temuan: `docs/business-rules.md` menyebut event sukses login `USER_LOGIN`, sedangkan source code memakai `USER_LOGIN_SUCCESS`; normalisasi event dapat dibuat sebagai task terpisah agar tidak mengubah kontrak audit diam-diam.
- [x] `npm.cmd test -- --run` berhasil: 7 file test, 65 test passed.
- [x] `npx.cmd tsc --noEmit` berhasil.

### TDD Module Dashboard
- [x] Rencana TDD module dashboard ditambahkan ke `docs/progress.md` sebelum implementasi test.
- [x] `src/modules/dashboard/validation.ts` dibuat untuk validasi user dashboard dan akses chart admin.
- [x] `src/modules/dashboard/tests/validation.test.ts` dibuat untuk test role `ADMIN`, `STAFF`, `EMPLOYEE`, id kosong, role kosong/tidak dikenal, dan akses chart khusus admin.
- [x] Helper pure dashboard diekstrak dari `src/modules/dashboard/service.ts` ke `src/modules/dashboard/utils.ts`.
- [x] Helper yang diekstrak mencakup bulan, label bulan, 6 bulan terakhir, grouping chart, normalisasi gender, label status dokumen, penambahan hari, dan chart upload dokumen.
- [x] `src/modules/dashboard/tests/utils.test.ts` dibuat untuk test helper bulan, grouping, label, dan upload chart 6 bulan terakhir.
- [x] `src/modules/dashboard/tests/service.test.ts` dibuat untuk unit test `getDashboardDataService()` dan `getDashboardChartsService()`.
- [x] Service unit test memock `src/modules/dashboard/repository.ts` dan `isDocumentTypeApplicableToUser()`.
- [x] Service unit test mencakup RBAC stats untuk `ADMIN`/`STAFF` vs `EMPLOYEE`, DTO statistik, akses chart admin-only, DTO chart, dokumen wajib yang belum upload, dan error repository bubble.
- [x] `getDashboardChartsService()` tetap mempertahankan behavior source code aktual, termasuk chart key upload yang dihitung dari semua upload repository, sementara nilai bulan tetap hanya menghitung rentang 6 bulan aktif.
- [x] `npm.cmd test -- --run` berhasil: 10 file test, 87 test passed.
- [x] `npx.cmd tsc --noEmit` berhasil.

### TDD Module Document Types
- [x] Rencana TDD module document-types ditambahkan ke `docs/progress.md` sebelum implementasi test.
- [x] Helper pure document-types diekstrak dari `src/modules/document-types/service.ts` ke `src/modules/document-types/utils.ts`.
- [x] Helper yang diekstrak mencakup normalisasi folder jenis dokumen, date range, deteksi filter tanggal, format tanggal/nama file, label status, escape CSV, filter row rekap, dan builder CSV export rekap arsip.
- [x] `src/modules/document-types/tests/validation.test.ts` dibuat untuk test `createDocumentTypeSchema`, `updateDocumentTypeSchema`, dan `documentArchiveFilterSchema`.
- [x] Validation test mencakup payload valid, transform `code`/`name`, default boolean/array target, kategori arsip valid/invalid, batas panjang field, `allowedFormats`, `maxSizeMb`, partial update, filter enum, upload status, search trim, dan format tanggal `YYYY-MM-DD`.
- [x] `src/modules/document-types/tests/utils.test.ts` dibuat untuk test helper pure tanpa dependency Prisma/repository/storage/audit log.
- [x] Utility test mencakup folder name, start/end of day, date range, date filter detection, format tanggal/nama file, label status dokumen, escape CSV, filter row rekap, dan CSV export content dengan BOM.
- [x] `src/modules/document-types/tests/service.test.ts` dibuat untuk unit test service document-types.
- [x] Service unit test memock `src/modules/document-types/repository.ts`, `@/lib/prisma`, `@/lib/storage`, dan `@/lib/security-log`.
- [x] Service unit test mencakup applicability target user, `getAllDocumentTypes()`, `getDocumentTypeById()`, create duplicate/sukses, update not found/duplicate/sukses, delete sukses, rekap arsip uploaded/missing, filter rekap, export CSV, dan audit `DATA_EXPORTED`.
- [x] `src/modules/document-types/service.ts` memakai `import type { AuthUser }` agar dependency type-only tidak ditarik sebagai runtime dependency.
- [x] `npm.cmd test -- --run src/modules/document-types/tests` berhasil: 3 file test, 29 test passed.
- [x] `npx.cmd tsc --noEmit` berhasil.

### Archives — Default Tampilkan Dokumen Terupload
- [x] Page Rekapitulasi Arsip Dokumen Pegawai (`/document-types/archives`) sekarang default memakai filter `Status Upload = Sudah Upload`.
- [x] Baris `Belum Upload` tidak lagi muncul pada tampilan awal archives.
- [x] Admin tetap bisa memilih filter `Belum Upload` jika ingin melihat kewajiban dokumen yang belum dipenuhi.
- [x] Empty state disesuaikan agar menjelaskan konteks dokumen yang sudah diupload.
- [x] Mode `Sudah Upload` pada endpoint archives sekarang mengambil `DocumentRecord` yang benar-benar sudah diupload pengguna, termasuk jenis dokumen non-wajib.
- [x] Unit test service document-types diperbarui untuk memastikan dokumen non-wajib yang sudah diupload tetap muncul di archives.

### Implementasi RBAC Bertingkat — ADMIN/STAFF Mewarisi Kemampuan EMPLOYEE
- [x] Helper capability RBAC ditambahkan di `src/lib/rbac.ts` dan diekspor dari `src/lib/auth-utils.ts`.
- [x] `ADMIN` memiliki capability `ADMIN`, `STAFF`, dan `EMPLOYEE`; `STAFF` memiliki capability `STAFF` dan `EMPLOYEE`; `EMPLOYEE` tetap personal.
- [x] Query archives dan dashboard mandatory users tidak lagi mengunci `role = EMPLOYEE`, tetapi memakai role internal dengan kemampuan employee: `ADMIN`, `STAFF`, dan `EMPLOYEE`.
- [x] Halaman/endpoint Dokumen Saya default menampilkan dokumen personal untuk semua role internal; `ADMIN` tetap dapat meminta `ownerId` eksplisit untuk konteks admin-wide.
- [x] UI Dokumen Saya memakai helper capability untuk tombol upload, upload ulang dokumen `REJECTED`, dan hapus dokumen personal.
- [x] Route detail/download dokumen dan route verifikasi memakai helper capability agar aturan akses tidak tersebar sebagai hardcode role manual.
- [x] Dokumentasi `docs/business-rules.md`, `docs/api.md`, `docs/database.md`, `docs/features.md`, dan `docs/adr/002-rbac.md` disinkronkan dengan RBAC bertingkat.
- [x] Unit test helper RBAC dan service documents ditambahkan untuk mengunci kemampuan personal `ADMIN`/`STAFF` serta aturan hapus dokumen `APPROVED`.

### Refactor View.tsx Tahap 1 — Refactor `UserFormView.tsx`
- [x] `UserFormState` ditambahkan ke `src/modules/users/types.ts` untuk mendefinisikan shape 24 field form secara terpadu.
- [x] `MasterCategories` type ditambahkan ke `types.ts` agar shape response `/api/v1/users/categories` terdokumentasi secara eksplisit.
- [x] `fetchUserCategoriesApi()` ditambahkan ke `src/modules/users/api.ts` menggunakan `apiClient` (mengganti `fetch()` manual).
- [x] `useMasterCategories()` di `src/modules/users/hooks.ts` difix: `fetch()` langsung diganti dengan `fetchUserCategoriesApi()`, `staleTime` dinaikkan ke 5 menit.
- [x] `UserFormView.tsx` direfactor total: 27 `useState` → 1 `useReducer(formReducer, USER_FORM_INITIAL_STATE)`, `fetch()` manual dihapus, diganti dengan `useMasterCategories()` hook.
- [x] `USER_FORM_INITIAL_STATE` dan `formReducer` didefinisikan di dalam `UserFormView.tsx` sebagai konstanta dan helper murni.
- [x] `mapUserToFormState(user)` dibuat untuk mengkonversi data server ke `UserFormState` (termasuk format tanggal `date-fns`) — mengganti 18 baris `setXxx()` dengan 1 `dispatch()` tunggal.
- [x] Dropdown dependent status kepegawaian → jenis kepegawaian dan profesi → jabatan tetap berfungsi melalui `availableGroups` dan `availablePositions` (derived dari `form.employmentStatusId` dan `form.professionGroupId`).
- [x] Semua `onChange` field form menggunakan `dispatch({ fieldKey: value })` — tidak ada lagi setter individual.
- [x] `handleSubmit` merakit payload dari satu object `form`, bukan dari puluhan variabel tersebar.
- [x] `npm.cmd test -- --run` berhasil: 10 file test, 87 test passed.
- [x] `npx.cmd tsc --noEmit` berhasil bersih.

### Refactor View.tsx Tahap 2 — Ekstrak `DocumentTypeForm` Reusable
- [x] `DocumentTypeFormState` ditambahkan ke `src/modules/document-types/types.ts` untuk mendefinisikan tipe status form jenis dokumen yang seragam.
- [x] Komponen form reusable `DocumentTypeForm` dibuat di `src/modules/document-types/components/DocumentTypeForm.tsx` lengkap dengan local `useReducer` management.
- [x] Helper `mapDocumentTypeToFormState(data)` dan `formStateToPayload(state)` diekspor dari `DocumentTypeForm.tsx` untuk kemudahan parsing input/output.
- [x] `AddDocumentTypeView.tsx` direfactor penuh: dari 319 baris disederhanakan menjadi ~40 baris dengan memanggil `DocumentTypeForm`.
- [x] `EditDocumentTypeView.tsx` direfactor penuh: dari 376 baris disederhanakan menjadi ~65 baris, loading & error state tetap dipertahankan, remount form dipicu oleh `key={id}`.
- [x] Berhasil menghilangkan redundansi kode sebesar ~200+ baris JSX & state management duplikat antara Add dan Edit views.
- [x] `npm.cmd test -- --run` berhasil: 87 test passed.
- [x] `npx.cmd tsc --noEmit` berhasil bersih.

### Refactor View.tsx Tahap 3 — Refactor `CategoriesView.tsx`
- [x] State manual `employmentStatuses`, `professionGroups`, `employeeRanks`, `workplaces`, dan `fetchLoading` beserta raw `fetch()` call di `useEffect` dihilangkan.
- [x] `useMasterCategories()` hook dari modul users diintegrasikan langsung ke dalam `CategoriesView.tsx`.
- [x] Hirarki data-fetching dialihkan sepenuhnya ke TanStack Query, menyelesaikan pelanggaran arsitektur `fetch` manual.
- [x] Tombol delete dan submit form modal memicu `refetchCategories()` dari hook untuk sinkronisasi ulang data kategori pasca aksi.
- [x] State lokal yang tersisa disisakan hanya untuk UI modal dan form data yang memang dinamis.
- [x] `npm.cmd test -- --run` berhasil: 87 test passed.
- [x] `npx.cmd tsc --noEmit` berhasil bersih.

---

## 🟡 Sedang Dikerjakan

*(Kosong — tidak ada task dokumentasi/implementasi aktif yang tercatat.)*

## 🟢 Audit Security RLS (Selesai 2026-07-01)
- **Analisis masalah:** Terdapat peringatan `rls_disabled_in_public` dari Supabase. Project menggunakan Prisma dan tidak menggunakan REST API Supabase.
- **Langkah dilakukan:** Audit 18 tabel Prisma pada schema `public` dan menyusun script SQL untuk mengaktifkan RLS tanpa menetapkan policy (Default: DENY ALL untuk REST API).
- **Hasil Audit & Migrasi:** Script migrasi, Security Report, dan Verification Checklist berhasil dibuat di dalam folder `docs/`. Prisma tidak akan terdampak oleh perubahan ini.

---

## 🔴 Yang Belum Dibuat

- Reset password via email belum tersedia.

## 📋 TODO Dari Analisis PRD

- [ ] **Tentukan threshold peringatan kedaluwarsa** — PRD menyebut "mendekati kedaluwarsa" tapi tidak spesifik hari. Implementor tentukan (misal: 30 hari).
- [x] **Tentukan behavior ganti password** — tersedia endpoint `PUT /api/v1/profile/password`.
- [ ] **Tentukan paginasi default** — PRD belum mendefinisikan ukuran halaman default untuk list API.
- [x] **Konfigurasi Middleware path** — `src/middleware.ts` menjadi entrypoint Next.js dan mendelegasikan logic ke `src/proxy.ts`.
- [x] **Seed data master** — `prisma/seed.ts` tersedia.
- [x] **Format CSV import pegawai** — Header dan format kolom CSV untuk import sudah ditetapkan di fitur bulk import/export.
- [ ] **Reset password** — Belum ada di PRD, perlu klarifikasi apakah diperlukan.

---

## 🗓️ Riwayat Update

| Tanggal | Diupdate oleh | Perubahan |
|---|---|---|
| 2026-06-28 | AI Agent (setup awal) | Inisialisasi dokumentasi dari PRD v1.0 |
| 2026-07-01 | AI Agent | Sinkronisasi docs dengan source code aktual, route/API, status fitur, dan indeks dokumentasi |
| 2026-07-02 | AI Agent | Implementasi data TMT/masa kontrak pegawai pada schema, API users/profile, form admin, tampilan profile, dan dokumentasi |
| 2026-07-02 | AI Agent | Implementasi bulk import/export pegawai CSV: template, validasi all-or-nothing, export filter aktif, dan audit log |
| 2026-07-01 | AI Agent | Update storage dokumen: folder per kode jenis dokumen di bucket dan download Supabase-aware |
| 2026-07-02 | AI Agent | Setup environment local: `.env.local`, Docker Compose PostgreSQL lokal, storage provider lokal, dan hapus dependency Supabase dari runtime |
| 2026-07-02 | AI Agent | Selesaikan upload dokumen: validasi metadata wajib, nomor surat, tanggal terbit, dan hapus catatan tambahan |
| 2026-07-02 | AI Agent | Tambah rencana detail backlog: upload ulang dokumen ditolak, dokumen pada preview profil pegawai, export Excel rekap arsip, perbaikan progress bar, dan input page size table |
| 2026-07-02 | AI Agent | Selesaikan upload ulang dokumen ditolak: tombol `Upload Ulang`, modal prefill metadata, validasi `replaceDocumentId`, replace dokumen lama, snapshot audit SecurityLog, dan dokumentasi API/aturan bisnis |
| 2026-07-02 | AI Agent | Selesaikan Preview Profil Pegawai: tabel dokumen reusable, integrasi dokumen pegawai, page detail dokumen, preview file, dan dokumentasi route/API/RBAC |
| 2026-07-02 | AI Agent | Tambah tombol Preview pada card Dokumen Saya dan perketat RBAC detail/download dokumen agar selain ADMIN hanya bisa akses dokumen sendiri |
| 2026-07-03 | AI Agent | Selesaikan rekapitulasi arsip dokumen pegawai: endpoint rekap wajib, progress bar seluruh pegawai, metrik upload/verifikasi/belum upload, export CSV, audit `DATA_EXPORTED`, dan dokumentasi |
| 2026-07-03 | AI Agent | Ubah export rekap arsip dari XLS ke CSV, pindahkan tombol export ke area antara filter dan table, serta hapus card ringkasan kecil |
| 2026-07-03 | AI Agent | Selesaikan refactor komponen table: kontrol `Tampilkan` menjadi input number bebas dengan validasi 1-500 dan berlaku untuk semua table berbasis `DataTable` |
| 2026-07-03 | AI Agent | Tambah rencana detail refactor Storage Bridge agar penyimpanan dokumen bisa berganti antara local dan Supabase lewat konfigurasi |
| 2026-07-03 | AI Agent | Selesaikan refactor Storage Bridge: adapter local/Supabase, kontrak upload/baca file, download dokumen dan view avatar via bridge, env example, dan dokumentasi |
| 2026-07-03 | AI Agent | Tambah rencana detail backlog: export CSV dokumen pada Preview Profil Pegawai dan perbaikan status aksi Security Logs |
| 2026-07-03 | AI Agent | Selesaikan export CSV dokumen pada Preview Profil Pegawai: endpoint admin-only, tombol export table, query batch, CSV dokumen relevan, dan audit `DATA_EXPORTED` |
| 2026-07-03 | AI Agent | Selesaikan perbaikan Security Logs: normalisasi status audit, mapping badge `Sukses/Gagal`, dan dokumentasi kontrak `success/failed` |
| 2026-07-03 | AI Agent | Seragamkan layout halaman dashboard dengan memindahkan `page-container` ke komponen View top-level dan menghapus wrapper route berlebih |
| 2026-07-03 | AI Agent | Tambah rencana detail backlog Dashboard Analytics Charts dengan Recharts, query agregat ringan, endpoint chart, dan acceptance criteria |
| 2026-07-03 | AI Agent | Selesaikan Dashboard Analytics Charts Admin dengan Recharts: endpoint chart agregat, query ringan, chart pegawai/dokumen, dan dokumentasi |
| 2026-07-03 | AI Agent | Padatkan layout chart dashboard admin agar lebih hemat ruang dengan card, grid, dan tinggi chart yang lebih compact |
| 2026-07-03 | AI Agent | Tambah rencana refactor route master jenis dokumen untuk menghapus route typo/duplikat dan menstandarkan `/document-types` |
| 2026-07-03 | AI Agent | Selesaikan refactor route master jenis dokumen: tambah route edit canonical, update link tambah/edit, hapus route typo lama, dan update routing |
| 2026-07-04 | AI Agent | Tambah rencana detail TDD module users: validation test, pure helper test, service unit test, dan refactor helper CSV/formatting dari `users/service.ts` ke utility module |
| 2026-07-04 | AI Agent | Selesaikan normalisasi RBAC single-role: pertahankan `User.role`, hapus `UserRole` dari schema/seed/repository/backup, tambah migration, generate Prisma Client, dan sinkronkan dokumentasi |
| 2026-07-04 | AI Agent | Selesaikan TDD module users: setup Vitest, tambah validation/helper/service unit test, refactor helper users ke `utils.ts`, dan verifikasi test + TypeScript |
| 2026-07-04 | AI Agent | Selesaikan unit test `users/categories-service`: mock repository/audit log, test get/create/update/delete category service, dan verifikasi test + TypeScript |
| 2026-07-04 | AI Agent | Selesaikan TDD module auth: tambah validation/helper/service unit test, ekstrak helper auth ke `utils.ts`, dan verifikasi test + TypeScript |
| 2026-07-04 | AI Agent | Selesaikan TDD module dashboard: tambah validation/helper/service unit test, ekstrak helper chart dashboard ke `utils.ts`, dan verifikasi test + TypeScript |
| 2026-07-04 | AI Agent | Selesaikan TDD module document-types: tambah validation/helper/service unit test, ekstrak helper rekap/CSV/date ke utils.ts, dan verifikasi test + TypeScript |
| 2026-07-04 | AI Agent | Ubah default halaman archives agar menampilkan dokumen yang sudah diupload pengguna dan menyembunyikan baris `Belum Upload` dari tampilan awal |
| 2026-07-04 | AI Agent | Perbaiki sumber data archives mode `Sudah Upload` agar mengambil dokumen upload aktual, termasuk jenis dokumen non-wajib yang sudah disetujui |
| 2026-07-04 | AI Agent | Tambah rencana refactor View.tsx: optimasi state management (useReducer), eliminasi duplikasi Add/Edit DocumentType, dan perbaikan pelanggaran arsitektur fetch() langsung di komponen |
| 2026-07-04 | AI Agent | Selesaikan Refactor View.tsx Tahap 1: UserFormView.tsx dari 27 useState → 1 useReducer, fetch() manual → useMasterCategories() hook, tambah UserFormState + MasterCategories type, tambah fetchUserCategoriesApi(), fix useMasterCategories() |
| 2026-07-04 | AI Agent | Selesaikan Refactor View.tsx Tahap 2: Ekstrak DocumentTypeForm reusable untuk menampung Add dan Edit views, merampingkan kode Add/Edit views hingga 90%, dan menyatukan status form. |
| 2026-07-04 | AI Agent | Selesaikan Refactor View.tsx Tahap 3: CategoriesView.tsx dioptimalkan dengan mengganti fetch manual di useEffect & 4 useState data master ke useMasterCategories() hook. |
| 2026-07-04 | AI Agent | Selesaikan implementasi RBAC bertingkat: helper capability, archives/dashboard mencakup ADMIN/STAFF/EMPLOYEE sebagai pemilik dokumen personal, konteks Dokumen Saya dibuat personal, route akses dokumen/verifikasi memakai helper, dan dokumentasi disinkronkan. |
| 2026-07-04 | AI Agent | Tambah aturan anti-duplikasi upload dokumen: select upload menyembunyikan jenis dokumen yang sudah dimiliki user, backend menolak `documentTypeId` duplikat, dan test service documents diperbarui. |
| 2026-07-04 | AI Agent | Ubah tampilan TMT: akhir TMT/kontrak menjadi opsional, profil menampilkan `TMT Awal CPNS` jika tanggal akhir kosong dan `Masa Kontrak` jika tanggal mulai/akhir terisi. |




