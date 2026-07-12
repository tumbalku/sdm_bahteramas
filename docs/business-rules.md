# Business Rules — SMDP Portal

## 1. RBAC — Role & Permission

### Role Definitions

| Role | Deskripsi |
|---|---|
| `ADMIN` | Administrator sistem — akses penuh ke semua fitur |
| `STAFF` | Staf — fokus pada verifikasi dokumen dan melihat data |
| `EMPLOYEE` | Pegawai — mengelola dokumen dan profil milik sendiri saja |

Permission bersifat bertingkat/capability-based:
- `ADMIN` mewarisi kemampuan `STAFF` dan `EMPLOYEE`.
- `STAFF` mewarisi kemampuan personal `EMPLOYEE`.
- `EMPLOYEE` hanya memiliki kemampuan personal milik sendiri.
- Database tetap menyimpan satu role utama di `User.role`.

### Permission Matrix

| Fitur / Aksi | ADMIN | STAFF | EMPLOYEE |
|---|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ |
| Lihat dashboard | ✅ | ✅ | ✅ (ringkasan personal) |
| Upload dokumen (milik sendiri) | ✅ | ✅ | ✅ |
| Lihat dokumen milik sendiri | ✅ | ✅ | ✅ |
| Lihat semua dokumen | ✅ | ✅ (verifikasi) | ❌ |
| Lihat dokumen pada preview profil pegawai | ✅ | ❌ | ❌ |
| Export CSV/PDF pada preview profil pegawai | ✅ | ❌ | ❌ |
| Lihat detail dokumen | ✅ | ✅ (milik sendiri) | ✅ (milik sendiri) |
| Hapus dokumen (milik sendiri, bukan APPROVED) | ✅ | ✅ | ✅ |
| Hapus dokumen siapapun | ✅ | ❌ | ❌ |
| Approve/Reject dokumen | ✅ | ✅ | ❌ |
| Download dokumen | ✅ | ✅ (milik sendiri) | ✅ (milik sendiri) |
| Kelola jenis dokumen (master) | ✅ | ❌ | ❌ |
| Lihat/export rekap arsip dokumen pegawai | ✅ | ❌ | ❌ |
| CRUD pegawai | ✅ | ❌ | ❌ |
| Import/Export CSV pegawai | ✅ | ❌ | ❌ |
| Kelola/export profil (mandiri) | ✅ | ✅ | ✅ |
| Lihat security logs | ✅ | ❌ | ❌ |

---

## 2. Kategori Arsip Dokumen

### Definisi Kategori

| Kategori | Enum | Definisi | Contoh | Wajib untuk |
|---|---|---|---|---|
| Arsip Utama | `UTAMA` | Dokumen identitas dasar | KTP, Ijazah, Kartu Keluarga | Semua pegawai |
| Arsip Kondisional | `KONDISIONAL` | Dokumen pendukung opsional | Sertifikat Penghargaan, Sertifikat Pelatihan | Opsional |
| Arsip Profesi | `PROFESI` | Dokumen izin praktik/kompetensi | STR, SIP, SIK | Tenaga medis/kesehatan tertentu |

### Aturan Kategori

1. Kategori disimpan di `DocumentType.archiveCategory` (master data).
2. `DocumentRecord` **tidak menyimpan kategori** — kategori diambil melalui join dengan `DocumentType`.
3. Di halaman dokumen pegawai, tampilkan dalam **3 tab**: Arsip Utama | Arsip Kondisional | Arsip Profesi.
4. Dokumen `PROFESI` hanya relevan untuk pegawai dengan `ProfessionGroup` tertentu.

### Aturan Preview Profil Pegawai

