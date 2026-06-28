# ADR 001 — Arsitektur: Monolit Modular Sederhana

| Field | Value |
|---|---|
| **ID** | ADR-001 |
| **Judul** | Pilihan Arsitektur: Monolit Modular Sederhana |
| **Status** | Accepted |
| **Tanggal** | 2026-06-27 |
| **Decider** | Tim SMDP |

---

## Konteks

Proyek SMDP dimulai dari nol oleh tim yang terdiri dari programmer junior dengan pemahaman dasar REST API dan Next.js. Dibutuhkan arsitektur yang:
- Mudah dipahami dan dikerjakan
- Tidak memerlukan tooling atau konsep lanjutan
- Siap dimigrasikan ke microservice di masa depan tanpa perlu menulis ulang logika bisnis

## Keputusan

**Gunakan arsitektur Monolit Modular Sederhana** dengan prinsip berikut:

1. Satu repository, satu deployment
2. Setiap domain bisnis diorganisasi ke dalam modul terpisah di `src/modules/`
3. Setiap modul memiliki "pintu resmi" tunggal: `service.ts`
4. Komunikasi antar modul: hanya lewat `service.ts`, tidak boleh langsung ke `repository.ts` modul lain
5. Semua komunikasi API menggunakan REST (JSON over HTTP)
6. Tidak ada event bus, message queue, atau dependency injection framework

## Konsekuensi

**Positif:**
- Tim junior dapat langsung mengerjakan tanpa kurva belajar yang curam
- Struktur folder yang seragam dan dapat diprediksi di semua modul
- Debugging mudah (semua ada di satu tempat, pakai browser DevTools)
- Migrasi ke microservice lebih mudah: cukup ganti isi `service.ts` dari query Prisma ke `fetch()` ke service baru

**Negatif / Trade-off:**
- Single point of failure (kalau satu modul error, bisa mempengaruhi lainnya)
- Database yang sama untuk semua modul (tapi sudah dipisahkan dengan baik di schema)
- Skalabilitas terbatas (mitigasi: pola sudah disiapkan untuk migrasi ke microservice)

## Alternatif yang Ditolak

| Alternatif | Alasan Ditolak |
|---|---|
| Microservice sejak awal | Terlalu kompleks untuk tim junior dan skala proyek saat ini |
| Monolith tanpa pemisahan modul | Sulit dimaintain dan tidak siap migrasi |
| Event-driven architecture | Berlebihan, butuh tooling seperti RabbitMQ/Kafka |
| gRPC sebagai protokol komunikasi | Tim tidak familiar, tooling debugging lebih rumit |

---

## Referensi

- PRD §6 — Arsitektur: Monolit Modular Sederhana
- PRD §15 — Rencana Jangka Panjang: Siap Upgrade ke Microservice
