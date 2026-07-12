# Supabase Production Migration Runbook — SMDP Portal

> Tujuan: menyinkronkan schema Prisma dengan database Supabase production/staging secara aman sebelum/ketika PR remediation ini di-merge dan di-deploy.
>
> **Jangan tulis atau commit credential.** Semua connection string, password, token, dan service role key harus tetap berada di environment lokal/CI/Vercel/Supabase, bukan di dokumen atau commit.

---

## 1. Scope Migration Saat Ini

Migration yang relevan pada batch ini:

| Urutan | Migration | Isi | Risiko |
|---|---|---|---|
| 1 | `20260704000000_remove_user_roles` | `DROP TABLE IF EXISTS "UserRole";` dan `CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");` | Aman jika project sudah benar-benar single-role dan tabel `UserRole` tidak dipakai lagi. Wajib cek sebelum apply di production. |
| 2 | `20260711000000_add_user_birth_place` | `ALTER TABLE "User" ADD COLUMN "birthPlace" TEXT;` | Low risk; nullable column. Memperbaiki error `User.birthPlace does not exist`. |

Gejala yang diperbaiki:

```txt
Invalid prisma.user.findMany() invocation:
The column User.birthPlace does not exist in the current database.
```

Root cause: Prisma schema/client sudah mengharapkan `User.birthPlace`, tetapi database target belum menjalankan migration `20260711000000_add_user_birth_place`.

---

## 2. Preflight Lokal Sebelum Menyentuh Supabase

Jalankan di repo lokal:

```bash
npm install
npx prisma validate
npm run test -- --run
npx tsc --noEmit
npm run lint
npm run build
```

Untuk local Docker PostgreSQL yang saat ini dipakai Sil:

```bash
export DATABASE_URL='postgresql://postgres:postgres@localhost:5433/smdp_bahteramas?schema=public'
export DIRECT_URL='postgresql://postgres:postgres@localhost:5433/smdp_bahteramas?schema=public'

npx prisma migrate status
```

Ekspektasi setelah local sudah disinkronkan:

```txt
Database schema is up to date!
```

Verifikasi kolom `birthPlace` lokal:

```bash
docker exec smdp-postgres psql -U postgres -d smdp_bahteramas -Atc \
  "select column_name, data_type, is_nullable from information_schema.columns where table_schema='public' and table_name='User' and column_name='birthPlace';"
```

Ekspektasi:

```txt
birthPlace|text|YES
```

Verifikasi Prisma query lokal:

```bash
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({
    take: 1,
    select: { id: true, employeeId: true, birthPlace: true },
  });
  console.log(JSON.stringify({ ok: true, count: users.length }));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
NODE
```

---

## 3. Preflight Supabase Production/Staging

> Jalankan ini untuk **staging dulu** jika tersedia. Production hanya setelah staging hijau.

### 3.1 Backup database sebelum migration

Minimal lakukan salah satu:

1. Supabase Dashboard → **Database → Backups** → pastikan backup terbaru tersedia.
2. Atau dump manual dari terminal lokal/CI yang punya akses DB:

```bash
pg_dump "$DATABASE_URL" --format=custom --file "backup-before-smdp-migration-$(date +%Y%m%d-%H%M%S).dump"
```

Jangan commit file backup. File backup dapat mengandung data sensitif.

### 3.2 Set env Supabase hanya di shell/session aman

Gunakan value dari dashboard Supabase/Vercel/secret manager. Jangan paste ke chat/log/commit.

```bash
export DATABASE_URL='<SUPABASE_POOLER_OR_DIRECT_DATABASE_URL>'
export DIRECT_URL='<SUPABASE_DIRECT_DATABASE_URL>'
```

Rekomendasi:

- `DIRECT_URL` pakai direct connection Supabase untuk migration.
- `DATABASE_URL` boleh pooler/runtime URL, tetapi migration lebih aman memakai direct URL jika konfigurasi Prisma menggunakannya.

### 3.3 Cek kondisi schema production sebelum migration

```bash
npx prisma migrate status
```

Lalu cek object penting secara read-only:

```bash
psql "$DIRECT_URL" -Atc "select to_regclass('public._prisma_migrations'), to_regclass('public.\"User\"'), to_regclass('public.\"UserRole\"');"

psql "$DIRECT_URL" -Atc "select column_name from information_schema.columns where table_schema='public' and table_name='User' and column_name in ('role','birthPlace') order by column_name;"

psql "$DIRECT_URL" -Atc "select indexname from pg_indexes where schemaname='public' and tablename='User' and indexname='User_role_idx';"
```

Interpretasi penting:

| Kondisi | Artinya | Tindakan |
|---|---|---|
| `_prisma_migrations` ada dan migration pending terlihat | DB sudah dikelola Prisma Migrate | Jalankan `npx prisma migrate deploy`. |
| `_prisma_migrations` tidak ada, tetapi schema/tabel sudah berisi data | DB pernah dibuat via `db push`/SQL manual | Perlu baseline/resolve hati-hati sebelum deploy. Jangan langsung force/reset. |
| `UserRole` masih ada dan berisi data penting | Production belum sepenuhnya single-role | Stop. Audit dulu sebelum drop. |
| `UserRole` tidak ada dan `User_role_idx` sudah ada | Efek migration `remove_user_roles` sudah tercermin | Bisa `migrate resolve --applied 20260704000000_remove_user_roles`, lalu deploy migration berikutnya. |
| `birthPlace` sudah ada | Error tidak berasal dari kolom missing di DB tersebut | Cek app terhubung ke database yang benar / deployment env. |