1. Page Preview Profil Pegawai hanya dapat diakses `ADMIN`.
2. `ADMIN` dapat melihat daftar dokumen yang berelasi dengan pegawai tersebut.
3. Tabel dokumen pada Preview Profil Pegawai menggunakan komponen reusable yang juga dapat dipakai oleh dashboard.
4. Klik row dokumen membuka Page Detail Dokumen (`/documents/[id]`) agar detail dapat dibuka ulang melalui URL.
5. Page Detail Dokumen menampilkan preview file jika format didukung browser (`pdf`, `jpg`, `jpeg`, `png`, `webp`) dan menyediakan tombol unduh sebagai fallback.
6. Properti detail dokumen mencakup pemilik, NIP, jenis dokumen, kode, kategori, nomor surat, tanggal terbit, tanggal kedaluwarsa, tanggal upload, status, dan verifikasi terakhir.
7. `ADMIN` dapat export CSV dokumen pegawai dari table `Dokumen Pegawai`.
8. Export CSV dokumen pegawai mencakup semua jenis dokumen yang relevan dengan pegawai, termasuk jenis yang belum diupload.
9. Kolom export dokumen pegawai: `Jenis Dokumen`, `Kode Dokumen`, `Kategori Arsip`, `Status Upload`, `Status Verifikasi`, `Nomor Surat`, `Tanggal Terbit`, `Tanggal Kedaluwarsa`, `Tanggal Upload`, `Nama File`, dan `Catatan Terakhir`.
10. Export CSV dokumen pegawai wajib mencatat `DATA_EXPORTED` dengan scope `EMPLOYEE_DOCUMENTS`.
11. Tombol `Export CSV` pada Preview Profil Pegawai disabled jika pegawai belum memiliki dokumen yang diupload.
12. `ADMIN` dapat export PDF Preview Profil Pegawai yang berisi identitas, biodata, informasi kepegawaian, dan table dokumen relevan dengan kolom jenis dokumen serta nomor dokumen.
13. Export PDF Preview Profil Pegawai wajib mencatat `DATA_EXPORTED` dengan scope `EMPLOYEE_PROFILE_PDF`.
14. PDF profil dibuat dengan Puppeteer memakai layout A4 portrait yang ramah cetak hitam putih, dengan data profil dalam kartu dua kolom dan arsip dokumen dalam item-card ringkas.
15. Footer PDF wajib memuat tanggal cetak, nomor halaman, dan QR verifikasi.

### Aturan Profil Mandiri

1. Semua role internal dapat melihat, mengubah biodata terbatas, mengganti password, upload avatar, dan export PDF profil dirinya sendiri.
2. Export PDF Profil Saya memakai endpoint `/api/v1/profile/export-pdf` dan tidak menerima `userId` dari client.
3. Export PDF Profil Saya wajib mencatat `DATA_EXPORTED` dengan scope `OWN_PROFILE_PDF`.

---

## 3. Aturan Upload Dokumen

### Validasi File

| Aturan | Detail |
|---|---|
| Format file | Ditentukan per jenis dokumen di `DocumentType.allowedFormats` (contoh: `"pdf,jpg,png"`) |
| Ukuran maksimum | Ditentukan per jenis dokumen di `DocumentType.maxSizeMb` |
| Tanggal kedaluwarsa | Wajib diisi jika `DocumentType.requiresExpiryDate = true` |
| Tanggal terbit | Wajib diisi jika `DocumentType.requiresIssueDate = true`; disimpan di `DocumentRecord.issueDate` |
| Nomor surat | Wajib diisi jika `DocumentType.requiresDocumentNumber = true`; disimpan di `DocumentRecord.documentNumber` |

### Workflow Upload

1. User internal dengan kemampuan `EMPLOYEE` (`ADMIN`, `STAFF`, `EMPLOYEE`) pilih jenis dokumen → sistem otomatis menunjukkan kategori arsipnya.
2. User mengisi `documentNumber`, `issueDate`, dan/atau `expiryDate` sesuai konfigurasi jenis dokumen.
3. User pilih file → kirim `POST /api/v1/documents/upload`.
4. Backend:
   - Menolak upload normal jika user sudah memiliki dokumen dengan jenis/kode dokumen yang sama.
   - Validasi format dan ukuran file.
   - Validasi nomor surat, tanggal terbit, dan tanggal kedaluwarsa sesuai konfigurasi `DocumentType`.
   - Simpan file via `getStorageProvider().uploadFile()`.
   - Generate nama file standar via `generateStorageFileName()`.
   - Simpan file di folder storage sesuai kode jenis dokumen, contoh `KK/{nama-file}`.
   - Simpan `DocumentRecord` dengan `status: PENDING`.
   - Panggil `logActivity("DOCUMENT_UPLOADED", ...)`.

