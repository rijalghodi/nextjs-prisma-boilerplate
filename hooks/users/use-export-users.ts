import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { BaseResponse } from "@/types/response";
import { apiFetch } from "@/lib/api";
import { downloadFileFromUrl } from "@/lib/dom";

interface ExportUsersParams {
  fileType: "excel" | "pdf";
}

export const useExportUsers = () => {
  return useMutation({
    mutationFn: async (params: ExportUsersParams) => {
      const res = await apiFetch<BaseResponse<{ url: string }>>("/api/users/export", {
        queryParams: {
          fileType: params.fileType,
        },
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (data?.url) {
        const ext = variables.fileType === "pdf" ? "pdf" : "xlsx";
        downloadFileFromUrl(data.url, `daftar-pengguna.${ext}`);
        toast.success("Daftar Pengguna berhasil diekspor.");
      }
    },
    onError: () => {
      toast.error("Gagal mengekspor laporan pengguna.");
    },
  });
};
