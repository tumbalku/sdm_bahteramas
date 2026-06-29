# Coding Standard — SMDP Portal

## 1. Penamaan File & Folder

| Elemen | Konvensi | Contoh |
|---|---|---|
| Folder modul | kebab-case | `document-types/`, `security-logs/` |
| Komponen React | PascalCase + `.tsx` | `DocumentTabs.tsx`, `UserTable.tsx` |
| File service/repository/validation/api/hooks | camelCase tunggal | `service.ts`, `repository.ts`, `hooks.ts` |
| Tipe data | `types.ts` per modul | `types.ts` |
| File page Next.js | lowercase sesuai konvensi App Router | `page.tsx`, `layout.tsx` |
| File library shared | camelCase | `auth-utils.ts`, `api-client.ts` |
| File konfigurasi | kebab-case | `next.config.ts`, `components.json` |

---

## 2. Penamaan Komponen React

| Elemen | Konvensi | Contoh |
|---|---|---|
| Komponen React | PascalCase | `DocumentTabs`, `VerificationCard` |
| Props interface | PascalCase + `Props` suffix | `DocumentTabsProps`, `UserTableProps` |
| Komponen halaman (View) | PascalCase + `View` suffix | `DocumentsView`, `UsersView` |
| Komponen form | PascalCase + `Form` suffix | `DocumentUploadForm`, `UserCreateForm` |
| Komponen tabel | PascalCase + `Table` suffix | `UserTable`, `DocumentTable` |
| Komponen kartu/card | PascalCase + `Card` suffix | `StatsCard`, `VerificationCard` |

### 2.1 Penggunaan Komponen UI (Shadcn UI Standards)
1. **Dilarang Keras Kustomisasi Dari Nol (No Reinventing the Wheel):** Jangan pernah membuat komponen UI dasar dari scratch (HTML/CSS murni atau div kustom) jika komponen tersebut sudah didukung oleh ekosistem Shadcn UI.
2. **Pengunduhan & Pemasangan:** Selalu install/unduh atau gunakan komponen resmi Shadcn UI (misalnya `Dialog`, `Sheet`, `Select`, `Input`, `Table`, `Badge`, `Tabs`, `DropdownMenu`, `Avatar`, `Skeleton`, `Card`, `Alert`, `Separator`, dll.) ke dalam folder `src/components/ui/`.
3. **Komposisi Komponen:** Komponen domain pada `src/modules/` wajib mengimpor dan merakit (*compose*) komponen Shadcn UI dari `@/components/ui/`.

---

## 3. Penamaan Custom Hook

| Konvensi | Contoh |
|---|---|
| Prefix `use`, diikuti nama domain | `useDocuments`, `useUsers` |
| Untuk mutation: `use` + kata kerja + domain | `useUploadDocument`, `useVerifyDocument` |
| Untuk state UI: `use` + deskripsi state | `useDocumentFilters`, `useSelectedTab` |

```ts
// ✅ Benar
export function useDocuments(category?: ArchiveCategory) { ... }
export function useUploadDocument() { ... }
export function useDeleteDocument() { ... }

// ❌ Salah
export function fetchDocuments() { ... }     // bukan hook
export function documentHook() { ... }      // tidak ada prefix "use"
```

---

## 4. Penamaan Tipe & Interface TypeScript

| Elemen | Konvensi | Contoh |
|---|---|---|
| Domain types | PascalCase di `types.ts` | `DocumentRecord`, `DocumentType` |
| Enum | PascalCase | `DocumentStatus`, `Role` |
| Zod schema | camelCase + suffix `Schema` | `createUserSchema`, `uploadDocumentSchema` |
| API response wrapper | `ApiResponse<T>` di `lib/types.ts` | `ApiResponse<DocumentRecord>` |

```ts
// types.ts di modul
export interface DocumentRecord {
  id: string;
  status: DocumentStatus;
  // ...
}

// validation.ts di modul
export const uploadDocumentSchema = z.object({ ... });

// Tipe inferensi dari Zod
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
```

---

## 5. Folder Convention per Modul

```
modules/<nama-modul>/
├── service.ts        # Wajib ada. Logika bisnis, satu-satunya pintu resmi
├── repository.ts     # Wajib ada (kecuali dashboard). Query Prisma
├── validation.ts     # Wajib ada. Schema Zod untuk request
├── types.ts          # Wajib ada. Interface/type TypeScript
├── api.ts            # Wajib ada. Fungsi fetch() ke REST endpoint
├── hooks.ts          # Wajib ada. TanStack Query hooks
└── components/
    ├── <NamaView>.tsx          # Komponen halaman utama
    ├── <NamaForm>.tsx          # Form
    ├── <NamaTable>.tsx         # Tabel/list
    └── <NamaCard>.tsx          # Card/ringkasan
```

