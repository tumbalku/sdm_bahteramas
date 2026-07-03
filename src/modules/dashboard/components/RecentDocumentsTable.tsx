import { DocumentSummaryTable } from "@/modules/documents/components/DocumentSummaryTable";
import { DocumentRecordDto } from "@/modules/documents/types";

interface RecentDocumentsTableProps {
  documents: DocumentRecordDto[];
}

export function RecentDocumentsTable({ documents }: RecentDocumentsTableProps) {
  return (
    <DocumentSummaryTable
      documents={documents}
      context="dashboard"
      title="Dokumen Terbaru"
      emptyText="Belum ada dokumen yang diunggah."
      showOwner
      showViewAllLink
    />
  );
}
