# Database — SMDP Portal

## 1. Ringkasan Prisma Schema

- **Database:** PostgreSQL (desain portabel ke MySQL)
- **ORM:** Prisma
- **File schema:** `prisma/schema.prisma`
- **Seeding:** `prisma/seed.ts`

**Prinsip desain:**
- Enum digunakan untuk nilai terbatas (Role, Status, Kategori)
- Semua tabel utama memiliki `createdAt`/`updatedAt`
- Index ditambahkan di kolom foreign key dan kolom yang sering difilter
- `allowedFormats` disimpan sebagai string `"pdf,jpg,png"` (portabel) — parsing via `parseAllowedFormats()` di `src/lib/`

---

## 2. Enum

### `Role`
| Nilai | Deskripsi |
|---|---|
| `ADMIN` | Administrator — akses penuh |
| `STAFF` | Staf — verifikasi dokumen, lihat data |
| `EMPLOYEE` | Pegawai biasa — upload dokumen milik sendiri |

### `DocumentArchiveCategory`
| Nilai | Deskripsi | Untuk |
|---|---|---|
| `UTAMA` | Dokumen identitas dasar, wajib | Semua pegawai |
| `KONDISIONAL` | Dokumen pendukung opsional | Opsional |
| `PROFESI` | Dokumen izin praktik | Tenaga medis/kesehatan |

### `DocumentStatus`
| Nilai | Deskripsi |
|---|---|
| `PENDING` | Baru diupload, menunggu verifikasi |
| `APPROVED` | Disetujui oleh ADMIN/STAFF |
| `REJECTED` | Ditolak oleh ADMIN/STAFF |

---

## 3. Seluruh Entity (Model)

### `User`
Data utama pegawai + akun login.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | ID internal |
| `employeeId` | String UNIQUE | NIP pegawai |
| `email` | String UNIQUE | Email login |
| `passwordHash` | String | Hash bcryptjs |
| `name` | String | Nama lengkap |
| `role` | Role | Role utama (default: EMPLOYEE) |
| `gender` | String? | Opsional |
| `birthDate` | DateTime? | Opsional |
| `employmentStatusId` | String? | FK → EmploymentStatus |
| `employeeGroupId` | String? | FK → EmployeeGroup |
| `professionGroupId` | String? | FK → ProfessionGroup |
| `employeePositionId` | String? | FK → EmployeePosition |
| `employeeRankId` | String? | FK → EmployeeRank |
| `workplaceId` | String? | FK → Workplace |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto update |

**Index:** `professionGroupId`

---

### `UserRole`
Mendukung multi-role per user (satu user bisa punya lebih dari satu role).

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `userId` | String FK | → User (onDelete: Cascade) |
| `role` | Role | |

**Constraint:** `@@unique([userId, role])` — kombinasi user+role unik

---

### `DocumentType`
Master jenis dokumen. Menentukan kategori arsip dan target profesi.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `code` | String UNIQUE | Kode singkat, contoh: `STR-MEDIS` |
| `name` | String UNIQUE | Nama lengkap jenis dokumen |
| `description` | String? | Deskripsi opsional |
| `archiveCategory` | DocumentArchiveCategory | UTAMA / KONDISIONAL / PROFESI |
| `isMandatory` | Boolean | Apakah wajib dimiliki (default: false) |
| `requiresExpiryDate` | Boolean | Apakah perlu tanggal kedaluwarsa (default: false) |
| `allowedFormats` | String | Format file diizinkan, contoh: `"pdf,jpg,png"` |
| `maxSizeMb` | Int | Ukuran file maksimum (MB) |
| `icon` | String? | Nama ikon opsional |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto update |

**Index:** `archiveCategory`

---

### `DocumentTypeProfession`
Tabel relasi M:N antara `DocumentType` dan `ProfessionGroup`.
Menentukan jenis dokumen mana yang dipersyaratkan untuk profesi tertentu.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `documentTypeId` | String FK | → DocumentType (onDelete: Cascade) |
| `professionGroupId` | String FK | → ProfessionGroup (onDelete: Cascade) |

**Constraint:** `@@unique([documentTypeId, professionGroupId])`

---

### `DocumentRecord`
Berkas dokumen yang diunggah oleh pegawai. Menyimpan status terkini langsung (tidak perlu query riwayat).

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `ownerId` | String FK | → User (onDelete: Cascade) |
| `documentTypeId` | String FK | → DocumentType |
| `status` | DocumentStatus | Status terkini (default: PENDING) |
| `fileName` | String | Nama asli file dari pegawai (ditampilkan di UI) |
| `filePath` | String | Nama file terstandarisasi di storage |
| `issueDate` | DateTime? | Tanggal terbit dokumen |
| `expiryDate` | DateTime? | Tanggal kedaluwarsa |
| `uploadedAt` | DateTime | Auto (waktu upload) |
| `updatedAt` | DateTime | Auto update |

**Index:** `ownerId`, `documentTypeId`, `status`

> **Penting:** `filePath` menggunakan format standar `{NIP}_{KATEGORI}_{KODE}_{YYYYMMDD}_{VERSI}.{ext}` — dibuat oleh fungsi `generateStorageFileName()` di `documents/service.ts`.

---

### `VerificationHistory`
Log riwayat verifikasi dokumen. Berfungsi sebagai **audit log** — bukan sumber status terkini (status terkini ada di `DocumentRecord.status`).

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `documentRecordId` | String FK | → DocumentRecord (onDelete: Cascade) |
| `status` | DocumentStatus | Keputusan pada langkah ini |
| `reviewedById` | String? FK | → User (onDelete: SetNull) |
| `reviewNote` | String? | Catatan alasan approve/reject |
| `reviewedAt` | DateTime | Auto |

