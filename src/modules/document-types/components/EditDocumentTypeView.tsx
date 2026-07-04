"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Edit, ArrowLeft, Loader2 } from "lucide-react";
import { useDocumentType, useUpdateDocumentType } from "../hooks";
import { DocumentTypeForm, formStateToPayload, mapDocumentTypeToFormState } from "./DocumentTypeForm";

interface EditDocumentTypeViewProps {
  id: string;
}

export function EditDocumentTypeView({ id }: EditDocumentTypeViewProps) {
  const router = useRouter();
  const { data: initialData, isLoading, error } = useDocumentType(id);
  const updateMutation = useUpdateDocumentType();

  const handleCancel = () => {
    router.push("/document-types");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-10 h-10 mb-3 animate-spin opacity-50 text-primary" />
        <p className="text-sm font-medium">Memuat data jenis dokumen...</p>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl text-red-600 max-w-lg mx-auto mt-10">
        <p className="font-semibold">Gagal memuat jenis dokumen</p>
        <p className="text-sm mt-1 opacity-80">Data mungkin telah dihapus atau Anda tidak memiliki akses.</p>
        <Button
          variant="outline"
          onClick={handleCancel}
          className="mt-4 rounded-xl border-red-500/20 hover:bg-red-500/10 text-red-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6 pb-12 animate-fade-in">
      <PageHeader
        icon={Edit}
        title="Edit Jenis Dokumen"
        description="Ubah kriteria dan klasifikasi berkas kepegawaian."
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
          key={id} // force remount when id changes
          initialValues={mapDocumentTypeToFormState(initialData)}
          onSubmit={(values) =>
            updateMutation.mutate(
              { id, input: formStateToPayload(values) },
              {
                onSuccess: () => router.push("/document-types"),
              }
            )
          }
          isPending={updateMutation.isPending}
          submitLabel="Simpan Perubahan"
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
