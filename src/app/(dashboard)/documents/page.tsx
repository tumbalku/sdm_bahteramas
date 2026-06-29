import { Metadata } from "next";
import { DocumentsView } from "@/modules/documents/components/DocumentsView";

export const metadata: Metadata = {
  title: "Manajemen Dokumen | SIMDP",
  description: "Kelola dokumen arsip kepegawaian Anda",
};

export default function DocumentsPage() {
  return (
    <div className="page-container">
      <DocumentsView />
    </div>
  );
}
