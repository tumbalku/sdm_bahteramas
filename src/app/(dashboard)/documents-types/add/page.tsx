import { Metadata } from "next";
import { requireRole } from "@/lib/auth-utils";
import { AddDocumentTypeView } from "@/modules/document-types/components/AddDocumentTypeView";

export const metadata: Metadata = {
  title: "Tambah Jenis Dokumen | SIMDP",
  description: "Buat kriteria dan jenis dokumen kepegawaian baru",
};

export default async function AddDocumentTypePagePlural() {
  await requireRole(["ADMIN"]);

  return <AddDocumentTypeView />;
}
