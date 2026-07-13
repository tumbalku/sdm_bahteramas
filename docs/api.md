# API Documentation — SMDP Portal

## 1. Konvensi Umum

- **Base URL:** `/api/v1/`
- **Format:** REST (JSON over HTTP)
- **Autentikasi:** Session-based via NextAuth (cookie `next-auth.session-token`)
- **Validasi:** Semua request body divalidasi dengan Zod sebelum diproses
- **Error Format:**
```json
{
  "error": "Pesan error yang jelas",
  "details": { }
}
```
- **Success Format:**
```json
{
  "data": { },
  "message": "Optional success message"
}
```

---

## 2. Authentication

### `POST /api/v1/auth/verify-password`
Verifikasi ulang password user yang sedang login, digunakan untuk aksi sensitif.

- **Auth:** Required (semua role)
- **Body:**
```json
{
  "password": "plaintext-password"
}
```
- **Response:** `{ "success": true, "message": "..." }` jika password cocok.

### `POST /api/v1/auth/signin`
> Ditangani oleh NextAuth — gunakan `signIn()` dari `next-auth/react`.

**Body (Credentials):**
```json
{
  "email": "user@example.com",
  "password": "plaintext-password"
}
```

**Response (sesi berhasil):** Cookie `next-auth.session-token` di-set otomatis.

**Session payload:**
```json
{
  "id": "clx...",
  "email": "user@example.com",
  "name": "Nama Pegawai",
  "role": "EMPLOYEE"
}
```

### `GET /api/auth/session`
Ambil sesi aktif. Response: session object atau `{}` jika tidak login.

> **Canonical NextAuth endpoint:** NextAuth memakai endpoint standar `/api/auth/*`.
> Endpoint `/api/v1/auth/*` tidak lagi dipakai untuk handler NextAuth agar tidak ada duplikasi route. Endpoint v1 yang tersisa hanya endpoint aplikasi seperti `/api/v1/auth/verify-password`.

### `POST /api/v1/auth/signout`
Logout. Hapus cookie sesi.

---

## 3. Profile

### `GET /api/v1/profile`
Ambil profil user yang sedang login.

- **Auth:** Required (semua role)
- **Response:**
```json
{
  "data": {
    "id": "clx...",
    "employeeId": "198501012010011001",
    "email": "budi@example.com",
    "name": "Budi Santoso",
    "role": "EMPLOYEE",
    "gender": "L",
    "birthPlace": "Kendari",
    "birthDate": "1985-01-01T00:00:00.000Z",
    "hasTmt": true,
    "tmtStartDate": "2026-01-01T00:00:00.000Z",
    "tmtEndDate": "2026-12-31T00:00:00.000Z",
    "employmentStatus": { "id": "...", "name": "PNS" },
    "employeeGroup": { "id": "...", "name": "Kelompok A" },
    "professionGroup": { "id": "...", "name": "Dokter" },
    "employeePosition": { "id": "...", "name": "Dokter Umum" },
    "employeeRank": { "id": "...", "name": "III/c" },
    "workplace": { "id": "...", "name": "Poli Umum" }
  }
}
```

### `PUT /api/v1/profile`
Update profil mandiri.

- **Auth:** Required (semua role)
- **Body (Zod validated):**
```json
{
  "name": "string (optional)",
  "gender": "string (optional)",
  "birthPlace": "string (optional)",
  "birthDate": "ISO date string (optional)"
}
```
- **Note:** `email`, `employeeId`, `role` tidak bisa diubah via endpoint ini.

### `PUT /api/v1/profile/password`
Ganti password mandiri.

- **Auth:** Required (semua role)
- **Body:** password lama + password baru sesuai schema modul profile.
- **Log:** `logActivity()` untuk perubahan password.

### `POST /api/v1/profile/avatar`
Upload avatar user yang sedang login.

- **Auth:** Required (semua role)
- **Content-Type:** `multipart/form-data`
- **Body:** `file` (`image/jpeg`, `image/png`, atau `image/webp`)
- **Max size:** dari `SystemSetting.MAX_AVATAR_UPLOAD_SIZE_KB`, fallback `200`.

### `GET /api/v1/profile/avatar/view`
Ambil file avatar dari storage provider.

