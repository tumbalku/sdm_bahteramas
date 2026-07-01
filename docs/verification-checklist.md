# Verification Checklist: Supabase RLS Security

Gunakan checklist di bawah ini untuk memverifikasi bahwa perubahan keamanan berjalan sesuai rencana dan tidak merusak fungsionalitas aplikasi.

## 1. Verifikasi Prisma & Aplikasi
- [ ] Jalankan seeder database: `npx prisma db seed` (pastikan berjalan normal).
- [ ] Jalankan aplikasi lokal: `npm run dev`
- [ ] (Bila UI sudah siap) Lakukan login ke aplikasi.
- [ ] Akses halaman dashboard atau operasi CRUD melalui endpoint `/api/v1/`.
- [ ] **Ekspektasi:** Prisma berhasil mengeksekusi operasi ke database tanpa terkena blokir `row-level security violation`.

## 2. Verifikasi Pemblokiran REST API (Supabase)
- [ ] Dapatkan Project URL dan `anon` key dari dashboard Supabase (Settings -> API).
- [ ] Jalankan request curl ke salah satu tabel, contoh:
  ```bash
  curl "https://<PROJECT_REF>.supabase.co/rest/v1/User?select=*" \
    -H "apikey: <ANON_KEY>" \
    -H "Authorization: Bearer <ANON_KEY>"
  ```
- [ ] **Ekspektasi:** Output berupa array kosong `[]` (karena data di-filter out oleh RLS). Data asli di tabel tidak dapat dilihat.

## 3. Verifikasi Peringatan Supabase
- [ ] Buka Dashboard web Supabase.
- [ ] Akses menu **Database -> Security** atau **Security Advisor**.
- [ ] **Ekspektasi:** Warning `rls_disabled_in_public` menghilang. Semua 18 tabel pada schema `public` kini berstatus `Active` untuk Row Level Security.
