import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { CapturesApi, type DtoCaptureListResponse, type EntityCapture } from "@/generated";
import { useCapturesStore } from "@/stores/captures-store";

// APIクライアントのセットアップ
const capturesApi = new CapturesApi();
/**
 * キャプチャ一覧を取得
 */
export function useCapturesQuery(
  params?: {
    video_id?: number;
    page?: number;
    limit?: number;
  },
  options?: any,
) {
  return useQuery<DtoCaptureListResponse>({
    queryKey: ["captures", params],
    queryFn: async () => {
      const response = await capturesApi.apiV1CapturesGet(
        params?.video_id,
        params?.page,
        params?.limit,
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

/**
 * キャプチャを無限ページネーションで取得
 */
export function useCapturesInfiniteQuery(
  params?: {
    video_id?: number;
    limit?: number;
  },
  options?: any,
) {
  return useInfiniteQuery({
    queryKey: ["captures", "infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const response = await capturesApi.apiV1CapturesGet(
        params?.video_id,
        page,
        params?.limit || 12,
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      // 最後のページで合計ページ数に達していれば、次のページは無い
      const currentPage = lastPage.pagination?.page || 1;
      const totalPages = lastPage.pagination?.total_pages || 0;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

/**
 * キャプチャをIDで取得
 */
export function useGetCaptureByIdQuery(
  id: number,
  options?: any,
) {
  return useQuery<EntityCapture>({
    queryKey: ["captures", id],
    queryFn: async () => {
      const response = await capturesApi.apiV1CapturesIdGet(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

/**
 * キャプチャを作成するミューテーション
 */
export function useCreateCaptureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { file: File; video_id: number }) => {
      const response = await capturesApi.apiV1CapturesPost(data.file, data.video_id);
      return response.data;
    },
    onSuccess: () => {
      // キャプチャリスト情報を無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ["captures"] });
    },
  });
}

/**
 * キャプチャを削除するミューテーション
 */
export function useDeleteCaptureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await capturesApi.apiV1CapturesIdDelete(id);
      return response.data;
    },
    onSuccess: () => {
      // キャプチャリスト情報を無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ["captures"] });
    },
  });
}

/**
 * 前後のキャプチャを取得するカスタムフック
 * キャッシュから前後を探し、キャッシュにない場合はAPIで次のページを取得
 */
export function useGetAdjacentCapture(captureId: number) {
  const { captureList, sortKey, sortOrder, limit } = useCapturesStore();
  const queryClient = useQueryClient();

  // キャッシュからインデックスを取得
  const currentIndex = captureList.findIndex((c) => c.id === captureId);

  const previousCapture = currentIndex > 0 ? captureList[currentIndex - 1] : null;
  const nextCapture = currentIndex < captureList.length - 1 ? captureList[currentIndex + 1] : null;

  const canLoadMore = currentIndex === captureList.length - 1 && currentIndex >= 0;

  /**
   * 次のページを取得する関数
   */
  const loadNextPage = async () => {
    try {
      const nextPage = Math.floor(captureList.length / limit) + 1;
      const response = await capturesApi.apiV1CapturesGet(undefined, nextPage, limit);
      
      if (response.data?.data && response.data.data.length > 0) {
        // ストアに追加
        useCapturesStore.getState().addCaptures(response.data.data);
        return response.data.data[0]; // 最初のキャプチャを返す
      }
      return null;
    } catch (error) {
      console.error("Failed to load next page:", error);
      return null;
    }
  };

  return {
    previousCapture,
    nextCapture,
    canLoadMore,
    loadNextPage,
  };
}