- **Auth:** Required (semua role)
- **Query Params:** `file`
- **Behavior:** membaca file melalui storage bridge aktif (`local` atau `supabase`), bukan akses filesystem langsung.

### `GET /api/v1/profile/export-pdf`
Export profil user yang sedang login ke PDF.

- **Auth:** Required (semua role)
- **Response:** file `application/pdf`
- **PDF content:** identitas, biodata, informasi kepegawaian, dan ringkasan dokumen relevan milik user login.
- **Behavior:** user hanya dapat mengekspor profil dirinya sendiri; endpoint tidak menerima `userId` dari client.
- **Log:** `DATA_EXPORTED` dengan metadata `scope: OWN_PROFILE_PDF`.

---

## 4. Document Types

### `GET /api/v1/document-types`
Ambil semua jenis dokumen.

- **Auth:** Public (tidak butuh login — untuk kebutuhan form upload)
- **Query Params:**
  - `category`: `UTAMA` | `KONDISIONAL` | `PROFESI` (opsional)
  - `professionGroupId`: string (opsional — filter dokumen untuk profesi tertentu)
- **Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "code": "STR-MEDIS",
      "name": "Surat Tanda Registrasi Medis",
      "description": "...",
      "archiveCategory": "PROFESI",
      "isMandatory": true,
      "requiresExpiryDate": true,
      "requiresIssueDate": true,
      "requiresDocumentNumber": true,
      "allowedFormats": "pdf,jpg,png",
      "maxSizeMb": 5,
      "icon": "file-medical",
      "targetProfessions": [
        { "id": "...", "name": "Dokter" }
      ]
    }
  ]
}
```

### `POST /api/v1/document-types`
Buat jenis dokumen baru.

- **Auth:** `ADMIN` only
- **Body (Zod validated):**
```json
{
  "code": "STR-MEDIS",
  "name": "Surat Tanda Registrasi Medis",
  "description": "optional",
  "archiveCategory": "PROFESI",
  "isMandatory": true,
  "requiresExpiryDate": true,
  "requiresIssueDate": true,
  "requiresDocumentNumber": true,
  "allowedFormats": "pdf,jpg,png",
  "maxSizeMb": 5,
  "icon": "optional",
  "professionGroupIds": ["clx...", "clx..."]
}
```
- **Response:** `201 Created` dengan data jenis dokumen baru.

### `PATCH /api/v1/document-types/[id]`
Update jenis dokumen.
- **Auth:** `ADMIN` only

### `DELETE /api/v1/document-types/[id]`
Hapus jenis dokumen.
- **Auth:** `ADMIN` only
- **Note:** Cascade delete `DocumentTypeProfession`.

### `GET /api/v1/document-types/archives`
Ambil rekapitulasi arsip dokumen wajib seluruh pegawai.

- **Auth:** `ADMIN`
- **Query Params:** `search`, `archiveCategory`, `documentTypeId`, `status`, `uploadStatus`, `employmentStatusId`, `employeeGroupId`, `professionGroupId`, `employeePositionId`, `employeeRankId`, `workplaceId`, `tmtStartDate`, `tmtEndDate`, `retirementAgeMin`, `retirementAgeMax`, `maritalStatus`, `lastEducation`, `issueDateFrom`, `issueDateTo`, `expiryDateFrom`, `expiryDateTo`, `uploadedAtFrom`, `uploadedAtTo`.
- **Behavior:** denominator progress dihitung dari pasangan user internal dengan kemampuan `EMPLOYEE` (`ADMIN`, `STAFF`, `EMPLOYEE`) dan `DocumentType.isMandatory=true` yang berlaku sesuai target status/golongan/profesi/pangkat/unit kerja; dokumen yang sudah ada dihitung sebagai `Sudah Upload`, dan pasangan tanpa dokumen dihitung `Belum Upload`. Mode `Sudah Upload` menampilkan `DocumentRecord` aktual dari semua role internal tersebut.
- **Response:** `{ data: { rows, stats, generatedAt, filters } }`.

### `GET /api/v1/document-types/archives/export`
Export rekapitulasi arsip dokumen wajib ke file CSV.

- **Auth:** `ADMIN`
- **Query Params:** sama dengan `GET /api/v1/document-types/archives`.
- **Response:** file `text/csv`.
- **Log:** `DATA_EXPORTED` dengan metadata filter, format, jumlah baris, dan statistik rekap.

---

## 5. Documents

### `GET /api/v1/documents`
Ambil daftar dokumen.

- **Auth:** Required
- **Query Params:**
  - `archiveCategory`: `UTAMA` | `KONDISIONAL` | `PROFESI` (opsional)
  - `status`: `PENDING` | `APPROVED` | `REJECTED` (opsional)
  - `ownerId`: string (opsional — hanya efektif untuk `ADMIN`; role lain tetap dipaksa ke dokumen milik sendiri)
  - `page`, `pageSize`: number (opsional; jika dikirim repository memakai pagination dan menghitung `total`)
- **Behavior:**
  - Default endpoint ini adalah konteks Dokumen Saya: `ADMIN`, `STAFF`, dan `EMPLOYEE` melihat dokumen personal milik sendiri.
  - `ADMIN` dapat memakai `ownerId` eksplisit untuk melihat dokumen user lain pada konteks admin-wide.
  - `STAFF` dan `EMPLOYEE` tetap dipaksa ke dokumen milik sendiri walaupun mengirim `ownerId` user lain.
- **Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "ownerId": "clx...",
      "documentType": {
        "id": "clx...",
        "code": "KTP",
        "name": "Kartu Tanda Penduduk",
        "archiveCategory": "UTAMA"
      },
      "status": "PENDING",
      "fileName": "KTP_Budi.pdf",
      "documentNumber": "800/123/RSUD/2026",
      "issueDate": "2026-01-15T00:00:00.000Z",
      "expiryDate": null,
      "uploadedAt": "2026-06-27T08:00:00.000Z"
    }
  ]
}
```

