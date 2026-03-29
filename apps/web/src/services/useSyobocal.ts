import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SyobocalApi, type DtoSyobocalTitleSearchResponse, type DtoSyobocalSaveTitleRequest, type DtoSyobocalSaveTitleResponse } from "@/generated";
import Message from "@/message";

// APIクライアントのセットアップ
const syobocalApi = new SyobocalApi();

/**
 * Syobocal タイトル検索クエリ
 * @param title - 検索するタイトル
 * @param options - useQuery オプション
 */
export function useSearchSyobocalQuery(
  title: string,
  options?: any,
) {
  return useQuery<DtoSyobocalTitleSearchResponse>({
    queryKey: ["syobocal-search", title],
    queryFn: async () => {
      const response = await syobocalApi.apiV1SyobocalGet(title);
      return response.data;
    },
    enabled: !!title && title.length > 0,
    staleTime: 1000 * 60, // 1分
    retry: 1,
    ...options,
  });
}

/**
 * Syobocal タイトルを Series に保存するミューテーション
 */
export function useSaveSyobocalTitleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DtoSyobocalSaveTitleRequest) => {
      const response = await syobocalApi.apiV1SyobocalPost(data);
      return response.data;
    },
    onSuccess: (data) => {
      // シリーズリスト情報を無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ["series"] });
      Message.success(`「${data.message}」`);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Syobocal タイトルの保存に失敗しました";
      Message.error(errorMessage);
    },
  });
}
