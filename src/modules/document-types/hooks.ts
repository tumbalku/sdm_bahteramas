"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDocumentTypeApi,
  deleteDocumentTypeApi,
  getDocumentTypesApi,
  updateDocumentTypeApi,
} from "./api";
import {
  CreateDocumentTypeInput,
  DocumentTypeFilter,
  UpdateDocumentTypeInput,
} from "./types";

export function useDocumentTypes(filters?: DocumentTypeFilter) {
  return useQuery({
    queryKey: ["document-types", filters],
    queryFn: async () => {
      const res = await getDocumentTypesApi(filters);
      if (!res.success) {
        throw new Error(res.error || "Gagal mengambil jenis dokumen");
      }
      return res.data || [];
    },
  });
}

export function useCreateDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDocumentTypeInput) => {
      const res = await createDocumentTypeApi(input);
      if (!res.success) {
        throw new Error(res.error || "Gagal menambah jenis dokumen");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
    },
  });
}

export function useUpdateDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateDocumentTypeInput;
    }) => {
      const res = await updateDocumentTypeApi(id, input);
      if (!res.success) {
        throw new Error(res.error || "Gagal mengubah jenis dokumen");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
    },
  });
}

export function useDeleteDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteDocumentTypeApi(id);
      if (!res.success) {
        throw new Error(res.error || "Gagal menghapus jenis dokumen");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
    },
  });
}