### `POST /api/v1/documents/upload`
Upload dokumen baru.

- **Auth:** semua role internal (`ADMIN`, `STAFF`, `EMPLOYEE`) untuk upload dokumen milik sendiri.
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```
  file: <file binary>
  documentTypeId: "clx..."
  replaceDocumentId: "clx..." (opsional — hanya untuk upload ulang dokumen REJECTED milik sendiri)
  documentNumber: "800/123/RSUD/2026" (required jika requiresDocumentNumber=true)
  issueDate: "2026-01-15" (required jika requiresIssueDate=true)
  expiryDate: "2028-01-15" (required jika requiresExpiryDate=true)
  ownerId: "clx..." (opsional; pada implementasi saat ini route upload memakai user login sebagai owner)
  ```
- **Validation:**
  - Format file harus sesuai `DocumentType.allowedFormats`
  - Ukuran file ≤ `DocumentType.maxSizeMb`
  - `documentNumber` wajib jika `requiresDocumentNumber = true`
  - `issueDate` wajib jika `requiresIssueDate = true`
  - `expiryDate` wajib jika `requiresExpiryDate = true`
  - Upload normal ditolak jika user sudah memiliki dokumen dengan `documentTypeId` yang sama.
  - `replaceDocumentId` jika diisi wajib merujuk ke dokumen milik user yang login, status `REJECTED`, dan jenis dokumennya sama.
- **Upload ulang dokumen ditolak:** membuat `DocumentRecord` baru dengan status `PENDING`, menyalin snapshot audit dokumen lama ke `SecurityLog.metadata`, lalu menghapus file dan record dokumen lama agar tidak tampil lagi.
- **Response:** `201 Created` dengan data `DocumentRecord`.

### `GET /api/v1/documents/[id]`
Detail satu dokumen.

- **Auth:** `ADMIN` atau pemilik dokumen
- **Behavior:**
  - `ADMIN` dapat melihat detail dokumen siapapun.
  - `STAFF` dan `EMPLOYEE` hanya dapat melihat detail dokumen milik sendiri.
- **Response:** Data lengkap dokumen, pemilik, jenis dokumen, dan `verificationHistories` terakhir.

