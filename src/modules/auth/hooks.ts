"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginApi, logoutApi } from "./api";
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