**Index:** `documentRecordId`

> **Tidak boleh dihapus** — jika user reviewer dihapus, `reviewedById` di-set NULL (SetNull).

---

### `SecurityLog`
Audit trail seluruh aktivitas sensitif aplikasi.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `timestamp` | DateTime | Auto |
| `actorId` | String? FK | → User (onDelete: SetNull) |
| `actorName` | String | Nama aktor saat kejadian (tidak berubah walau user diedit) |
| `actorRole` | String | Role aktor saat kejadian |
| `eventType` | String | Jenis event (contoh: `DOCUMENT_UPLOADED`) |
| `resource` | String | Resource yang diakses |
| `ipAddress` | String? | IP address aktor |
| `status` | String | Hasil aksi (success/failed) |
| `metadata` | Json? | Data konteks tambahan |

**Index:** `timestamp`, `eventType`

> **Tidak boleh dihapus** — jika user actor dihapus, `actorId` di-set NULL (SetNull), tapi `actorName` dan `actorRole` tetap tersimpan.

---

## 4. Master Data Kepegawaian

### `EmploymentStatus`
Status kepegawaian (PNS, PPPK, Honorer, dll).

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `name` | String UNIQUE | Nama status |

---

### `EmployeeGroup`
Kelompok pegawai — sub-kategori dari EmploymentStatus.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `name` | String | |
| `employmentStatusId` | String FK | → EmploymentStatus |

**Constraint:** `@@unique([name, employmentStatusId])`

---

### `ProfessionGroup`
Kelompok profesi (Dokter, Perawat, Bidan, Tenaga Administrasi, dll).
Menentukan jenis dokumen Arsip Profesi yang dipersyaratkan.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `name` | String UNIQUE | Nama kelompok profesi |

---

### `EmployeePosition`
Jabatan pegawai — sub-kategori dari ProfessionGroup.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `name` | String | |
| `professionGroupId` | String FK | → ProfessionGroup |

**Constraint:** `@@unique([name, professionGroupId])`

---

### `EmployeeRank`
Pangkat/golongan pegawai.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `name` | String UNIQUE | |

---

### `Workplace`
Unit kerja / satuan kerja pegawai.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) PK | |
| `name` | String UNIQUE | |

---

## 5. ERD (Entity Relationship)

```mermaid
erDiagram
    USER ||--o{ USER_ROLE : has
    USER ||--o{ DOCUMENT_RECORD : owns
    USER ||--o{ VERIFICATION_HISTORY : reviews
    USER ||--o{ SECURITY_LOG : acts
    DOCUMENT_TYPE ||--o{ DOCUMENT_RECORD : categorizes
    DOCUMENT_TYPE ||--o{ DOCUMENT_TYPE_PROFESSION : targets
    PROFESSION_GROUP ||--o{ DOCUMENT_TYPE_PROFESSION : targeted_by
    DOCUMENT_RECORD ||--o{ VERIFICATION_HISTORY : has_history
    EMPLOYMENT_STATUS ||--o{ EMPLOYEE_GROUP : groups
    EMPLOYMENT_STATUS ||--o{ USER : classifies
    EMPLOYEE_GROUP ||--o{ USER : classifies
    PROFESSION_GROUP ||--o{ EMPLOYEE_POSITION : groups
    PROFESSION_GROUP ||--o{ USER : classifies
    EMPLOYEE_POSITION ||--o{ USER : classifies
    EMPLOYEE_RANK ||--o{ USER : classifies
    WORKPLACE ||--o{ USER : classifies
```

---

## 6. Relationship Summary

| Dari | Ke | Tipe | Keterangan |
|---|---|---|---|
| User → UserRole | 1:N | Has many | Multi-role per user |
| User → DocumentRecord | 1:N | Has many | Dokumen milik pegawai |
| User → VerificationHistory | 1:N | Has many | Sebagai reviewer |
| User → SecurityLog | 1:N | Has many | Sebagai aktor |
| DocumentType → DocumentRecord | 1:N | Has many | Jenis dokumen → berkas |
| DocumentType → DocumentTypeProfession | M:N | Via junction | Target profesi |
| ProfessionGroup → DocumentTypeProfession | M:N | Via junction | Profesi → jenis dokumen |
| DocumentRecord → VerificationHistory | 1:N | Has many | Riwayat verifikasi |
| EmploymentStatus → EmployeeGroup | 1:N | Has many | |
| ProfessionGroup → EmployeePosition | 1:N | Has many | |

---

## 7. Cascade & Constraint Penting

| Aksi | Efek |
|---|---|
| Hapus `User` | → CASCADE: `UserRole`, `DocumentRecord` ikut terhapus |
| Hapus `User` reviewer | → SET NULL: `VerificationHistory.reviewedById` menjadi NULL |
| Hapus `User` aktor log | → SET NULL: `SecurityLog.actorId` menjadi NULL |
| Hapus `DocumentRecord` | → CASCADE: `VerificationHistory` ikut terhapus |
| Hapus `DocumentType` | → CASCADE: `DocumentTypeProfession` ikut terhapus |

> **Rule:** `VerificationHistory` dan `SecurityLog` **tidak boleh dihapus secara langsung** — integritas audit harus terjaga.

---

## 8. Fungsi Helper Database

| Fungsi | Lokasi | Keterangan |
|---|---|---|
| `parseAllowedFormats(str)` | `src/lib/` | Parsing `"pdf,jpg,png"` → `["pdf", "jpg", "png"]` |
| `generateStorageFileName()` | `src/modules/documents/service.ts` | Generate nama file standar |
| `slugifyFileName()` | `src/lib/` | Sanitasi nama file (no spasi, hanya `[A-Za-z0-9._-]`) |
