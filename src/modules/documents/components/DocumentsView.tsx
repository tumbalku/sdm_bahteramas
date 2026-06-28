"use client";

import { useState } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useDocuments, useUploadDocument, useDeleteDocument } from "../hooks";
import { DocumentTabs } from "./DocumentTabs";
import { DocumentList } from "./DocumentList";
import { DocumentUploadModal } from "./DocumentUploadModal";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText } from "lucide-react";
import { DocumentUploadInput } from "../types";

export function DocumentsView() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<DocumentArchiveCategory>("UTAMA");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const currentUserRole = session?.user?.role || "EMPLOYEE";
  const currentUserId = session?.user?.id || "";

  const { data: documents = [], isLoading } = useDocuments({
    archiveCategory: activeTab,
  });

  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Manajemen Dokumen
          </h2>
          <p className="text-muted-foreground mt-1">
            Kelola arsip kepegawaian dan persyaratan profesi
          </p>
        </div>
        
        {/* Hanya EMPLOYEE yang upload dokumennya sendiri (atau ADMIN jika nanti diperlukan) */}
        {(currentUserRole === "EMPLOYEE" || currentUserRole === "ADMIN") && (
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="rounded-xl px-6"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Unggah Dokumen
          </Button>
        )}
      </div>

      <DocumentTabs activeTab={activeTab} onChange={setActiveTab} />

      <DocumentList
        documents={documents}
        isLoading={isLoading}
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
