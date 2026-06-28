"use client";

import { useState } from "react";
import { usePendingDocuments, useApproveDocument, useRejectDocument } from "../hooks";
import { VerificationList } from "./VerificationList";
import { VerificationActionModal } from "./VerificationActionModal";
import { DocumentRecordDto } from "@/modules/documents/types";
import { ShieldCheck } from "lucide-react";

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Verifikasi Dokumen
          </h2>
          <p className="text-muted-foreground mt-1">
            Tinjau dan validasi dokumen pegawai yang berstatus PENDING
          </p>
        </div>
      </div>

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
