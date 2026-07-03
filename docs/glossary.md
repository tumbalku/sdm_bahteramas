# Glossary — SMDP Portal

## Istilah Domain Aplikasi

| Istilah | Penjelasan |
|---|---|
| **SMDP** | Sistem Manajemen Dokumen Pegawai — nama resmi aplikasi ini |
| **Portal** | Antarmuka web terpadu untuk seluruh pengguna (ADMIN, STAFF, EMPLOYEE) |
| **Pegawai** | Semua karyawan yang terdaftar di sistem, terlepas dari status kepegawaian |
| **Arsip** | Kumpulan berkas dokumen yang dimiliki seorang pegawai, dikelompokkan per kategori |
| **Berkas / Dokumen** | File fisik (PDF, gambar) yang diunggah pegawai sebagai bukti kualifikasi |
| **Jenis Dokumen** | Definisi master dari tipe dokumen (KTP, Ijazah, STR, dll) yang ada di sistem |
| **Dokumen Wajib** | Jenis dokumen dengan `isMandatory = true` — harus dimiliki oleh pegawai yang sesuai targetnya |
| **Masa Berlaku** | Tanggal kedaluwarsa (`expiryDate`) dari sebuah berkas — relevan untuk dokumen seperti STR, SIP |
| **Verifikasi** | Proses ADMIN/STAFF meninjau dan memutuskan (Approve/Reject) dokumen yang diunggah pegawai |
| **Audit Trail** | Catatan log seluruh aktivitas sensitif di sistem (lihat Security Log) |

---

## Kategori Arsip Dokumen

| Istilah | Enum | Penjelasan |
|---|---|---|
| **Arsip Utama** | `UTAMA` | Dokumen identitas dasar yang wajib dimiliki seluruh pegawai tanpa terkecuali (KTP, Ijazah, KK) |
| **Arsip Kondisional** | `KONDISIONAL` | Dokumen pendukung yang bersifat opsional atau bergantung kondisi masing-masing pegawai (Sertifikat Pelatihan, Penghargaan) |
| **Arsip Profesi** | `PROFESI` | Dokumen izin praktik / kompetensi yang hanya dipersyaratkan untuk tenaga medis dan kesehatan tertentu (STR, SIP, SIK) |

---

## Singkatan

| Singkatan | Kepanjangan | Penjelasan |
|---|---|---|
| **NIP** | Nomor Induk Pegawai | Identitas unik pegawai ASN — disimpan sebagai `User.employeeId` |
| **STR** | Surat Tanda Registrasi | Izin registrasi tenaga medis dari Konsil Kedokteran / Konsil Tenaga Kesehatan |
| **SIP** | Surat Izin Praktik | Izin praktik dari dinas kesehatan untuk tenaga medis di lokasi tertentu |
| **SIK** | Surat Izin Kerja | Izin kerja untuk beberapa jenis tenaga kesehatan tertentu |
| **KTP** | Kartu Tanda Penduduk | Identitas resmi warga negara Indonesia |
| **KK** | Kartu Keluarga | Dokumen kependudukan yang menunjukkan anggota keluarga |
| **RBAC** | Role-Based Access Control | Sistem otorisasi berdasarkan role/peran pengguna |
| **PRD** | Product Requirement Document | Dokumen spesifikasi kebutuhan produk |
| **ADR** | Architecture Decision Record | Catatan keputusan arsitektur beserta alasannya |
| **CRUD** | Create, Read, Update, Delete | Operasi dasar pengelolaan data |
| **ORM** | Object-Relational Mapper | Tool yang mengabstraksikan query database (Prisma di proyek ini) |
| **REST** | Representational State Transfer | Gaya arsitektur API berbasis HTTP yang digunakan di proyek ini |
| **CSV** | Comma-Separated Values | Format file teks untuk ekspor/impor data tabular |
| **PNS** | Pegawai Negeri Sipil | Salah satu status kepegawaian |
| **PPPK** | Pegawai Pemerintah dengan Perjanjian Kerja | Salah satu status kepegawaian ASN non-PNS |
| **ASN** | Aparatur Sipil Negara | Istilah umum untuk PNS dan PPPK |

---

## Nama Modul

