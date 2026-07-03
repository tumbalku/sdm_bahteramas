import { Metadata } from "next";
import { requireRole } from "@/lib/auth-utils";
import { EditDocumentTypeView } from "@/modules/document-types/components/EditDocumentTypeView";

export const metadata: Metadata = {
  title: "Edit Jenis Dokumen | SIMDP",
  description: "Ubah kriteria dan jenis dokumen kepegawaian",
};

export default async function EditDocumentTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;

  return <EditDocumentTypeView id={id} />;
}
