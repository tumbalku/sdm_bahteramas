import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettingsApi, updateSettingsApi } from "./api";
import { UpdateSettingsInput } from "./types";
import { toast } from "sonner";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await getSettingsApi();
      if (!res.success || !res.data) {
        throw new Error(res.error || "Gagal mengambil data pengaturan");
      }
      return res.data;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => updateSettingsApi(input),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Pengaturan sistem berhasil diperbarui");
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      } else {
        toast.error(res.error || "Gagal memperbarui pengaturan");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Terjadi kesalahan saat memperbarui pengaturan");
    },
  });
}