---

## 4. Jalur A — Production Sudah Punya `_prisma_migrations`

Jika `npx prisma migrate status` hanya menunjukkan pending migration normal:

```bash
npx prisma migrate deploy
npx prisma migrate status
```

Ekspektasi akhir:

```txt
Database schema is up to date!
```

Lanjut ke verifikasi section 6.

---

## 5. Jalur B — DB Non-Empty Tapi Belum Ada `_prisma_migrations` / P3005

Jika muncul:

```txt
Error: P3005
The database schema is not empty.
```

Jangan reset database production.

### 5.1 Cek apakah migration `20260704000000_remove_user_roles` sudah tercermin

```bash
psql "$DIRECT_URL" -Atc "select to_regclass('public.\"UserRole\"');"
psql "$DIRECT_URL" -Atc "select indexname from pg_indexes where schemaname='public' and tablename='User' and indexname='User_role_idx';"
```

Jika:

- `UserRole` sudah tidak ada, dan
- `User_role_idx` sudah ada,

maka tandai migration pertama sebagai applied:

```bash
npx prisma migrate resolve --applied 20260704000000_remove_user_roles
```

Setelah itu deploy migration penambahan `birthPlace`:

```bash
npx prisma migrate deploy
npx prisma migrate status
```

### 5.2 Jika `UserRole` masih ada

Stop dan audit:

```bash
psql "$DIRECT_URL" -Atc "select count(*) from \"UserRole\";"
```

Jika data masih ada, jangan drop sebelum dipastikan sudah tidak dibutuhkan. Pilihan aman:

1. Backup database.
2. Verifikasi semua user sudah punya `User.role` yang benar.
3. Baru jalankan `npx prisma migrate deploy` saat yakin single-role sudah final.

---

## 6. Verifikasi Setelah Migration Supabase

### 6.1 Status migration

```bash
npx prisma migrate status
```

Ekspektasi:

```txt
Database schema is up to date!
```

### 6.2 Kolom `birthPlace` ada

```bash
psql "$DIRECT_URL" -Atc "select column_name, data_type, is_nullable from information_schema.columns where table_schema='public' and table_name='User' and column_name='birthPlace';"
```

Ekspektasi:

```txt
birthPlace|text|YES
```

### 6.3 Prisma query smoke test

```bash
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({
    take: 1,
    select: { id: true, employeeId: true, birthPlace: true },
  });
  console.log(JSON.stringify({ ok: true, count: users.length }));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
NODE
```

Ekspektasi:

```json
{"ok":true,"count":0}
```

atau `count` lebih dari 0. Yang penting tidak ada error missing column.

### 6.4 App smoke test setelah deploy aplikasi

Setelah migration DB berhasil dan app sudah deploy:

- Login sebagai ADMIN.
- Buka **Manajemen Pegawai**.
- Buka tambah/edit pegawai, pastikan field **Tempat Lahir** tampil dan bisa disimpan.
- Buka **Profil Saya**, pastikan biodata dengan **Tempat Lahir** tidak error.
- Buka halaman yang sebelumnya memicu `prisma.user.findMany()`; pastikan error `User.birthPlace does not exist` hilang.

---

## 7. Rollback Plan

Migration `birthPlace` nullable dan low-risk. Jika deployment aplikasi bermasalah tetapi DB migration berhasil:

1. Rollback aplikasi ke versi sebelumnya.
2. Biarkan kolom `birthPlace` tetap ada; versi lama biasanya aman terhadap kolom ekstra.

Jika harus rollback schema secara manual hanya untuk staging/dev:

```sql
ALTER TABLE "User" DROP COLUMN IF EXISTS "birthPlace";
```

Untuk production, hindari drop column kecuali sudah dipastikan tidak ada data penting dan sudah ada backup.

---

## 8. Checklist Sebelum Commit/Push/PR

- [ ] `REVIEW.md` tidak ignored dan ikut di-stage.
- [ ] `prisma/migrations/20260711000000_add_user_birth_place/migration.sql` ikut di-stage.
- [ ] `prisma/schema.prisma` berisi `User.birthPlace String?`.
- [ ] Local migration status up to date.
- [ ] Supabase/staging migration plan sudah dipilih: Jalur A atau Jalur B.
- [ ] Backup production/staging tersedia sebelum migration.
- [ ] Quality gate lokal hijau:
  - [ ] `npm run test -- --run`
  - [ ] `npx tsc --noEmit`
  - [ ] `npm run lint`
  - [ ] `npm run build`

---

## 9. Urutan Rekomendasi Operasional

1. Commit/PR membawa kode + migration + dokumen ini.
2. Sebelum merge/deploy production, jalankan migration di staging/Supabase staging.
3. Verifikasi staging dengan section 6.
4. Merge PR.
5. Sebelum app production baru menerima traffic, jalankan migration production:
   ```bash
   npx prisma migrate deploy
   ```
6. Deploy app production.
7. Jalankan app smoke test.

Jika platform deploy menjalankan migration otomatis di CI/CD, pastikan step migration berjalan **sebelum** app version baru aktif.
