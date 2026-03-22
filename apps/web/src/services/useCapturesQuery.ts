import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CapturesApi } from '@/generated';

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
  options?: any
) {
  return useQuery({
    queryKey: ['captures', params],
    queryFn: async () => {
      return capturesApi.apiV1CapturesGet(
        params?.video_id,
        params?.page,
        params?.limit,
      );
    },
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
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('video_id', data.video_id.toString());

      return capturesApi.apiV1CapturesPost(
        data.file,
        data.video_id
    );
    },
    onSuccess: () => {
      // キャプチャリスト情報を無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ['captures'] });
    },
  });
}