**Pengecualian:**
- Modul `dashboard` tidak punya `repository.ts` (tidak punya tabel sendiri).
- Jika `hooks.ts` sudah terlalu panjang, boleh dipecah jadi folder `hooks/` berisi beberapa file.

---

## 6. Import Convention

### Path Alias

**Selalu gunakan** `@/` untuk import dari `src/`:

```ts
// ✅ Benar
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { getUserById } from "@/modules/users/service";

// ❌ Salah — relative path ke atas folder
import { prisma } from "../../../lib/prisma";
```

### Urutan Import (aturan umum)

```ts
// 1. External packages
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// 2. Next.js / React
import { useState } from "react";
import Image from "next/image";

// 3. Internal shared libs
import { apiClient } from "@/lib/api-client";
import { logActivity } from "@/lib/security-log";

// 4. Modul lain (via service.ts)
import { getUserById } from "@/modules/users/service";

// 5. Modul ini sendiri
import { documentRepository } from "./repository";
import type { DocumentRecord } from "./types";
```

---

## 7. Error Handling

### Di API Route Handler

```ts
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createDocumentSchema.safeParse(body);
    
    if (!parsed.success) {
      return Response.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const result = await documentService.create(parsed.data);
    return Response.json({ data: result }, { status: 201 });
    
  } catch (error) {
    console.error("[POST /api/v1/documents]", error);
    return Response.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
```

### Di Service Layer

```ts
// service.ts melempar error dengan pesan yang jelas
export async function deleteDocument(id: string, requesterId: string) {
  const doc = await documentRepository.findById(id);
  
  if (!doc) throw new Error("Dokumen tidak ditemukan");
  if (doc.ownerId !== requesterId) throw new Error("Tidak memiliki akses ke dokumen ini");
  if (doc.status === "APPROVED") throw new Error("Dokumen yang sudah disetujui tidak bisa dihapus");
  
  await documentRepository.delete(id);
}
```

### Di Komponen / Hooks

```ts
// hooks.ts — gunakan onError callback
export function useDeleteDocument() {
  return useMutation({
    mutationFn: (id: string) => documentApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Dokumen berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error.message ?? "Gagal menghapus dokumen");
    },
  });
}
```

---

## 8. TanStack React Query Convention

### Query Key Pattern

```ts
// Di hooks.ts — query keys ditulis langsung, tidak perlu file terpisah
const documentKeys = {
  all: ["documents"] as const,
  list: (category?: string) => ["documents", category ?? "all"] as const,
  detail: (id: string) => ["documents", id] as const,
};
```

### useQuery Pattern

```ts
export function useDocuments(category?: ArchiveCategory) {
  return useQuery({
    queryKey: documentKeys.list(category),
    queryFn: () => documentApi.getAll(category),
    staleTime: 60_000,  // default dari QueryClient, tidak perlu ditulis ulang
  });
}
```

### useMutation Pattern

```ts
export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => documentApi.upload(formData),
    onSuccess: () => {
      // Invalidate semua cache dokumen
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
```

**Aturan:**
1. **Dilarang** `fetch()` atau `useEffect` manual di komponen untuk ambil data.
2. **Wajib** `invalidateQueries` di setiap mutation onSuccess.
3. Tidak perlu prefetch di server component — fetch di client sudah cukup untuk skala ini.

---

## 9. Prisma Convention

### Singleton Client

```ts
// src/lib/prisma.ts — SATU koneksi global
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Query di Repository

```ts
// repository.ts — hanya query Prisma, tidak ada logika bisnis
import { prisma } from "@/lib/prisma";
import type { DocumentStatus } from "@prisma/client";

export async function findDocumentsByOwner(ownerId: string, status?: DocumentStatus) {
  return prisma.documentRecord.findMany({
    where: {
      ownerId,
      ...(status ? { status } : {}),
    },
    include: {
      documentType: true,
      verifications: { orderBy: { reviewedAt: "desc" }, take: 1 },
    },
    orderBy: { uploadedAt: "desc" },
  });
}
```

---

## 10. Environment Variables

Penamaan `SCREAMING_SNAKE_CASE`:

| Variabel | Contoh | Keterangan |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Koneksi database |
| `AUTH_SECRET` | `random-secret` | Secret NextAuth |
| `NEXTAUTH_URL` | `http://localhost:3000` | URL aplikasi |
| `STORAGE_PROVIDER` | `local` / `s3` | Provider storage |
| `STORAGE_LOCAL_PATH` | `./uploads` | Path storage lokal |
| `STORAGE_S3_BUCKET` | `smdp-files` | Bucket S3 (jika pakai cloud) |

