# Dokumentasi SMDP Portal

Indeks ini membantu memilih dokumen yang tepat sebelum mengerjakan fitur, bugfix, refactor, atau audit.

## Dokumen Utama

| Dokumen | Fungsi |
|---|---|
| `../AGENTS.md` | Instruksi kerja AI agent, aturan project, dan konvensi wajib |
| `../PRD-SMDP-PORTAL-v1.0-20260627.md` | Product Requirements Document v1.0 |
| `architecture.md` | Arsitektur aplikasi, module boundary, data flow, dan shared library |
| `database.md` | Schema Prisma, entity, relasi, cascade, dan helper database |
| `business-rules.md` | RBAC, workflow dokumen, verifikasi, storage, dan security log |
| `routing.md` | Route halaman, API route, middleware flow, dan query parameter |
| `api.md` | Kontrak REST API `/api/v1/*` |
| `coding-standard.md` | Standar kode, React component rules, import, error handling, dan checklist commit |
| `features.md` | Daftar fitur, status, dependency graph, dan backlog |
| `progress.md` | Status implementasi dan riwayat update |
| `glossary.md` | Istilah domain, singkatan, modul, dan event security log |

## Audit, Refactor, dan Verifikasi

| Dokumen | Fungsi |
|---|---|
| `security-report.md` | Laporan audit Supabase RLS |
| `verification-checklist.md` | Checklist verifikasi RLS dan dampak ke aplikasi |
| `refactor-progress.md` | Catatan refactor UI ringan yang sudah dilakukan |

## ADR

| Dokumen | Keputusan |
|---|---|
| `adr/001-architecture.md` | Monolit modular sederhana |
| `adr/002-rbac.md` | RBAC 3 role dengan otorisasi berlapis |
| `adr/003-data-flow.md` | Pola alur data Component -> Hook -> API -> Service |

## Urutan Baca Cepat

1. Mulai dari `../AGENTS.md`.
2. Untuk implementasi fitur: baca `features.md`, `progress.md`, lalu dokumen domain terkait.
3. Untuk route/API: baca `routing.md` dan `api.md`.
4. Untuk database: baca `database.md` dan `business-rules.md`.
5. Untuk perubahan arsitektur: baca `architecture.md` dan ADR terkait.

## Catatan Sinkronisasi

- Source code aktual menang jika ada konflik dengan dokumentasi.
- Setelah task besar, update `progress.md` dan dokumen domain yang terdampak.
- Jika perubahan mengubah keputusan arsitektur, tambahkan ADR baru dengan nomor berikutnya.
