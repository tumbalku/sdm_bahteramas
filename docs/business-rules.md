# Business Rules — SMDP Portal

## 1. RBAC — Role & Permission

### Role Definitions

| Role | Deskripsi |
|---|---|
| `ADMIN` | Administrator sistem — akses penuh ke semua fitur |
| `STAFF` | Staf — fokus pada verifikasi dokumen dan melihat data |
| `EMPLOYEE` | Pegawai — mengelola dokumen dan profil milik sendiri saja |

### Permission Matrix

| Fitur / Aksi | ADMIN | STAFF | EMPLOYEE |
|---|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ |
| Lihat dashboard | ✅ | ✅ | ✅ (ringkasan personal) |
| Upload dokumen (milik sendiri) | ✅ | ❌ | ✅ |
| Lihat dokumen milik sendiri | ✅ | ❌ | ✅ |
| Lihat semua dokumen | ✅ | ✅ | ❌ |
| Hapus dokumen (milik sendiri, bukan APPROVED) | ✅ | ❌ | ✅ |
| Hapus dokumen siapapun | ✅ | ❌ | ❌ |
| Approve/Reject dokumen | ✅ | ✅ | ❌ |
| Download dokumen | ✅ | ✅ | ✅ (milik sendiri) |
| Kelola jenis dokumen (master) | ✅ | ❌ | ❌ |
| CRUD pegawai | ✅ | ❌ | ❌ |
| Import/Export CSV pegawai | ✅ | ❌ | ❌ |
| Kelola profil (mandiri) | ✅ | ✅ | ✅ |
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

---

## 3. Aturan Upload Dokumen

### Validasi File

| Aturan | Detail |
|---|---|
| Format file | Ditentukan per jenis dokumen di `DocumentType.allowedFormats` (contoh: `"pdf,jpg,png"`) |
| Ukuran maksimum | Ditentukan per jenis dokumen di `DocumentType.maxSizeMb` |
| Tanggal kedaluwarsa | Wajib diisi jika `DocumentType.requiresExpiryDate = true` |
| Tanggal terbit | Opsional — ditampilkan jika ada |

### Workflow Upload

1. Pegawai pilih jenis dokumen → sistem otomatis menunjukkan kategori arsipnya.
2. Pegawai isi `issueDate` / `expiryDate` (jika `requiresExpiryDate = true`).
3. Pegawai pilih file → kirim `POST /api/v1/documents/upload`.
4. Backend:
   - Validasi format dan ukuran file.
   - Simpan file via `getStorageProvider()`.
   - Generate nama file standar via `generateStorageFileName()`.
   - Simpan file di folder storage sesuai kode jenis dokumen, contoh `KK/{nama-file}`.
   - Simpan `DocumentRecord` dengan `status: PENDING`.
   - Panggil `logActivity("DOCUMENT_UPLOADED", ...)`.

### Status Awal

Semua dokumen yang baru diunggah masuk dengan `status: PENDING`.

---

## 4. Aturan Verifikasi Dokumen

### Workflow Verifikasi

1. ADMIN/STAFF buka daftar dokumen `PENDING`.
2. Klik **Approve** atau **Reject** (wajib isi `reviewNote` jika Reject).
3. Backend:
   - Update `DocumentRecord.status` ke `APPROVED` atau `REJECTED`.
   - Tambah baris baru di `VerificationHistory` (log riwayat).
   - Panggil `logActivity("DOCUMENT_APPROVED" | "DOCUMENT_REJECTED", ...)`.

### State Machine Status Dokumen

```
PENDING → APPROVED   (oleh ADMIN/STAFF)
PENDING → REJECTED   (oleh ADMIN/STAFF)
REJECTED → PENDING   (pegawai re-upload — create DocumentRecord baru)
```

> **Catatan:** Tidak ada transisi `APPROVED → REJECTED` langsung. Untuk merevisi dokumen yang sudah approved, pegawai harus upload ulang (DocumentRecord baru), dan yang lama tetap tersimpan di riwayat.

### Integritas Verifikasi

- `VerificationHistory` tidak boleh dihapus.
- Jika reviewer (user) dihapus, `reviewedById` di-set NULL tapi catatan tetap ada.

---

## 5. Aturan Hapus Dokumen

| Kondisi | EMPLOYEE (milik sendiri) | ADMIN |
|---|---|---|
| Status PENDING | ✅ Boleh hapus | ✅ Boleh hapus |
| Status REJECTED | ✅ Boleh hapus | ✅ Boleh hapus |
| Status APPROVED | ❌ Tidak boleh hapus | ✅ Boleh hapus |

> **Aturan:** EMPLOYEE tidak bisa menghapus dokumen yang sudah `APPROVED` — hanya ADMIN yang bisa.

---

## 6. Aturan Dokumen Wajib (Mandatory)

- Jenis dokumen dengan `isMandatory = true` **wajib dimiliki** oleh pegawai yang masuk dalam target profesinya.
- Sistem harus menampilkan peringatan jika pegawai belum memiliki dokumen wajib yang terkait profesinya.
- Dokumen dengan `requiresExpiryDate = true` wajib dimonitor masa berlakunya.

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
- Hapus User → CASCADE hapus `UserRole` dan `DocumentRecord` miliknya.
- `VerificationHistory` dan `SecurityLog` **tidak ikut terhapus** — actorId/reviewedById di-set NULL.
- Import pegawai via CSV hanya bisa dilakukan oleh `ADMIN`.

---

## 9. Aturan Security Log

Aksi berikut **WAJIB** dipanggil `logActivity()`:

| Event Type | Kapan |
|---|---|
| `USER_LOGIN` | Login berhasil |
| `USER_LOGIN_FAILED` | Login gagal |
| `DOCUMENT_UPLOADED` | Dokumen berhasil diupload |
| `DOCUMENT_APPROVED` | Dokumen diapprove |
| `DOCUMENT_REJECTED` | Dokumen direject |
| `DOCUMENT_DELETED` | Dokumen dihapus |
| `USER_CREATED` | Pegawai baru dibuat |
| `USER_UPDATED` | Data pegawai diperbarui |
| `USER_DELETED` | Pegawai dihapus |
| `DATA_EXPORTED` | Data diekspor (CSV, laporan) |

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

---

## 11. Aturan Profesi → Dokumen

- Satu `ProfessionGroup` bisa memiliki banyak `DocumentType` yang dipersyaratkan (via tabel `DocumentTypeProfession`).
- Satu `DocumentType` bisa dipersyaratkan untuk banyak `ProfessionGroup`.
- Dokumen `archiveCategory: PROFESI` di-assign ke `ProfessionGroup` melalui tabel junction `DocumentTypeProfession`.
- Pegawai yang tidak memiliki `professionGroupId` tidak dipersyaratkan memiliki dokumen Arsip Profesi.
