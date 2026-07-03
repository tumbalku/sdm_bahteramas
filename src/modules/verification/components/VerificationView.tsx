"use client";

import { useState } from "react";
import { usePendingDocuments, useApproveDocument, useRejectDocument } from "../hooks";
import { VerificationList } from "./VerificationList";
import { VerificationActionModal } from "./VerificationActionModal";
import { DocumentRecordDto } from "@/modules/documents/types";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export function VerificationView() {
  const { data: documents = [], isLoading } = usePendingDocuments();
  const approveMutation = useApproveDocument();
  const rejectMutation = useRejectDocument();

  const [selectedDocument, setSelectedDocument] = useState<DocumentRecordDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReviewClick = (doc: DocumentRecordDto) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleApprove = (docId: string) => {
    approveMutation.mutate(docId, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedDocument(null);
      },
    });
  };

  const handleReject = (docId: string, reason: string) => {
    rejectMutation.mutate({ id: docId, input: { reviewNote: reason } }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedDocument(null);
      },
    });
  };

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <PageHeader
        icon={ShieldCheck}
        title="Verifikasi Dokumen"
        description="Tinjau dan validasi dokumen pegawai yang berstatus PENDING"
      />

      <VerificationList
        documents={documents}
        isLoading={isLoading}
        onReview={handleReviewClick}
      />

      <VerificationActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDocument}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    </div>
  );
}
