import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DtoFolderListResponse } from "@/generated";
import { FoldersApi } from "@/generated";
import Message from "@/message";

// APIクライアントのセットアップ
const foldersApi = new FoldersApi();

/**
 * 監視対象フォルダ一覧を取得
 */
export function useFoldersQuery(options?: any) {
  return useQuery<DtoFolderListResponse>({
    queryKey: ["folders"],
    queryFn: async () => {
      const response = await foldersApi.apiV1FoldersGet();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

/**
 * フォルダを追加するミューテーション
 */
export function useAddFolderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (path: string) => {
      const response = await foldersApi.apiV1FoldersPost({ path });
      return response.data;
    },
    onSuccess: (data) => {
      // フォルダリスト情報を無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      Message.success("フォルダを追加しました");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "フォルダの追加に失敗しました";
      Message.error(errorMessage);
    },
  });
}

/**
 * フォルダを削除するミューテーション
 */
export function useDeleteFolderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await foldersApi.apiV1FoldersIdDelete(id);
      return response.data;
    },
    onSuccess: () => {
      // フォルダリスト情報を無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      Message.success("フォルダを削除しました");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "フォルダの削除に失敗しました";
      Message.error(errorMessage);
    },
  });
}
