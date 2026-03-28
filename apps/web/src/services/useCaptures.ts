import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CapturesApi, type DtoCaptureListResponse, type EntityCapture } from "@/generated";

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

