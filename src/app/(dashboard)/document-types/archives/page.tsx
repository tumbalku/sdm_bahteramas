import { requireRole } from "@/lib/auth-utils";
import { AllUserArchivesView } from "@/modules/document-types/components/AllUserArchivesView";

export default async function DocumentArchivesPage() {
  // Hanya role ADMIN yang boleh mengakses Halaman Rekapitulasi Arsip Pegawai
  await requireRole(["ADMIN"]);

  return <AllUserArchivesView />;
}
