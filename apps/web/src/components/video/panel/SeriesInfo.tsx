"use client";

import React from "react";
import { useRouter } from "@tanstack/react-router";
import { EntityVideo } from "@/generated";
import { useSeriesDetailQuery } from "@/services/useSeries";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ChevronRight, Play } from "lucide-react";
import { formatVideoDateTimeWithDuration, formatDateTimeJP } from "@/lib/format";

interface SeriesInfoProps {
  /**ビデオデータ */
  video?: EntityVideo;
}

/**
 * シリーズ情報表示コンポーネント
 * series_idからシリーズ情報と関連動画を取得
 * シリーズ内の動画リストを表示し、クリックで動画に移動できる
 */
const SeriesInfo: React.FC<SeriesInfoProps> = ({ video }) => {
  const router = useRouter();
  const seriesId = video?.series_id ?? null;

  // シリーズIDから詳細情報を取得
  const { data: seriesData, isLoading, error } = useSeriesDetailQuery(seriesId);

  // ローディング中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  // エラー時
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-muted-foreground">
        <p>シリーズ情報の読み込みに失敗しました</p>
      </div>
    );
  }

  // シリーズデータがない場合
  if (!seriesData || !seriesData.series) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-muted-foreground">
        シリーズ情報がありません
      </div>
    );
  }

  const series = seriesData.series;
  const videos = seriesData.videos ?? [];

  const handleVideoClick = async (videoId: number) => {
    if (videoId === video?.id) {
      return; // 同じ動画の場合は何もしない
    }
    // ビデオページへ移動
    await router.navigate({ to: `/videos/${videoId}` });
  };

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {/* シリーズ情報 */}
      <div className="flex">
        <p className="text-xs text-muted-foreground">
          {series.syobocal_title_name || series.series_name_file || "未設定"}
        </p>
        <p>&nbsp;&nbsp;&nbsp;</p>
              {/* 放映期間 */}
      {(series.first_year || series.first_end_year) && (
          <p className="text-xs text-muted-foreground">
            {series.first_year}年{series.first_month ? `${series.first_month}月` : ""}
            {series.first_end_year ? ` ～ ${series.first_end_year}年${series.first_end_month ? `${series.first_end_month}月` : ""}` : ""}
          </p>
      )}
      </div>

      {/* シリーズ内の動画リスト */}
      {videos.length > 0 && (
        <div className="space-y-1">
          <h3 className="font-semibold text-xs">このシリーズの動画 ({videos.length})</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto mb-10">
            {videos.map((v) => (
              <Button
                key={v.id}
                variant={v.id === video?.id ? "default" : "ghost"}
                className={`w-full justify-start text-left h-auto py-2 px-2 gap-2 ${
                  v.id === video?.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleVideoClick(v.id!)}
              >
                {/* サムネイル */}
                {v.screenshot_file_path && (
                  <div className="shrink-0 w-16 h-12 relative">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/screenshots/${v.screenshot_file_path}`}
                      alt={v.file_name}
                      className="w-full h-full object-cover rounded"
                      loading="lazy"
                    />
                    {v.id === video?.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                        <Play className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                )}
                
                {/* 動画情報 */}
                <div className="flex-1 min-w-0">
                  {/* エピソード番号とサブタイトル */}
                  <div className="text-xs font-semibold truncate">
                    {v.episode !== undefined && v.episode !== null ? `#${v.episode}` : ""}
                    {v.subtitle ? ` ${v.subtitle}` : ` ${v.file_name}`}
                  </div>
                  
                  {/* 放映日時と放映開始時刻 */}
                  {v.jikkyo_date && v.duration && (
                    <div className="text-[10px] text-muted-foreground truncate">
                      {formatVideoDateTimeWithDuration(v.jikkyo_date, v.duration ?? 0)}
                    </div>
                  )}
                </div>
                
                <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesInfo;
