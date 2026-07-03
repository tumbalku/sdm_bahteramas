"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserApi,
  deleteUserApi,
  downloadUsersImportTemplateApi,
  exportUserDocumentsCsvApi,
  exportUsersApi,
  getUsersApi,
  importUsersApi,
  updateUserApi,
  getUserApi,
} from "./api";
import { CreateUserInput, UpdateUserInput, UserFilter } from "./types";

export function useUsers(filters?: UserFilter) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const res = await getUsersApi(filters);
      if (!res.success) {
        throw new Error(res.error || "Gagal mengambil data pegawai");
      }
      return res.data || [];
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getUserApi(id);
      if (!res.success) {
        throw new Error(res.error || "Gagal mengambil data pegawai");
      }
      return res.data;
    },
    enabled: !!id,
  });
}

export function useMasterCategories() {
  return useQuery({
    queryKey: ["users", "categories"],
    queryFn: async () => {
      const res = await fetch("/api/v1/users/categories", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memuat data master kategori");
      }
      return json.data;
    },
    staleTime: 0,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const res = await createUserApi(input);
      if (!res.success) {
        throw new Error(res.error || "Gagal membuat pegawai baru");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateUserInput }) => {
      const res = await updateUserApi(id, input);
      if (!res.success) {
        throw new Error(res.error || "Gagal meng-update data pegawai");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteUserApi(id);
      if (!res.success) {
        throw new Error(res.error || "Gagal menghapus pegawai");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useImportUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const res = await importUsersApi(file);
      if (!res.success && !res.data) {
        throw new Error(res.error || "Gagal mengimport pegawai");
      }
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.createdCount) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
  });
}

export function useDownloadUsersImportTemplate() {
  return useMutation({
    mutationFn: () => downloadUsersImportTemplateApi(),
  });
}

export function useExportUsers(filters?: UserFilter) {
  return useMutation({
    mutationFn: () => exportUsersApi(filters),
  });
}

export function useExportUserDocumentsCsv(userId: string) {
  return useMutation({
    mutationFn: () => exportUserDocumentsCsvApi(userId),
  });
}