```json
{
  "id": "clx...",
  "ownerId": "clx...",
  "documentTypeId": "clx...",
  "status": "PENDING",
  "fileName": "KTP_Budi.pdf",
  "filePath": "KTP/198501012010011001_UTAMA_KTP_20260702_v1.pdf",
  "documentNumber": "800/123/RSUD/2026",
  "issueDate": "2026-01-15T00:00:00.000Z",
  "expiryDate": null,
  "uploadedAt": "2026-07-02T08:00:00.000Z",
  "owner": {
    "id": "clx...",
    "name": "Budi Santoso",
    "employeeId": "198501012010011001"
  },
  "documentType": {
    "id": "clx...",
    "code": "KTP",
    "name": "Kartu Tanda Penduduk",
    "archiveCategory": "UTAMA"
  },
  "verificationHistories": [
    {
      "status": "REJECTED",
      "reviewNote": "File tidak terbaca",
      "reviewedAt": "2026-07-02T09:00:00.000Z",
      "reviewedBy": { "name": "Verifikator" }
    }
  ]
}
```

### `DELETE /api/v1/documents/[id]`
Hapus dokumen.

- **Auth:**
  - `STAFF`/`EMPLOYEE`: hanya milik sendiri dan status bukan `APPROVED`
  - `ADMIN`: dokumen siapapun
- **Response:** `204 No Content`

### `GET /api/v1/documents/download`
Unduh file dokumen.

- **Auth:** `ADMIN` atau pemilik dokumen
- **Query Params:**
  - `file`: path relatif file di storage, sesuai `DocumentRecord.filePath`
- **Response:** File stream (Content-Type sesuai format file)
- **Behavior:** hanya `ADMIN` yang dapat mengunduh file milik user lain; `STAFF` dan `EMPLOYEE` hanya dapat mengunduh file milik sendiri. File dibaca melalui storage bridge aktif (`local` atau `supabase`).

---

## 6. Users

### `GET /api/v1/users`
Daftar semua pegawai.

- **Auth:** `ADMIN`
- **Query Params:**
  - `search`: string — cari by nama atau NIP
  - `professionGroupId`: filter by profesi
  - `workplaceId`: filter by unit kerja
  - `employmentStatusId`, `employeeGroupId`, `employeeRankId`, `employeePositionId`: filter kategori kepegawaian dan golongan
  - `tmtStartDate`: filter TMT awal dari tanggal ini sampai hari ini (`YYYY-MM-DD`)
  - `tmtEndDate`: filter TMT akhir/kontrak dari tanggal ini sampai hari ini (`YYYY-MM-DD`)
  - `retirementAgeMin`, `retirementAgeMax`: filter rentang usia pegawai saat ini untuk kebutuhan masa pensiun
  - `maritalStatus`: filter status pernikahan
  - `lastEducation`: filter pendidikan terakhir
  - `page`, `pageSize`: number (opsional; repository mendukung pagination untuk query besar)
