import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VideosApi } from "@/generated";

// APIクライアントのセットアップ
const videosApi = new VideosApi();

/**
 * ビデオ一覧を取得するクエリ
 */
export function useVideosQuery(
  params?: {
    ids?: number[];
    filterBy?: string;
    page?: number;
    limit?: number;
    sort?: "created_at" | "views" | "file_name" | "duration";
    order?: "asc" | "desc";
  },
  options?: any,
) {
  return useQuery({
    queryKey: ["videos", params],
    queryFn: async () => {
      return videosApi.apiV1VideosGet(
        params?.ids,
        params?.filterBy,
        params?.page,
        params?.limit,
        params?.sort,
        params?.order,
      );
    },
    staleTime: 1000 * 60 * 5, // 5分
    ...options,
  });
}

/**
 * ビデオ検索クエリ
 */
export function useSearchVideosQuery(
  q: string,
  params?: {
    page?: number;
    limit?: number;
    order?: "asc" | "desc";
    filterBy?: string;
  },
  options?: any,
) {
  return useQuery({
    queryKey: ["videos-search", q, params],
    queryFn: async () => {
      return videosApi.apiV1VideosSearchGet(
        q,
        params?.page,
        params?.limit,
        params?.order,
        params?.filterBy,
      );
    },
    enabled: !!q, // qが指定された時のみ実行
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

/**
 * 単一ビデオの詳細情報を取得
 */
export function useVideoQuery(id: number | null, options?: any) {
  return useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      if (!id) throw new Error("Video ID is required");
      return videosApi.apiV1VideosIdGet(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

/**
 * サムネイルを再生成するミューテーション
 */
export function useRegenerateThumbnailMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: number;
      width?: number;
      height?: number;
      timestamp?: number;
    }) => {
      return videosApi.apiV1VideosIdThumbnailRegeneratePost(data.id, {
        width: data.width,
        height: data.height,
        timestamp: data.timestamp,
      });
    },
    onSuccess: (response: any, variables) => {
      // ビデオの詳細情報を無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ["video", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

/**
 * ビデオをダウンロードするクエリ
 * 自動ダウンロード用の関数
 */
export function useVideoDownload() {
  return async (id: number, filename?: string) => {
    try {
      const response = await videosApi.apiV1VideosIdDownloadGet(id );

      // ブラウザでダウンロード処理
      const url = window.URL.createObjectURL(response.data as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `video_${id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download video:", error);
      throw error;
    }
  };
}
