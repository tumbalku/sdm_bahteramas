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
  "role": "EMPLOYEE",
  "roles": ["EMPLOYEE"]
}
```

### `GET /api/v1/auth/session`
Ambil sesi aktif. Response: session object atau `{}` jika tidak login.

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
    "birthDate": "1985-01-01T00:00:00.000Z",
    "employmentStatus": { "id": "...", "name": "PNS" },
    "employeeGroup": { "id": "...", "name": "Kelompok A" },
    "professionGroup": { "id": "...", "name": "Dokter" },
    "employeePosition": { "id": "...", "name": "Dokter Umum" },
    "employeeRank": { "id": "...", "name": "III/c" },
    "workplace": { "id": "...", "name": "Poli Umum" }
  }
}
```

### `PATCH /api/v1/profile`
Update profil mandiri.

- **Auth:** Required (semua role)
- **Body (Zod validated):**
```json
{
  "name": "string (optional)",
  "gender": "string (optional)",
  "birthDate": "ISO date string (optional)"
}
```
- **Note:** `email`, `employeeId`, `role` tidak bisa diubah via endpoint ini.

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

---

## 5. Documents

### `GET /api/v1/documents`
Ambil daftar dokumen.

- **Auth:** Required
- **Query Params:**
  - `category`: `UTAMA` | `KONDISIONAL` | `PROFESI` (opsional)
  - `status`: `PENDING` | `APPROVED` | `REJECTED` (opsional)
  - `ownerId`: string (opsional — `ADMIN`/`STAFF` bisa lihat milik user lain)
- **Behavior:**
  - `EMPLOYEE`: hanya dapat melihat dokumen milik sendiri
  - `ADMIN`/`STAFF`: dapat melihat semua dokumen, filter by `ownerId`
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
      "issueDate": "2026-01-15T00:00:00.000Z",
      "expiryDate": null,
      "uploadedAt": "2026-06-27T08:00:00.000Z"
    }
  ]
}
```

### `POST /api/v1/documents/upload`
Upload dokumen baru.

- **Auth:** `EMPLOYEE` (atau `ADMIN` untuk upload atas nama pegawai lain)
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```
  file: <file binary>
  documentTypeId: "clx..."
  issueDate: "2026-01-15" (opsional)
  expiryDate: "2028-01-15" (required jika requiresExpiryDate=true)
  ownerId: "clx..." (opsional — hanya ADMIN yang bisa upload untuk pegawai lain)
  ```
- **Validation:**
  - Format file harus sesuai `DocumentType.allowedFormats`
  - Ukuran file ≤ `DocumentType.maxSizeMb`
  - `expiryDate` wajib jika `requiresExpiryDate = true`
- **Response:** `201 Created` dengan data `DocumentRecord`.

### `GET /api/v1/documents/[id]`
Detail satu dokumen.

- **Auth:** `ADMIN`, `STAFF`, atau pemilik dokumen
- **Response:** Data lengkap dokumen + `verifications` (riwayat verifikasi).

### `PATCH /api/v1/documents/[id]`
Approve atau Reject dokumen.

- **Auth:** `ADMIN`, `STAFF`
- **Body (Zod validated):**
```json
{
  "status": "APPROVED",
  "reviewNote": "optional — wajib jika REJECTED"
}
```
- **Behavior:**
  - Update `DocumentRecord.status`
  - Buat baris baru di `VerificationHistory`
  - Panggil `logActivity()`

### `DELETE /api/v1/documents/[id]`
Hapus dokumen.

- **Auth:**
  - `EMPLOYEE`: hanya milik sendiri dan status bukan `APPROVED`
  - `ADMIN`: dokumen siapapun
- **Response:** `204 No Content`

### `GET /api/v1/documents/download`
Unduh file dokumen.

- **Auth:** `ADMIN`, `STAFF`, atau pemilik dokumen
- **Query Params:**
  - `id`: Document Record ID
- **Response:** File stream (Content-Type sesuai format file)

---

## 6. Users

### `GET /api/v1/users`
Daftar semua pegawai.

- **Auth:** `ADMIN`
- **Query Params:**
  - `search`: string — cari by nama atau NIP
  - `professionGroupId`: filter by profesi
  - `workplaceId`: filter by unit kerja
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
  "birthDate": "1985-01-01",
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

### `DELETE /api/v1/users/[id]`
Hapus pegawai.
- **Auth:** `ADMIN`
- **Note:** Cascade hapus `UserRole` dan `DocumentRecord`.

### `GET /api/v1/users/export`
Export data pegawai ke CSV.

- **Auth:** `ADMIN`
- **Response:** File CSV dengan header kolom sesuai model User.
- **Log:** `logActivity("DATA_EXPORTED", ...)`

### `POST /api/v1/users/import`
Import pegawai dari CSV.

- **Auth:** `ADMIN`
- **Content-Type:** `multipart/form-data`
- **Body:** `file: <csv file>`
- **Validation:** Zod validasi setiap baris CSV sebelum insert.

---

## 7. Security Logs

### `GET /api/v1/security-logs`
Ambil audit trail.

- **Auth:** `ADMIN`
- **Query Params:**
  - `eventType`: filter by tipe event
  - `actorId`: filter by aktor
  - `from`: ISO date — filter dari tanggal
  - `to`: ISO date — filter sampai tanggal
  - `page`: number (pagination)
  - `limit`: number (pagination, default: 50)
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

Endpoint ini untuk mengisi dropdown form — akan dibuat sesuai kebutuhan:

| Endpoint | Method | Auth | Keterangan |
|---|---|---|---|
| `/api/v1/master/employment-statuses` | `GET` | `ADMIN` | Daftar status kepegawaian |
| `/api/v1/master/employee-groups` | `GET` | `ADMIN` | Daftar kelompok pegawai |
| `/api/v1/master/profession-groups` | `GET` | `ADMIN` | Daftar kelompok profesi |
| `/api/v1/master/employee-positions` | `GET` | `ADMIN` | Daftar jabatan |
| `/api/v1/master/employee-ranks` | `GET` | `ADMIN` | Daftar pangkat |
| `/api/v1/master/workplaces` | `GET` | `ADMIN` | Daftar unit kerja |

> **Catatan:** Endpoint master data belum didefinisikan secara detail di PRD. Implementasikan sesuai kebutuhan form.

---

## 9. HTTP Status Codes

| Kode | Kapan Digunakan |
|---|---|
| `200 OK` | GET berhasil |
| `201 Created` | POST berhasil membuat resource |
| `204 No Content` | DELETE berhasil |
| `400 Bad Request` | Validasi Zod gagal |
| `401 Unauthorized` | Tidak ada sesi aktif |
| `403 Forbidden` | Role tidak memiliki izin |
| `404 Not Found` | Resource tidak ditemukan |
| `500 Internal Server Error` | Error server yang tidak tertangani |

---

## 10. Zod Validation Pattern (per Route Handler)

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
