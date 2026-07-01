# Database Security Report: Supabase RLS Audit

**Date:** 2026-07-01
**Target:** Supabase PostgreSQL Schema `public`

## Context
Aplikasi SMDP Portal menggunakan Next.js 15 dengan Prisma ORM untuk semua interaksi ke database. Supabase digunakan secara spesifik sebagai database PostgreSQL murni. Aplikasi tidak menggunakan Supabase client (`supabase-js`), REST API Supabase, atau fitur Realtime. 

Supabase mendeteksi peringatan keamanan `rls_disabled_in_public` pada project ini. Peringatan ini muncul karena tabel-tabel di schema `public` tidak mengaktifkan fitur Row Level Security (RLS). Jika suatu saat endpoint REST API Supabase (anon/authenticated keys) terekspos, pihak luar berpotensi membaca/mengubah data pada tabel yang RLS-nya nonaktif.

## Findings
Dari hasil audit menyeluruh terhadap schema Prisma, terdapat **18 tabel** pada schema `public` yang saat ini belum memiliki RLS yang aktif:
1. `EmploymentStatus`
2. `EmployeeGroup`
3. `ProfessionGroup`
4. `EmployeePosition`
5. `EmployeeRank`
6. `Workplace`
7. `User`
8. `UserRole`
9. `DocumentType`
10. `DocumentTypeProfession`
11. `DocumentTypeEmploymentStatus`
12. `DocumentTypeEmployeeGroup`
13. `DocumentTypeEmployeeRank`
14. `DocumentTypeWorkplace`
15. `DocumentRecord`
16. `VerificationHistory`
17. `SecurityLog`
18. `SystemSetting`

## Actions Taken
1. **Enable RLS:** RLS akan diaktifkan (via instruksi `ENABLE ROW LEVEL SECURITY`) pada seluruh 18 tabel di atas.
2. **No Policies Created:** Sesuai constraint arsitektur (tidak menggunakan REST API Supabase), tidak ada policy yang dibuat untuk role anon atau authenticated. Di PostgreSQL, mengaktifkan RLS tanpa membuat policy apa pun akan menghasilkan perilaku **DENY ALL**.

## Architecture Impact & Safety
Perubahan ini 100% aman dan **tidak memengaruhi Prisma ORM**:
- Prisma terhubung ke database Supabase menggunakan connection string (contohnya dengan user `postgres` atau user yang memiliki privilege `BYPASSRLS`).
- Koneksi dengan hak akses bypass otomatis mengabaikan semua batasan RLS. Operasi CRUD yang dilakukan oleh backend (Server Actions/Route Handlers) akan berjalan lancar seperti biasa.
- Akses melalui REST API bawaan Supabase akan sepenuhnya diblokir, menyelesaikan kelemahan keamanan yang terdeteksi tanpa merusak business logic aplikasi.

## Old Policies
Tidak ada policy lama yang perlu diperhatikan karena aplikasi dimulai dari nol dan tidak mendefinisikan policy Supabase apa pun.

## Rekomendasi Keamanan Selanjutnya
- Selalu pastikan `anon` key Supabase tidak pernah di-expose ke sisi frontend / client browser dalam `.env.local` (misal dengan prefix `NEXT_PUBLIC_`), karena arsitektur tidak menggunakannya.
- Jika di masa mendatang dibutuhkan integrasi Storage Supabase yang dipanggil langsung dari client, maka RLS untuk tabel `.storage` perlu dikonfigurasi terpisah.