| Modul | Lokasi | Fungsi |
|---|---|---|
| `auth` | `src/modules/auth/` | Login, sesi, autentikasi |
| `dashboard` | `src/modules/dashboard/` | Ringkasan statistik — tidak punya tabel sendiri |
| `document-types` | `src/modules/document-types/` | Master jenis dokumen + kategori + target profesi |
| `documents` | `src/modules/documents/` | Upload, lihat, hapus berkas dokumen |
| `verification` | `src/modules/verification/` | Approve / Reject dokumen |
| `users` | `src/modules/users/` | CRUD pegawai, import/export CSV |
| `profile` | `src/modules/profile/` | Update biodata mandiri |
| `security-logs` | `src/modules/security-logs/` | Audit trail aktivitas sensitif |

---

## Istilah Teknis Arsitektur

| Istilah | Penjelasan |
|---|---|
| **Monolit Modular** | Arsitektur satu aplikasi yang dibagi menjadi modul domain yang terisolasi secara logis |
| **service.ts** | File logika bisnis dalam setiap modul — **satu-satunya** file yang boleh diimpor oleh modul lain |
| **repository.ts** | File query database (Prisma) dalam setiap modul — hanya boleh dipanggil oleh `service.ts` modul sendiri |
| **validation.ts** | File berisi schema Zod untuk validasi input dari luar (form, request body, query string) |
| **api.ts** | File berisi fungsi `fetch()` ke endpoint REST — digunakan di sisi frontend |
| **hooks.ts** | File berisi TanStack Query hooks (`useQuery`, `useMutation`) — digunakan di komponen React |
| **Route Handler** | File `route.ts` di `src/app/api/` yang menangani request HTTP ke endpoint REST |
| **Route Group** | Folder di Next.js App Router dengan nama dalam kurung `(nama)` — tidak memengaruhi URL |
| **Server Component** | Komponen React yang dirender di server (default di Next.js App Router) |
| **Client Component** | Komponen React dengan `"use client"` — dirender di browser, bisa menggunakan hooks |
| **Middleware** | Kode yang berjalan sebelum request mencapai halaman/API — digunakan untuk cek autentikasi |
| **`requireRole()`** | Fungsi server-side untuk memverifikasi role user — dipanggil di `page.tsx` |
| **`hasRole()`** | Fungsi client-side untuk menyembunyikan/menampilkan elemen UI berdasarkan role |
| **`logActivity()`** | Fungsi helper untuk mencatat aktivitas sensitif ke tabel `SecurityLog` |
| **`getStorageProvider()`** | Fungsi storage bridge — mengembalikan adapter lokal atau Supabase berdasarkan config |
| **`generateStorageFileName()`** | Fungsi di `documents/service.ts` untuk membuat nama file terstandarisasi |
| **`slugifyFileName()`** | Fungsi di `src/lib/` untuk sanitasi nama file (hapus spasi, karakter tidak valid) |
| **`parseAllowedFormats()`** | Fungsi di `src/lib/` untuk parsing string `"pdf,jpg,png"` menjadi array |
| **TanStack Query** | Library manajemen state server (cache, loading, error, refetch) — alias React Query v5 |
| **Zod** | Library validasi skema TypeScript-first |
| **NextAuth.js** | Library autentikasi untuk Next.js |
| **Prisma** | ORM untuk Node.js/TypeScript — mengabstraksikan query PostgreSQL |
| **Shadcn UI** | Kumpulan komponen UI berbasis Radix UI + Tailwind CSS |
| **KIS** | Keep It Simple — prinsip utama desain proyek ini |
| **Microservice** | Arsitektur di mana setiap domain bisnis berjalan sebagai layanan independen |
| **Conventional Commits** | Konvensi penulisan pesan commit Git: `type(scope): deskripsi` |

---

## Event Types (Security Log)

| Event Type | Kapan Dipanggil |
|---|---|
| `USER_LOGIN` | Login berhasil |
| `USER_LOGIN_FAILED` | Login gagal (email/password salah) |
| `DOCUMENT_UPLOADED` | Berkas dokumen berhasil diunggah |
| `DOCUMENT_APPROVED` | Dokumen disetujui oleh ADMIN/STAFF |
| `DOCUMENT_REJECTED` | Dokumen ditolak oleh ADMIN/STAFF |
| `DOCUMENT_DELETED` | Berkas dokumen dihapus |
| `USER_CREATED` | Pegawai baru dibuat |
| `USER_UPDATED` | Data pegawai diperbarui |
| `USER_DELETED` | Pegawai dihapus dari sistem |
| `DATA_EXPORTED` | Data diekspor ke CSV atau format lain |
