/**
 * WORKAROUND: dynamic column checker helper.
 * 
 * Alasan: Memeriksa keberadaan kolom pada tabel database secara dinamis sebelum 
 * query dieksekusi, mencegah error ketika schema migration belum selesai atau 
 * ketika engine/client Prisma belum ter-generate ulang dengan model model baru.
 * 
 * TODO: Hapus workaround file ini setelah proses migrasi database selesai di production
 * dan seluruh model Prisma Client sudah tergenerasi stabil di env target.
 */
import { prisma } from "@/lib/prisma";

const userColumnCache = new Map<string, boolean>();

export async function hasUserColumn(columnName: string) {
  const cached = userColumnCache.get(columnName);
  if (cached !== undefined) return cached;

  const rows: { exists: boolean }[] = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
        AND column_name = ${columnName}
    ) AS "exists"
  `;

  const exists = Boolean(rows[0]?.exists);
  userColumnCache.set(columnName, exists);
  return exists;
}