### Workflow Upload Ulang Dokumen Ditolak

1. Jika dokumen berstatus `REJECTED`, Page Dokumen Saya menampilkan aksi utama `Upload Ulang` / `Ganti File`, bukan `Unduh`.
2. Pegawai klik `Upload Ulang` dari dokumen yang ditolak.
3. Form upload dikunci pada `DocumentType` yang sama dan metadata lama diisi ulang sebagai nilai awal.
4. Backend menerima `replaceDocumentId` pada `POST /api/v1/documents/upload`.
5. Backend wajib memvalidasi bahwa dokumen lama:
   - Ada di database.
   - Milik user yang sedang login.
   - Berstatus `REJECTED`.
   - Memiliki `documentTypeId` yang sama dengan upload baru.
6. Upload ulang membuat `DocumentRecord` baru dengan `status: PENDING`.
7. Sebelum dokumen lama dihapus, sistem menyalin snapshot audit ke `SecurityLog.metadata`, mencakup identitas dokumen lama, pemilik dokumen, jenis dokumen, file lama, metadata dokumen, dan catatan verifikasi terakhir.
8. Setelah snapshot audit tersimpan, file lama dihapus dari storage dan `DocumentRecord` lama dihapus dari database agar tidak tampil lagi di Page Dokumen Saya.
9. `VerificationHistory` yang berelasi ke `DocumentRecord` lama ikut terhapus oleh cascade, tetapi informasi audit penting tetap tersedia di `SecurityLog.metadata`.
10. Aktivitas tetap dicatat melalui `logActivity("DOCUMENT_UPLOADED", ...)` dengan metadata `uploadMode: "REUPLOAD_REPLACED_REJECTED"`, `replacedDocumentId`, dan `replacementSnapshot`.

### Aturan Anti-Duplikasi Upload

1. Satu user hanya boleh memiliki satu dokumen aktif per jenis/kode dokumen.
2. Jika dokumen dengan jenis/kode yang sama sudah pernah diupload, jenis dokumen tersebut tidak ditampilkan lagi pada select input upload normal.
3. Upload normal ke API ditolak jika user sudah memiliki `DocumentRecord` dengan `documentTypeId` yang sama.
4. Dokumen `REJECTED` harus diperbaiki melalui flow `Upload Ulang`, bukan membuat upload normal kedua untuk jenis dokumen yang sama.

### Status Awal

Semua dokumen yang baru diunggah masuk dengan `status: PENDING`.

---

## 4. Aturan Verifikasi Dokumen

### Workflow Verifikasi

1. ADMIN/STAFF buka daftar dokumen `PENDING`.
2. Klik **Approve** atau **Reject** (wajib isi `reviewNote` jika Reject).
3. Backend:
   - Update `DocumentRecord.status` ke `APPROVED` atau `REJECTED` dan mencatat `VerificationHistory` secara atomik dalam satu transaksi database.
   - Panggil `logActivity("DOCUMENT_APPROVED" | "DOCUMENT_REJECTED", ...)`.

### Aturan Self-Verification (Verifikasi Mandiri)

1. **STAFF**:
   - Hanya boleh melihat dan memverifikasi dokumen `PENDING` milik orang lain.
   - Dokumen pending milik STAFF yang bersangkutan akan secara otomatis disembunyikan/dikecualikan dari daftar pending dokumen verifikasi untuk STAFF tersebut.
   - STAFF dilarang keras dan ditolak oleh backend jika mencoba menyetujui (approve) atau menolak (reject) dokumen miliknya sendiri.
