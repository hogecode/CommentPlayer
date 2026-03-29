"use client";

import React, { useEffect } from "react";
import { EntityVideo } from "@/generated";
import {
  formatFileSize,
  formatDuration,
  formatVideoDateTimeWithDuration,
} from "@/lib/format";
import { Eye, MessageCircle } from "lucide-react";
import { CHANNEL_ID_TO_NAME } from "@/constant";

interface VideoInfoProps {
  /**ビデオデータ */
  video?: EntityVideo;
}

/**
 * 動画情報表示コンポーネント
 * 動画の詳細情報を表示する
 */
const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  const channelLogoUrl = video?.channel_id
    ? `/assets/images/logos/ch${video.channel_id}.png`
    : null;

  if (!video) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-muted-foreground">
        動画情報がありません
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 overflow-y-scroll pb-10">
      {/* タイトルとサブタイトル */}
      <div className="space-y-3">
        <span className="space-y-2 text-sm">
          <h3 className="font-semibold text-sm">タイトル</h3>
          <span className="text-xs leading-relaxed break-words">
            {video.series?.syobocal_title_id
              ? `${video.series.syobocal_title_name ?? ""} #${video.episode} ${video.subtitle ?? ""}`
              : `${video.file_name}`}
          </span>
        </span>
      </div>
      <div className="flex items-end mb-1">
        <span>
          <span className="text-muted-foreground pr-4">放送局</span>
        </span>
        {video.series?.syobocal_title_name && (
          <>
            {channelLogoUrl !== null && (
              <img
                src={channelLogoUrl}
                alt={`Channel ${video.channel_id} logo`}
                className="h-4.5 w-8 shrink-0"
              />
            )}
            <span>&nbsp;&nbsp;</span>
            <div className="line-clamp-1 text-xs">
              {video.channel_id ? CHANNEL_ID_TO_NAME[video.channel_id] : ""}
            </div>
          </>
        )}
      </div>
      {/* 配信情報 */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">配信情報</h3>
        <div className="space-y-2 text-sm">
          <span>
            <span className="text-muted-foreground pr-4">配信日時</span>
          </span>
          <span className="text-xs leading-relaxed break-words">
            {video.jikkyo_date && video.duration
              ? formatVideoDateTimeWithDuration(
                  video.jikkyo_date,
                  video.duration,
                )
              : "-"}
          </span>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">統計情報</h3>
        <div className="space-y-2 text-sm">
          <span className="text-muted-foreground pr-4">コメント数</span>
          <span className="text-xs leading-relaxed break-words">
            {video.jikkyo_comment_count ?? 0}
          </span>
        </div>
      </div>

      {/* シリーズコメント */}
      {video?.series?.comment && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">シリーズコメント</h3>

          <div className="space-y-2 text-sm">
            {Object.entries(video.series.comment).map(
              ([key, value]: [string, string[]]) => (
                <div key={key}>
                  <span className="text-muted-foreground pr-4">{key}</span>
                  <div className="text-xs leading-relaxed wrap-break-word">
                    {value.map((item, index) => (
                      <div
                        key={index}
                        className="text-xs leading-relaxed whitespace-pre-wrap break-all"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoInfo;
