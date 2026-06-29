import { Metadata } from "next";
import { requireRole } from "@/lib/auth-utils";
import { AddDocumentTypeView } from "@/modules/document-types/components/AddDocumentTypeView";

export const metadata: Metadata = {
  title: "Tambah Jenis Dokumen | SMDP Portal",
  description: "Buat kriteria dan jenis dokumen kepegawaian baru",
};

export default async function AddDocumentTypePage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="page-container">
      <AddDocumentTypeView />
    </div>
  );
}
