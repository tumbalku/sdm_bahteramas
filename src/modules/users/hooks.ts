"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUserApi, deleteUserApi, getUsersApi, updateUserApi } from "./api";
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
