import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VideosApi } from "@/generated";
import Message from "@/message";

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
    year?: number | null;
    limit?: number;
    sort?: "created_at" | "views" | "file_name" | "duration" | "jikkyo_date";
    order?: "asc" | "desc";
  },
  options?: any,
) {
  return useQuery({
    queryKey: ["videos", params],
    queryFn: async () => {
      // IDsをコンマ区切り文字列に変換
      const idsString = params?.ids && params.ids.length > 0 
        ? params.ids.join(",")
        : undefined;
      
      const response = await videosApi.apiV1VideosGet(
        idsString,
        params?.filterBy,
        params?.year ?? undefined,
        params?.page,
        params?.limit,
        params?.sort as any,
        params?.order as any,
      );
      return response.data;
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
      const response = await videosApi.apiV1VideosSearchGet(
        q,
        params?.page,
        params?.limit,
        params?.order as any,
        params?.filterBy,
      );
      return response.data;
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
      if (!id) {
        Message.error("ビデオIDが必要です");
        throw new Error("Video ID is required");
      }
      const response = await videosApi.apiV1VideosIdGet(id);
      return response.data;
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
      const response = await videosApi.apiV1VideosIdThumbnailRegeneratePost(
        data.id,
        {
          width: data.width,
          height: data.height,
          timestamp: data.timestamp,
        },
      );
      return response.data;
    },
    onSuccess: (_response: any, variables: { id: number; width?: number; height?: number; timestamp?: number }) => {
      // ビデオの詳細情報を無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ["video", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

/**
 * ビデオの年一覧を取得
 */
export function useVideoYearsQuery(options?: any) {
  return useQuery({
    queryKey: ["video-years"],
    queryFn: async () => {
      const response = await videosApi.apiV1VideosYearsGet();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 60, // 1時間
    ...options,
  });
}

/**
 * ビデオをダウンロードするクエリ
 * 自動ダウンロード用の関数
 */
export function useVideoDownload() {
  return async (id: number, filename?: string) => {
    try {
      const response = await videosApi.apiV1VideosIdDownloadGet(id);

      // ブラウザでダウンロード処理
      const url = window.URL.createObjectURL(response.data as unknown as Blob);
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