2. **ADMIN**:
   - Dapat melihat, mengakses, dan memverifikasi seluruh dokumen `PENDING` di sistem tanpa pengecualian, termasuk jika dokumen tersebut adalah milik dirinya sendiri.

### State Machine Status Dokumen

```
PENDING → APPROVED   (oleh ADMIN/STAFF)
PENDING → REJECTED   (oleh ADMIN/STAFF)
REJECTED → PENDING   (pegawai re-upload — create DocumentRecord baru)
```

> **Catatan:** Tidak ada transisi `APPROVED → REJECTED` langsung. Upload ulang hanya berlaku untuk dokumen `REJECTED`. Dokumen lama yang ditolak digantikan oleh `DocumentRecord` baru dan snapshot auditnya disimpan di `SecurityLog`.

### Integritas Verifikasi

- `VerificationHistory` tidak boleh dihapus langsung dari fitur verifikasi.
- Pada flow upload ulang dokumen `REJECTED`, `VerificationHistory` lama boleh ikut terhapus karena `DocumentRecord` lama diganti; ringkasan auditnya wajib sudah disalin ke `SecurityLog.metadata` sebelum penghapusan.
- Jika reviewer (user) dihapus, `reviewedById` di-set NULL tapi catatan tetap ada.

---

## 5. Aturan Hapus Dokumen

| Kondisi | STAFF/EMPLOYEE (milik sendiri) | ADMIN |
|---|---|---|
| Status PENDING | ✅ Boleh hapus | ✅ Boleh hapus |
| Status REJECTED | ✅ Boleh hapus | ✅ Boleh hapus |
| Status APPROVED | ❌ Tidak boleh hapus | ✅ Boleh hapus |

> **Aturan:** STAFF/EMPLOYEE tidak bisa menghapus dokumen personal yang sudah `APPROVED` — hanya ADMIN yang bisa menghapus dokumen `APPROVED`.

---

## 6. Aturan Dokumen Wajib (Mandatory)

- Jenis dokumen dengan `isMandatory = true` **wajib dimiliki** oleh pegawai yang masuk dalam target profesinya.
- Sistem harus menampilkan peringatan jika pegawai belum memiliki dokumen wajib yang terkait profesinya.
- Dokumen dengan `requiresExpiryDate = true` wajib dimonitor masa berlakunya.
- Page Rekapitulasi Arsip Dokumen Pegawai menghitung denominator progress dari pasangan user internal dengan kemampuan `EMPLOYEE` (`ADMIN`, `STAFF`, `EMPLOYEE`) dan jenis dokumen `isMandatory=true` yang berlaku untuk user tersebut.
- Kecocokan jenis dokumen terhadap pegawai mengikuti kriteria target `DocumentType`: status kepegawaian, kelompok pegawai, kelompok profesi, pangkat/golongan, dan unit kerja. Kriteria yang kosong berarti berlaku umum pada dimensi tersebut.
- Numerator `Sudah Upload` menghitung seluruh kewajiban yang sudah memiliki `DocumentRecord` terbaru, terlepas dari status `PENDING`, `APPROVED`, atau `REJECTED`.
- Metrik `Terverifikasi`, `Menunggu`, `Ditolak`, dan `Belum Upload` ditampilkan terpisah agar progress bar tidak ambigu.
- Export rekap arsip hanya dapat dilakukan `ADMIN`, mengikuti filter aktif, dibuat server-side, dan wajib mencatat `DATA_EXPORTED`.

---

## 7. Peringatan Masa Berlaku (Expiry Warning)

- Dokumen dengan `expiryDate` yang mendekati kedaluwarsa harus ditampilkan sebagai peringatan.
- **Threshold peringatan:** (belum ditentukan di PRD — implementor tentukan, misal: 30 hari sebelum kedaluwarsa).
- Ditampilkan di dashboard sebagai ringkasan.
- Notifikasi otomatis (WhatsApp/Email) belum diimplementasi — masuk daftar backlog.

