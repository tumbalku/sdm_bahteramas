"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginApi, logoutApi, verifyPasswordApi } from "./api";
import { LoginCredentials } from "./types";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await loginApi(credentials);
      if (!res.success) {
        throw new Error(res.error || "Gagal masuk ke sistem");
      }
      return res;
    },
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh();
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await logoutApi();
    },
  });
}

export function useVerifyPassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const res = await verifyPasswordApi(password);
      if (!res.success) {
        throw new Error(res.error || "Gagal memverifikasi kata sandi");
      }
      return res.data;
    },
  });
}
