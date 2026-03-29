import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DtoSeriesListResponse, DtoSeriesWithVideosResponse } from "@/generated";
import { SeriesApi } from "@/generated";
import Message from "@/message";

// APIクライアントのセットアップ
const seriesApi = new SeriesApi();

/**
 * シリーズ一覧を取得
 */
export function useSeriesQuery(options?: any) {
  return useQuery<DtoSeriesListResponse, Error>({
    queryKey: ["series"],
    queryFn: async () => {
      try {
        const response = await seriesApi.apiV1SeriesGet();
        return response.data;
      } catch (error) {
        console.error('Error fetching series:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    ...options,
  });
}

/**
 * シリーズの詳細情報と関連動画を取得
 */
export function useSeriesDetailQuery(seriesId: number | null, options?: any) {
  return useQuery<DtoSeriesWithVideosResponse, Error>({
    queryKey: ["series", seriesId],
    queryFn: async () => {
      if (!seriesId) {
        throw new Error("Series ID is required");
      }
      try {
        const response = await seriesApi.apiV1SeriesIdGet(seriesId);
        return response.data;
      } catch (error) {
        console.error('Error fetching series detail:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!seriesId,
    ...options,
  });
}

/**
 * シリーズを再同期するミューテーション
 */
export function useResyncSeriesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await seriesApi.apiV1SeriesResyncPost();
      return response.data;
    },
    onSuccess: () => {
      // シリーズリスト情報を無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ["series"] });
      Message.success("シリーズを再同期しました");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "シリーズの再同期に失敗しました";
      Message.error(errorMessage);
    },
  });
}