- **Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "employeeId": "198501012010011001",
      "email": "budi@example.com",
      "name": "Budi Santoso",
      "role": "EMPLOYEE",
      "hasTmt": true,
      "tmtStartDate": "2026-01-01T00:00:00.000Z",
      "tmtEndDate": "2026-12-31T00:00:00.000Z",
      "professionGroup": { "id": "...", "name": "Dokter" },
      "workplace": { "id": "...", "name": "Poli Umum" },
      "createdAt": "2026-06-01T00:00:00.000Z"
    }
  ]
}
```

### `POST /api/v1/users`
Buat pegawai baru.

- **Auth:** `ADMIN`
- **Body (Zod validated):**
```json
{
  "employeeId": "198501012010011001",
  "email": "budi@example.com",
  "password": "plaintext-akan-di-hash",
  "name": "Budi Santoso",
  "role": "EMPLOYEE",
  "gender": "L",
  "birthPlace": "Kendari",
  "birthDate": "1985-01-01",
  "hasTmt": true,
  "tmtStartDate": "2026-01-01",
  "tmtEndDate": "2026-12-31",
  "employmentStatusId": "clx...",
  "employeeGroupId": "clx...",
  "professionGroupId": "clx...",
  "employeePositionId": "clx...",
  "employeeRankId": "clx...",
  "workplaceId": "clx..."
}
```
- **Response:** `201 Created`

### `PATCH /api/v1/users/[id]`
Update data pegawai.
- **Auth:** `ADMIN`
- **Body:** Partial dari payload `POST /api/v1/users`, termasuk `hasTmt`, `tmtStartDate`, dan `tmtEndDate`.
- **Validasi TMT:** `tmtEndDate` opsional. Jika `tmtStartDate` dan `tmtEndDate` sama-sama diisi, `tmtEndDate` tidak boleh lebih awal dari `tmtStartDate`.

### `GET /api/v1/users/import/template`
Download template CSV import pegawai.

- **Auth:** `ADMIN`
- **Response:** file `text/csv`
- **Header CSV:** `employeeId`, `nik`, `email`, `password`, `name`, `role`, `gender`, `birthDate`, `birthPlace`, `academicDegree`, `lastEducation`, `religion`, `maritalStatus`, `phone`, `address`, `joinDate`, `employmentStatusName`, `employeeGroupName`, `professionGroupName`, `employeePositionName`, `employeeRankName`, `workplaceName`, `hasTmt`, `tmtStartDate`, `tmtEndDate`.

### `POST /api/v1/users/import`
Import pegawai secara bulk dari CSV.

- **Auth:** `ADMIN`
- **Content-Type:** `multipart/form-data`
- **Body:** `file` (`.csv`)
- **Behavior:** all-or-nothing; jika ada satu baris invalid, tidak ada user yang dibuat.
- **Validasi:** header CSV, duplikasi dalam file, konflik `employeeId`/`nik`/`email` dengan database, role, format tanggal, relasi master data berdasarkan nama, dan urutan TMT.
- **Response:**
```json
{
  "data": {
    "totalRows": 10,
    "validRows": 10,
    "createdCount": 10,
    "errorCount": 0,
    "errors": []
  }
}
```

### `GET /api/v1/users/export`
Export data pegawai ke CSV.

- **Auth:** `ADMIN`
- **Query Params:** mengikuti filter `GET /api/v1/users`.
- **Response:** file `text/csv`
- **Keamanan:** tidak menyertakan `passwordHash` atau plaintext password.
- **Log:** `DATA_EXPORTED`.

### `GET /api/v1/users/[id]/documents/export`
Export dokumen relevan milik satu pegawai dari Page Preview Profil Pegawai ke CSV.

- **Auth:** `ADMIN`
- **Response:** file `text/csv`
- **CSV columns:** `Jenis Dokumen`, `Kode Dokumen`, `Kategori Arsip`, `Status Upload`, `Status Verifikasi`, `Nomor Surat`, `Tanggal Terbit`, `Tanggal Kedaluwarsa`, `Tanggal Upload`, `Nama File`, `Catatan Terakhir`.
- **Behavior:** mencakup seluruh jenis dokumen yang relevan dengan pegawai berdasarkan target jenis dokumen; jenis yang belum diupload tetap muncul dengan `Status Upload = Belum Upload`.
- **Query strategy:** batch query pegawai, jenis dokumen, dan dokumen pegawai; tidak N+1 per jenis dokumen.
- **Log:** `DATA_EXPORTED` dengan metadata `scope: EMPLOYEE_DOCUMENTS`.

### `GET /api/v1/users/[id]/profile/export-pdf`
Export Preview Profil Pegawai ke PDF.

- **Auth:** `ADMIN`
- **Response:** file `application/pdf`
- **PDF content:** identitas, biodata, informasi kepegawaian, dan ringkasan dokumen pegawai.
- **Layout:** dibuat dengan Puppeteer sebagai A4 portrait: header SMDP Portal, logo instansi, hero identitas pegawai, badge status/role, kartu data dua kolom, section arsip berbentuk item-card, footer tanggal/halaman, dan QR verifikasi.
- **Dokumen:** memuat `Jenis Dokumen`, `Nomor Dokumen`, `Kategori`, dan `Status` dalam layout ringkas agar mudah dipindai oleh petugas HR.
- **Behavior:** table dokumen mencakup seluruh jenis dokumen yang relevan dengan pegawai; dokumen yang belum diupload tetap muncul dengan nomor `-` dan status `Belum Upload`.
- **Log:** `DATA_EXPORTED` dengan metadata `scope: EMPLOYEE_PROFILE_PDF`.

### `DELETE /api/v1/users/[id]`
Hapus pegawai.
- **Auth:** `ADMIN`
- **Note:** Cascade hapus `DocumentRecord` milik user. Role tersimpan langsung di `User.role`.

### `GET /api/v1/users/categories`
Ambil master kategori kepegawaian untuk dropdown dan halaman kategori.

- **Auth:** Required (semua role)
- **Response:** employment statuses, profession groups, ranks, dan workplaces.

### `POST /api/v1/users/categories`
Buat item master kategori.

- **Auth:** `ADMIN`
- **Body:**
```json
{
  "type": "STATUS",
  "name": "PNS",
  "parentId": "optional-parent-id"
}
```
- **Type:** `STATUS`, `GROUP`, `PROFESSION`, `POSITION`, `RANK`, `WORKPLACE`.

### `PATCH /api/v1/users/categories`
Update item master kategori.

- **Auth:** `ADMIN`
- **Body:** `id`, `type`, `name`, dan optional `parentId`.

### `DELETE /api/v1/users/categories`
Hapus item master kategori.

- **Auth:** `ADMIN`
- **Query Params:** `id`, `type`

---

## 7. Security Logs

### `GET /api/v1/security-logs`
Ambil audit trail.

- **Auth:** `ADMIN`
- **Status audit:** response memakai nilai ternormalisasi `success` atau `failed`; UI menampilkan `Sukses` untuk `success` dan `Gagal` untuk `failed`.
- **Query Params:**
  - `eventType`: filter by tipe event
  - `actorId`: filter by aktor
  - `from`: ISO date — filter dari tanggal
  - `to`: ISO date — filter sampai tanggal
  - `page`: number (pagination)
  - `limit`: number (pagination, default: 100, maksimum: 500)
- **Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "timestamp": "2026-06-27T08:00:00.000Z",
      "actorId": "clx...",
      "actorName": "Budi Santoso",
      "actorRole": "EMPLOYEE",
      "eventType": "DOCUMENT_UPLOADED",
      "resource": "DocumentRecord:clx...",
      "ipAddress": "192.168.1.1",
      "status": "success",
      "metadata": { "documentType": "KTP", "fileSize": "256KB" }
    }
  ],
  "pagination": {
    "total": 1234,
    "page": 1,
    "limit": 50
  }
}
```

