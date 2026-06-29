"use client";

import { useState, useMemo } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useDocuments, useUploadDocument, useDeleteDocument } from "../hooks";
import { useDocumentTypes } from "@/modules/document-types/hooks";
import { DocumentTabs, TabStat } from "./DocumentTabs";
import { DocumentList } from "./DocumentList";
import { DocumentUploadModal } from "./DocumentUploadModal";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { DocumentUploadInput } from "../types";
import { PageHeader } from "@/components/PageHeader";
import { CompletenessCard } from "@/components/CompletenessCard";

export function DocumentsView() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<DocumentArchiveCategory>("UTAMA");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const currentUserRole = session?.user?.role || "EMPLOYEE";
  const currentUserId = session?.user?.id || "";

  // Fetch all user documents and master document types
  const { data: allDocuments = [], isLoading: isLoadingDocs } = useDocuments({});
  const { data: allDocTypes = [] } = useDocumentTypes();

  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  // Filter documents for the currently active tab
  const currentTabDocuments = useMemo(() => {
    return allDocuments.filter(
      (doc) => doc.documentType?.archiveCategory === activeTab
    );
  }, [allDocuments, activeTab]);

  // Calculate completeness stats per category (only count APPROVED documents)
  const stats = useMemo(() => {
    const categories: DocumentArchiveCategory[] = ["UTAMA", "KONDISIONAL", "PROFESI"];

    return categories.reduce((acc, cat) => {
      const typesInCategory = allDocTypes.filter((dt) => dt.archiveCategory === cat);
      const total = typesInCategory.length;

      const approvedDocsInCategory = allDocuments.filter(
        (d) => d.documentType?.archiveCategory === cat && d.status === "APPROVED"
      );
      const approvedTypeIds = new Set(approvedDocsInCategory.map((d) => d.documentTypeId));
      const uploaded = approvedTypeIds.size;

      const percentage = total > 0 ? Math.min(100, Math.round((uploaded / total) * 100)) : 0;

      acc[cat] = { uploaded, total, percentage };
      return acc;
    }, {} as Record<DocumentArchiveCategory, TabStat>);
  }, [allDocuments, allDocTypes]);

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
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={FileText}
        title="Manajemen Dokumen"
        description="Kelola arsip kepegawaian dan persyaratan profesi"
        action={
          (currentUserRole === "EMPLOYEE" ||
            currentUserRole === "ADMIN" ||
            currentUserRole === "STAFF") && (
            <Button
              onClick={() => setIsUploadModalOpen(true)}
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
        isLoading={isLoadingDocs}
        onDelete={handleDelete}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
      />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
        isLoading={uploadMutation.isPending}
        activeCategory={activeTab}
      />
    </div>
  );
}
