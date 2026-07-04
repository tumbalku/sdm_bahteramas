"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { FilePlus, ArrowLeft } from "lucide-react";
import { useCreateDocumentType } from "../hooks";
import { DocumentTypeForm, formStateToPayload } from "./DocumentTypeForm";

export function AddDocumentTypeView() {
  const router = useRouter();
  const createMutation = useCreateDocumentType();

  const handleCancel = () => {
    router.push("/document-types");
  };

  return (
    <div className="page-container space-y-6 pb-12 animate-fade-in">
      <PageHeader
        icon={FilePlus}
        title="Tambah Dokumen"
        description="Buat kriteria dan klasifikasi berkas kepegawaian baru."
        action={
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-full px-5 border-border hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <DocumentTypeForm
          onSubmit={(values) =>
            createMutation.mutate(formStateToPayload(values), {
              onSuccess: () => router.push("/document-types"),
            })
          }
          isPending={createMutation.isPending}
          submitLabel="Simpan Dokumen"
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
