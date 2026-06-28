import { requireRole } from "@/lib/auth-utils";
import { DocumentTypesView } from "@/modules/document-types/components/DocumentTypesView";

export default async function DocumentTypesPage() {
  // Hanya role ADMIN yang boleh mengakses Halaman Master Jenis Dokumen
  await requireRole(["ADMIN"]);

  return <DocumentTypesView />;
}
