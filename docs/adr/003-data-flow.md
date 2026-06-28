# ADR 003 — Pola Alur Data: Component → Hook → API → Service

| Field | Value |
|---|---|
| **ID** | ADR-003 |
| **Judul** | Pola Alur Data Frontend-Backend: TanStack Query + REST |
| **Status** | Accepted |
| **Tanggal** | 2026-06-27 |
| **Decider** | Tim SMDP |

---

## Konteks

Diperlukan pola standar untuk mengambil dan memodifikasi data dari frontend ke backend yang:
- Konsisten di semua modul
- Mudah dipahami dan diikuti tim junior
- Menangani loading, error, dan caching secara otomatis
- Tidak memerlukan boilerplate state management yang banyak

## Keputusan

### Pola Alur Data (Unidirectional)

```
React Component
  ↓ pakai
hooks.ts (TanStack Query: useQuery / useMutation)
  ↓ panggil
api.ts (fungsi fetch() ke endpoint REST)
  ↓ HTTP request
API Route Handler (src/app/api/v1/...)
  ↓ panggil
service.ts (logika bisnis)
  ↓ query/mutasi
repository.ts (Prisma query)
  ↓
PostgreSQL
```

**Aturan Keras:**
1. Komponen **tidak pernah** memanggil `fetch()` langsung — selalu via `hooks.ts`
2. `hooks.ts` hanya memanggil `api.ts` di modul yang **sama**
3. Route Handler hanya memanggil `service.ts` di modul yang **sama**
4. `service.ts` modul A bisa memanggil `service.ts` modul B — tapi **tidak boleh** impor `repository.ts` modul lain

### TanStack Query sebagai State Manager Server

Dipilih karena:
- Menangani cache, loading, error, dan refetch otomatis
- Tidak perlu membuat state `isLoading`, `error`, `data` manual di setiap komponen
- `invalidateQueries` memastikan UI selalu menampilkan data terkini setelah mutasi

### REST sebagai Satu-satunya Protokol

- Frontend ke backend: REST
- Antar modul (saat jadi microservice): tetap REST
- **Tidak ada** gRPC, GraphQL, WebSocket (untuk v1.0)

### Tidak Ada Prefetch di Server Component

Untuk kesederhanaan, data fetching dilakukan di client melalui TanStack Query. Prefetch di server component tidak diperlukan untuk skala v1.0.

## Implementasi Standar per Modul

```ts
// api.ts — fetch function
export const documentApi = {
  getAll: (category?: ArchiveCategory) =>
    apiClient.get<DocumentRecord[]>(`/api/v1/documents?category=${category}`),
  upload: (formData: FormData) =>
    apiClient.post<DocumentRecord>("/api/v1/documents/upload", formData),
};

// hooks.ts — TanStack Query
export function useDocuments(category?: ArchiveCategory) {
  return useQuery({
    queryKey: ["documents", category ?? "all"],
    queryFn: () => documentApi.getAll(category),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => documentApi.upload(fd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

// Komponen — hanya consume hook, tidak ada fetch langsung
function DocumentTabs() {
  const { data, isLoading } = useDocuments("UTAMA");
  // render...
}
```

## Konsekuensi

**Positif:**
- Pola yang seragam di semua modul — mudah dipelajari dan ditelusuri
- Cache otomatis via TanStack Query — performa lebih baik
- Separation of concerns yang jelas
- Mudah di-test secara unit (setiap layer bisa di-test terpisah)
- Siap migrasi ke microservice: hanya `service.ts` yang perlu diubah

**Negatif / Trade-off:**
- Sedikit lebih banyak file per modul (tapi sudah jelas fungsinya masing-masing)
- Data tidak di-prefetch di server (initial page load mungkin ada loading state) — acceptable untuk v1.0

## Alternatif yang Ditolak

| Alternatif | Alasan Ditolak |
|---|---|
| `fetch()` langsung di komponen | Tidak konsisten, tidak ada caching, tidak ada error handling standar |
| `useEffect` + `useState` manual | Boilerplate banyak, rawan bug race condition |
| SWR sebagai pengganti TanStack Query | TanStack Query lebih lengkap dan sudah dipilih di PRD |
| GraphQL (misal: Apollo) | Terlalu kompleks untuk tim junior, tidak cocok dengan prinsip KIS |
| Redux / Zustand untuk server state | Berlebihan jika TanStack Query sudah menangani server state |
| Server Actions Next.js (tanpa API route) | Tidak konsisten dengan prinsip "REST sebagai satu-satunya protokol komunikasi" dan menyulitkan pemisahan ke microservice |

---

## Referensi

- PRD §5 — Aturan Emas (poin 1-4)
- PRD §12 — Pengambilan Data di Frontend: TanStack Query
- PRD §6.3 — Struktur di Dalam Satu Modul
- PRD §6.4 — Aturan Antar Modul
