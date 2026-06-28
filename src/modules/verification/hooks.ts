import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { verificationApi } from "./api";
import { RejectDocumentInput } from "./types";
import { toast } from "sonner";

export const verificationKeys = {
  all: ["verification"] as const,
  pending: () => [...verificationKeys.all, "pending"] as const,
  history: (id: string) => [...verificationKeys.all, "history", id] as const,
};

export function usePendingDocuments() {
  return useQuery({
    queryKey: verificationKeys.pending(),
    queryFn: () => verificationApi.getPendingDocuments(),
  });
}

export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => verificationApi.approveDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.pending() });
      toast.success("Dokumen berhasil disetujui");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menyetujui dokumen");
    },
  });
}

export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RejectDocumentInput }) =>
      verificationApi.rejectDocument(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.pending() });
      toast.success("Dokumen berhasil ditolak");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menolak dokumen");
    },
  });
}

export function useDocumentVerificationHistory(documentId: string) {
  return useQuery({
    queryKey: verificationKeys.history(documentId),
    queryFn: () => verificationApi.getDocumentHistory(documentId),
    enabled: !!documentId,
  });
}
