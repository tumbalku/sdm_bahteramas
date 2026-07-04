# ADR 002 — RBAC: 3 Role dengan Otorisasi Berlapis

| Field | Value |
|---|---|
| **ID** | ADR-002 |
| **Judul** | Desain RBAC: 3 Role dengan 3 Lapis Otorisasi |
| **Status** | Accepted |
| **Tanggal** | 2026-06-27 |
| **Decider** | Tim SMDP |

---

## Konteks

Aplikasi memerlukan sistem otorisasi yang:
- Membatasi akses fitur berdasarkan peran pengguna
- Tidak terlalu kompleks untuk tim junior
- Aman dari bypass akses

Pertanyaan desain:
1. Berapa role yang cukup?
2. Di mana otorisasi dilakukan?
3. Apakah perlu permission granular (per resource)?

## Keputusan

### 1. Tiga Role Cukup

```
ADMIN   — Akses penuh ke semua fitur; mewarisi kemampuan STAFF dan EMPLOYEE
STAFF   — Fokus pada verifikasi dokumen + lihat data; mewarisi kemampuan EMPLOYEE
EMPLOYEE — Kelola dokumen dan profil milik sendiri
```

Tidak perlu permission granular di luar 3 role ini untuk v1.0. Permission tidak dianggap eksklusif: kode aplikasi memakai helper capability-based agar `ADMIN` dan `STAFF` juga dapat menjalankan aksi personal milik `EMPLOYEE`.

### 2. Tiga Lapis Otorisasi

**Lapis 1: Middleware** (`src/middleware.ts`, delegasi ke `src/proxy.ts`)
- Blokir akses halaman yang butuh login sebelum mencapai server Next.js
- Redirect ke `/login` jika tidak ada sesi

**Lapis 2: Server Component** (`requireRole()` di `page.tsx`)
- Cek ulang role di server sebelum halaman dikirim ke browser
- Ini pengaman utama — tidak bisa di-bypass dari browser

**Lapis 3: Client UI** (`hasRole()` di komponen)
- Sembunyikan elemen UI yang tidak relevan untuk role tersebut
- **Hanya kosmetik** — bukan pengaman utama

**Lapis 4 (implisit): API Route Handler**
- Setiap endpoint API cek sesi dan role sebelum memproses request
- Mencegah bypass langsung via API tanpa melalui UI

### 3. Role Disimpan Sebagai Enum di Database

```prisma
enum Role {
  ADMIN
  STAFF
  EMPLOYEE
}
```

Role disimpan langsung di `User.role` sebagai source of truth penyimpanan. Untuk v1.0, satu user hanya boleh memiliki satu role sehingga tabel `UserRole` tidak digunakan.

Permission runtime dihitung bertingkat:
- `ADMIN` memiliki capability `ADMIN`, `STAFF`, dan `EMPLOYEE`.
- `STAFF` memiliki capability `STAFF` dan `EMPLOYEE`.
- `EMPLOYEE` hanya memiliki capability `EMPLOYEE`.

Implikasinya, dokumen personal milik `ADMIN` dan `STAFF` tetap masuk ke arsip/rekomputasi dokumen yang berbasis kemampuan employee.

### 4. Isi Session

```json
{
  "id": "clx...",
  "email": "...",
  "name": "...",
  "role": "EMPLOYEE"
}
```

## Konsekuensi

**Positif:**
- Sederhana dan mudah dimengerti oleh tim junior
- 3 lapis otorisasi memberikan keamanan defense-in-depth
- Enum mencegah typo role (vs string bebas)
- Single-role di `User.role` menghindari duplikasi data role dan lebih mudah diaudit
- Capability helper menghindari hardcode `role === "EMPLOYEE"` untuk aksi personal

**Negatif / Trade-off:**
- Tidak ada permission granular per resource (misal: tidak bisa "STAFF hanya bisa verifikasi departemen tertentu")
- Jika kebutuhan permission berkembang kompleks, perlu refactor ke model RBAC yang lebih canggih (misal: Casbin)
- Jika kebutuhan multi-role muncul di masa depan, perlu migration baru untuk memisahkan role ke tabel relasi.

## Alternatif yang Ditolak

| Alternatif | Alasan Ditolak |
|---|---|
| Permission granular (bitmask/string per feature) | Terlalu kompleks untuk v1.0, overkill untuk skala ini |
| Lebih dari 3 role (misal: VERIFIER, MANAGER) | Belum ada kebutuhan di PRD v1.0 |
| Hanya cek di middleware saja | Tidak cukup aman — middleware bisa di-bypass jika konfigurasi keliru |
| Hanya cek di client (hasRole) | Sangat tidak aman — semua proteksi bisa di-bypass via DevTools |
| Role disimpan sebagai string bebas | Rawan typo, tidak dijaga oleh database |

---

## Referensi

- PRD §9 — Autentikasi & Otorisasi
- PRD §5 — Aturan Emas (poin 8: page.tsx hanya berisi requireRole + render komponen)
- PRD §10 — Modul Fitur & Akses Role