---

## 11. Checklist Sebelum Commit

- [ ] Tidak ada `fetch()` langsung di komponen — semua lewat `hooks.ts`
- [ ] `hooks.ts` hanya memanggil `api.ts` modul yang sama
- [ ] Route handler hanya memanggil `service.ts` modul yang sama
- [ ] Tidak ada import `repository.ts` dari modul lain
- [ ] Semua input divalidasi Zod sebelum diproses
- [ ] Aksi penting memanggil `logActivity()`
- [ ] Semua endpoint baru memakai prefix `/api/v1/`
- [ ] Nama file mengikuti konvensi §1-2
- [ ] Path alias `@/` digunakan (bukan relative path `../../`)
- [ ] `tsc --noEmit` lulus tanpa error
- [ ] Linter lulus tanpa error

---

## 12. React Component Architecture Rules

### Single Responsibility

Setiap component hanya memiliki satu tanggung jawab.

Jangan membuat component yang menangani terlalu banyak UI maupun business logic.

---

### Component Size

Usahakan satu component tetap kecil dan mudah dipahami.

Jika file mulai besar maka pecah menjadi component baru.

Contoh:

```
EmployeeForm
  ↓
  PersonalInformation
  EmploymentInformation
  AddressInformation
  EmergencyContact
  SubmitSection
```

---

### Extract Reusable Component

Apabila JSX mulai berulang, buat reusable component. Hindari copy paste.

---

### Data Driven UI

Jangan mengulang component secara manual:

```tsx
// ❌ Buruk
<Select>
    <Option />
    <Option />
    <Option />
</Select>

// ✅ Benar
<Select>
    {options.map(option => (
        <Option key={option.value} option={option} />
    ))}
</Select>
```

---

### data.ts / constants.ts

Apabila component dirender berdasarkan data, pisahkan data ke file `data.ts` atau `constants.ts`.

Data yang wajib dipisahkan:
- menu, sidebar, navigation, tabs
- select option, badge, status
- role, permission
- quick action, dashboard cards, statistic cards
- table columns, breadcrumb

Component hanya melakukan render — tidak mendefinisikan data di dalam JSX.

---

### Type Safety

Setiap data pada `data.ts` harus memiliki `interface` atau `type` yang jelas.

**Dilarang menggunakan `any`.**

---

### Enum Mapping

Jangan menggunakan `if` atau `switch` berulang. Gunakan mapping object.

```ts
// Contoh mapping object
const STATUS_CONFIG = { ... }
const ROLE_CONFIG = { ... }
const ARCHIVE_CATEGORY = { ... }
```

---

### Hardcoded UI

Hindari hardcode nilai di dalam JSX.

```tsx
// ❌ Buruk
<Button>KTP</Button>
<Button>KK</Button>
<Button>Ijazah</Button>

// ✅ Benar — gunakan mapping / data.ts
{documentTypes.map(doc => <Button key={doc.code}>{doc.name}</Button>)}
```

---

### Page Responsibility

`page.tsx` hanya bertugas:
- Authentication (cek sesi)
- Authorization (`requireRole()`)
- Server data fetching (jika ada)
- Render satu root component

Semua UI dipindahkan ke folder `components/` dalam modul terkait.

---

### Reusability

Selalu prioritaskan:
- **Reusable** — bisa dipakai ulang di tempat lain
- **Scalable** — mudah dikembangkan tanpa rombak besar
- **Maintainable** — mudah diperbaiki
- **Readable** — mudah dibaca developer baru

Dibanding solusi yang cepat tetapi sulit dipelihara.

---

## 13. Code Quality Rules

Selalu lakukan refactor apabila menemukan:
- Duplicate code
- Component terlalu besar
- Hardcoded data
- Repeated JSX
- Repeated logic
- Nested condition yang berlebihan
- Function terlalu panjang

**Tanpa mengubah behaviour aplikasi.**

---

## 14. Final Goal

Project harus memiliki karakteristik berikut:
- Mudah dipahami developer baru
- Mudah dipelihara
- Mudah dikembangkan
- Minim duplikasi kode
- Konsisten
- Modular
- Reusable
- Type Safe
- Mudah di-scale menjadi project besar

**Setiap perubahan yang dilakukan harus selalu mengarah ke tujuan tersebut.**