---

## 8. Aturan Kepegawaian (Master Data)

### Hierarki Data Pegawai

```
EmploymentStatus (PNS, PPPK, Honorer)
  └── EmployeeGroup (Kelompok dalam status kepegawaian)

ProfessionGroup (Dokter, Perawat, Bidan, Tenaga Administrasi)
  └── EmployeePosition (Jabatan dalam kelompok profesi)

EmployeeRank    (Golongan/Pangkat — standalone)
Workplace       (Unit kerja — standalone)
```

### Aturan CRUD Pegawai

- Hanya `ADMIN` yang bisa membuat, mengedit, dan menghapus data pegawai.
- Setiap user hanya boleh memiliki satu role: `ADMIN`, `STAFF`, atau `EMPLOYEE`.
- Role disimpan langsung di `User.role` sebagai source of truth penyimpanan. Permission runtime dihitung secara bertingkat melalui helper capability RBAC.
- Hapus User → CASCADE hapus `DocumentRecord` miliknya.
- `VerificationHistory` dan `SecurityLog` **tidak ikut terhapus** — actorId/reviewedById di-set NULL.
- Import pegawai via CSV hanya bisa dilakukan oleh `ADMIN`.
- Import CSV pegawai memakai mode all-or-nothing: jika satu baris invalid, tidak ada user yang dibuat.
- Template import CSV disediakan dari `/api/v1/users/import/template`.
- Import memvalidasi header, duplikasi `employeeId`/`nik`/`email`, konflik database, role, format tanggal, relasi master data berdasarkan nama, dan urutan TMT.
- Export CSV pegawai hanya bisa dilakukan oleh `ADMIN`, mengikuti filter aktif, dan tidak boleh menyertakan `passwordHash`.
- Biodata pegawai menyimpan tempat lahir (`birthPlace`) dan tanggal lahir (`birthDate`). Keduanya dapat diisi oleh ADMIN saat membuat/mengedit pegawai dan oleh user melalui profil mandiri.
- Daftar dan export pegawai dapat difilter berdasarkan pencarian nama/NIP/NIK/email, kategori kepegawaian, unit kerja, TMT awal, TMT akhir/kontrak, rentang usia pegawai saat ini untuk kebutuhan masa pensiun, status pernikahan, dan pendidikan terakhir. Filter TMT memakai rentang dari tanggal yang dipilih sampai hari ini.

### Aturan TMT / Masa Kontrak

- Data TMT disimpan pada `User.hasTmt`, `User.tmtStartDate`, dan `User.tmtEndDate`.
- Hanya `ADMIN` yang bisa mengatur data TMT melalui halaman tambah/edit pegawai.
- Jika `hasTmt = false`, `tmtStartDate` dan `tmtEndDate` boleh kosong dan tidak ditampilkan pada profil pegawai.
- Jika `hasTmt = true`, `tmtStartDate` menandai awal TMT/kontrak dan `tmtEndDate` bersifat opsional.
- Jika `tmtStartDate` diisi dan `tmtEndDate` kosong, profil menampilkan label `TMT Awal CPNS` untuk pegawai tetap/ASN.
- Jika `tmtStartDate` dan `tmtEndDate` sama-sama diisi, profil menampilkan label `Masa Kontrak` untuk pegawai kontrak seperti BLUD, PPPK, dan sejenisnya.
- Jika `tmtStartDate` dan `tmtEndDate` sama-sama diisi, `tmtEndDate` tidak boleh lebih awal dari `tmtStartDate`.
- Profil pegawai hanya menampilkan informasi TMT ketika `hasTmt = true`.

---

## 9. Aturan Security Log

Aksi berikut **WAJIB** dipanggil `logActivity()`:

