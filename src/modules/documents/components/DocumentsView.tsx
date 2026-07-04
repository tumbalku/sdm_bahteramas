"use client";

import { useState, useMemo, useEffect } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useDocuments, useUploadDocument, useDeleteDocument } from "../hooks";
import { useDocumentTypes } from "@/modules/document-types/hooks";
import { DocumentTabs, TabStat } from "./DocumentTabs";
import { DocumentList } from "./DocumentList";
import { DocumentUploadModal } from "./DocumentUploadModal";
import { LayeredDeleteModal } from "@/components/LayeredDeleteModal";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText } from "lucide-react";
import { DocumentUploadInput, DocumentRecordDto } from "../types";
import { PageHeader } from "@/components/PageHeader";
import { CompletenessCard } from "@/components/CompletenessCard";
import { canManageOwnDocuments } from "@/lib/rbac";

export function DocumentsView() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<DocumentArchiveCategory>("UTAMA");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentRecordDto | null>(null);
  const [docToReplace, setDocToReplace] = useState<DocumentRecordDto | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentUserRole = (session?.user as any)?.role || "EMPLOYEE";
  const currentUserId = (session?.user as any)?.id || "";

  // Fetch all user documents and master document types applicable for this employee
  const { data: allDocuments = [], isLoading: isLoadingDocs } = useDocuments({});
  const { data: allDocTypes = [] } = useDocumentTypes({ forUser: true });

  const activeDocuments = isMounted ? allDocuments : [];
  const activeDocTypes = isMounted ? allDocTypes : [];
  const showLoading = !isMounted || isLoadingDocs;

  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  // Filter documents for the currently active tab
  const currentTabDocuments = useMemo(() => {
    return activeDocuments.filter(
      (doc) => doc.documentType?.archiveCategory === activeTab
    );
  }, [activeDocuments, activeTab]);

  // Calculate completeness stats per category (only count APPROVED documents)
  const stats = useMemo(() => {
    const categories: DocumentArchiveCategory[] = ["UTAMA", "KONDISIONAL", "PROFESI"];

    return categories.reduce((acc, cat) => {
      const typesInCategory = activeDocTypes.filter((dt) => dt.archiveCategory === cat);
      const total = typesInCategory.length;

      const approvedDocsInCategory = activeDocuments.filter(
        (d) => d.documentType?.archiveCategory === cat && d.status === "APPROVED"
      );
      const approvedTypeIds = new Set(approvedDocsInCategory.map((d) => d.documentTypeId));
      const uploaded = approvedTypeIds.size;

      const percentage = total > 0 ? Math.min(100, Math.round((uploaded / total) * 100)) : 0;

      acc[cat] = { uploaded, total, percentage };
      return acc;
    }, {} as Record<DocumentArchiveCategory, TabStat>);
  }, [activeDocuments, activeDocTypes]);

  // Calculate overall completeness across all categories
  const overallStats = useMemo(() => {
    const total = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
    const uploaded = Object.values(stats).reduce((sum, s) => sum + s.uploaded, 0);
    const percentage = total > 0 ? Math.min(100, Math.round((uploaded / total) * 100)) : 0;
    return { uploaded, total, percentage };
  }, [stats]);

  const handleUploadSubmit = (input: DocumentUploadInput) => {
    uploadMutation.mutate(input, {
      onSuccess: () => {
        setIsUploadModalOpen(false);
        setDocToReplace(null);
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    deleteMutation.mutate(docToDelete.id, {
      onSuccess: () => {
        setDocToDelete(null);
      },
    });
  };

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <PageHeader
        icon={FileText}
        title="Manajemen Dokumen"
        description="Kelola arsip kepegawaian dan persyaratan profesi"
        action={
          canManageOwnDocuments(currentUserRole) && (
            <Button
              onClick={() => {
                setDocToReplace(null);
                setIsUploadModalOpen(true);
              }}
              className="rounded-xl px-6"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Unggah Dokumen
            </Button>
          )
        }
      />

      {/* Modern Overall Completeness Card */}
      <CompletenessCard
        uploaded={overallStats.uploaded}
        total={overallStats.total}
        percentage={overallStats.percentage}
      />

      {/* Tabs with exact completion indicators */}
      <DocumentTabs activeTab={activeTab} onChange={setActiveTab} stats={stats} />

      <DocumentList
        documents={currentTabDocuments}
        isLoading={showLoading}
        onDelete={(doc) => setDocToDelete(doc)}
        onReplace={(doc) => {
          if (doc.documentType?.archiveCategory) {
            setActiveTab(doc.documentType.archiveCategory);
          }
          setDocToReplace(doc);
          setIsUploadModalOpen(true);
        }}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
      />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setDocToReplace(null);
        }}
        onSubmit={handleUploadSubmit}
        isLoading={uploadMutation.isPending}
        activeCategory={activeTab}
        existingDocuments={activeDocuments}
        replacementDocument={docToReplace}
      />

      <LayeredDeleteModal
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Dokumen Berkas"
        itemName={docToDelete?.fileName || ""}
        itemType="dokumen berkas"
        impactDetails={[
          "File dokumen fisik akan dihapus dari server penyimpanan.",
          "Riwayat verifikasi dan status persetujuan dokumen ini akan hilang permanen.",
          "Persentase kelengkapan berkas Anda akan berkurang secara otomatis.",
        ]}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
