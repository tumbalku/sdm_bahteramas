import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "./api";
import { DocumentFilterDto, DocumentUploadInput } from "./types";
import { toast } from "sonner";

export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filters: DocumentFilterDto) => [...documentKeys.lists(), filters] as const,
  detail: (id: string) => [...documentKeys.all, "detail", id] as const,
};

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentApi.getDocument(id),
    enabled: Boolean(id),
  });
}

export function useDocuments(filters: DocumentFilterDto) {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: () => documentApi.getDocuments(filters),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DocumentUploadInput) => documentApi.uploadDocument(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success("Dokumen berhasil diunggah");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengunggah dokumen");
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success("Dokumen berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menghapus dokumen");
    },
  });
}