---

## 8. Master Data (Reference Endpoints)

Endpoint master data aktual dipusatkan di `/api/v1/users/categories`.

| Endpoint | Method | Auth | Keterangan |
|---|---|---|---|
| `/api/v1/users/categories` | `GET` | Semua role | Daftar master kategori untuk dropdown |
| `/api/v1/users/categories` | `POST` | `ADMIN` | Tambah master kategori |
| `/api/v1/users/categories` | `PATCH` | `ADMIN` | Ubah master kategori |
| `/api/v1/users/categories` | `DELETE` | `ADMIN` | Hapus master kategori |

> **Catatan:** Rencana endpoint `/api/v1/master/*` tidak digunakan pada implementasi saat ini.

---

## 9. Verification

### `GET /api/v1/verification`
Ambil daftar dokumen yang perlu diverifikasi.

- **Auth:** `ADMIN`, `STAFF`
- **Behavior:**
  - `STAFF` hanya dapat melihat dokumen `PENDING` milik orang lain. Dokumen pending milik staff yang bersangkutan secara otomatis dikecualikan.
  - `ADMIN` dapat melihat seluruh dokumen `PENDING` tanpa pengecualian.
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "ownerId": "clx...",
      "documentType": {
        "id": "clx...",
        "code": "KTP",
        "name": "Kartu Tanda Penduduk",
        "archiveCategory": "UTAMA"
      },
      "status": "PENDING",
      "fileName": "KTP_Budi.pdf",
      "uploadedAt": "2026-06-27T08:00:00.000Z"
    }
  ]
}
```

### `GET /api/v1/verification/document/[id]`
Ambil detail dokumen untuk proses verifikasi.

- **Auth:** `ADMIN`, `STAFF`

### `POST /api/v1/verification/[id]/approve`
Approve dokumen.

- **Auth:** `ADMIN`, `STAFF`
- **Behavior:** Update `DocumentRecord.status` dan buat `VerificationHistory` secara atomik dalam satu transaksi database, kemudian panggil `logActivity()`. STAFF ditolak jika mencoba memverifikasi dokumen miliknya sendiri.
- **Response:**
```json
{
  "success": true,
  "data": {
    "message": "Dokumen berhasil disetujui"
  }
}
```

### `POST /api/v1/verification/[id]/reject`
Reject dokumen.

- **Auth:** `ADMIN`, `STAFF`
- **Body:** `reviewNote` wajib berisi alasan penolakan.
- **Behavior:** Update `DocumentRecord.status` dan buat `VerificationHistory` secara atomik dalam satu transaksi database, kemudian panggil `logActivity()`. STAFF ditolak jika mencoba memverifikasi dokumen miliknya sendiri.
- **Response:**
```json
{
  "success": true,
  "data": {
    "message": "Dokumen ditolak"
  }
}
```

---

## 10. Dashboard, Settings, Backup

### `GET /api/v1/dashboard/stats`
Ambil statistik dashboard personal (user-scoped) milik user login.

- **Auth:** Required (semua role)
- **Behavior:** Mengembalikan total dokumen, pending, approved, rejected, dan daftar dokumen personal terbaru/segera kedaluwarsa milik user login.

### `GET /api/v1/dashboard/charts`
Ambil analytics chart statistik global/operasional.

- **Auth:** `ADMIN`, `STAFF`
- **Dependency UI:** data response dirender di frontend menggunakan `recharts`.
- **Behavior:** response berisi data agregat siap-render, bukan data mentah seluruh pegawai/dokumen.
- **Query strategy:** agregasi pegawai dan status dokumen memakai `groupBy`; upload dokumen 6 bulan terakhir memakai select minimal lalu agregasi service-side; chart ranking dibatasi top 8/top 10 dan sisanya digabung sebagai `Lainnya`.
- **Response:**
```json
{
  "data": {
    "employeeByEmploymentStatus": [{ "label": "PNS", "value": 120 }],
    "employeeByEmployeeGroup": [{ "label": "PPPK", "value": 45 }],
    "employeeByGender": [{ "label": "Laki-laki", "value": 80 }],
    "employeeByWorkplace": [{ "label": "Poli Umum", "value": 22 }],
    "documentUploadsByTypeLastSixMonths": [
      { "month": "Feb 2026", "KTP": 12, "STR": 5, "Lainnya": 3 }
    ],
    "documentUploadTypeKeys": ["KTP", "STR", "Lainnya"],
    "monthlyUploadTrend": [{ "month": "Feb 2026", "total": 20 }],
    "verificationStatusSummary": [{ "label": "Disetujui", "value": 100 }],
    "missingMandatoryDocumentsTop": [{ "label": "KTP", "value": 14 }],
    "expiringDocumentsSummary": [{ "label": "30 hari", "days": 30, "value": 8 }],
    "generatedAt": "2026-07-03T00:00:00.000Z"
  }
}
```

### `GET /api/v1/settings`
Ambil konfigurasi sistem dinamis.

- **Auth:** `ADMIN`

### `PATCH /api/v1/settings`
Update konfigurasi sistem dinamis.

- **Auth:** `ADMIN`
- **Body:** object key-value setting yang didukung service settings.

### `GET /api/v1/backup/export`
Export database sebagai file `.sql`.

- **Auth:** `ADMIN`
- **Response:** SQL dump dengan header `Content-Disposition`.
- **Performa:** dump dibuat per chunk/batch tabel agar tidak menumpuk seluruh row database besar ke array di memori sekaligus.

---

## 11. HTTP Status Codes

| Kode | Kapan Digunakan |
|---|---|
| `200 OK` | GET berhasil |
| `201 Created` | POST berhasil membuat resource |
| `204 No Content` | DELETE berhasil |
| `400 Bad Request` | Validasi Zod gagal |
| `401 Unauthorized` | Tidak ada sesi aktif |
| `403 Forbidden` | Role tidak memiliki izin |
| `409 Conflict` | Data bertabrakan, misalnya upload dokumen dengan `documentTypeId` yang sudah dimiliki user |
| `404 Not Found` | Resource tidak ditemukan |
| `500 Internal Server Error` | Error server yang tidak tertangani |

---

## 12. Zod Validation Pattern (per Route Handler)

```ts
// Contoh pattern validasi di route handler
import { createDocumentTypeSchema } from "@/modules/document-types/validation";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createDocumentTypeSchema.safeParse(body);
  
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  
  const result = await documentTypeService.create(parsed.data);
  return Response.json({ data: result }, { status: 201 });
}
```