| Event Type | Kapan |
|---|---|
| `USER_LOGIN_SUCCESS` | Login berhasil |
| `USER_LOGIN_FAILED` | Login gagal |
| `DOCUMENT_UPLOADED` | Dokumen berhasil diupload |
| `DOCUMENT_APPROVED` | Dokumen diapprove |
| `DOCUMENT_REJECTED` | Dokumen direject |
| `DOCUMENT_DELETED` | Dokumen dihapus |
| `USER_CREATED` | Pegawai baru dibuat |
| `USER_UPDATED` | Data pegawai diperbarui |
| `USER_DELETED` | Pegawai dihapus |
| `USERS_IMPORTED` | Pegawai diimport secara bulk dari CSV |
| `DATA_EXPORTED` | Data diekspor (CSV, laporan) |

### Status Audit

1. Nilai status audit resmi hanya `success` dan `failed`.
2. Semua aksi yang berhasil secara fungsional wajib dicatat dengan `status: "success"`.
3. Aksi yang benar-benar gagal, seperti login gagal, wajib dicatat dengan `status: "failed"`.
4. `logActivity()` menormalisasi variasi status lama seperti `SUCCESS`, `sukses`, `FAILED`, atau `gagal` sebelum menyimpan data.
5. API Security Logs juga menormalisasi status sebelum mengirim response agar UI selalu menampilkan label konsisten: `Sukses` untuk `success` dan `Gagal` untuk `failed`.

---

## 10. Aturan File Storage

### Naming Convention File Storage

Format: `{NIP}_{KATEGORI-ARSIP}_{KODE-JENIS-DOKUMEN}_{YYYYMMDD}_{VERSI}.{ext}`

Contoh:
```
198501012010011001_UTAMA_KTP_20260115_v1.pdf
198501012010011001_PROFESI_STR-MEDIS_20260115_v1.pdf
198501012010011001_PROFESI_STR-MEDIS_20260615_v2.pdf   # re-upload revisi
```

- `KATEGORI-ARSIP` diambil dari `DocumentType.archiveCategory`
- `KODE-JENIS-DOKUMEN` diambil dari `DocumentType.code`
- `fileName` (nama asli dari pegawai) tetap ditampilkan di UI
- `filePath` disimpan di database dalam format `<KODE-JENIS-DOKUMEN>/<nama-file-terstandarkan>`, contoh `KK/198501012010011001_UTAMA_KK_20260115_v1.pdf`

### Aturan Nama File Umum

1. Tidak boleh ada spasi — ganti dengan `-`
2. Hanya karakter `[A-Za-z0-9._-]`
3. Ekstensi huruf kecil
4. Maksimal 150 karakter
5. Dibuat via fungsi `slugifyFileName()` di `src/lib/`

### Aturan Storage Bridge

1. Semua upload, baca/preview/download, hapus file, URL file, dan pembuatan folder wajib melalui `getStorageProvider()`.
2. Provider aktif ditentukan dari `STORAGE_PROVIDER`, saat ini mendukung `local` dan `supabase`.
3. `DocumentRecord.filePath` tetap menyimpan path relatif provider-agnostic, bukan URL public permanen.
4. Endpoint download dokumen dan view avatar tidak boleh membaca filesystem langsung; keduanya wajib memakai `getStorageProvider().getFile()`.
5. Secret Supabase Storage hanya boleh dipakai server-side melalui `SUPABASE_SERVICE_ROLE_KEY`, tidak boleh memakai prefix `NEXT_PUBLIC_`.
6. Jika berpindah dari local ke Supabase, file lama harus dimigrasikan ke bucket dengan object path yang sama seperti `filePath` database.

---

## 11. Aturan Profesi → Dokumen

- Satu `ProfessionGroup` bisa memiliki banyak `DocumentType` yang dipersyaratkan (via tabel `DocumentTypeProfession`).
- Satu `DocumentType` bisa dipersyaratkan untuk banyak `ProfessionGroup`.
- Dokumen `archiveCategory: PROFESI` di-assign ke `ProfessionGroup` melalui tabel junction `DocumentTypeProfession`.
- Pegawai yang tidak memiliki `professionGroupId` tidak dipersyaratkan memiliki dokumen Arsip Profesi.
