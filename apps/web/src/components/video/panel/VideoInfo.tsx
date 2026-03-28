"use client";

import React, { useEffect } from "react";
import { EntityVideo } from "@/generated";
import { formatFileSize, formatDuration, formatVideoDateTimeWithDuration } from "@/lib/format";
import { Eye, MessageCircle } from "lucide-react";

interface VideoInfoProps {
  /**ビデオデータ */
  video?: EntityVideo;
}

/**
 * 動画情報表示コンポーネント
 * 動画の詳細情報を表示する
 */
const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  if (!video) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-muted-foreground">
        動画情報がありません
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 overflow-y-auto">
      {/* ファイル情報 */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">ファイル情報</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground pr-4">ファイル名</span>
            <span className="text-right  break-words max-w-[50%]">{video.file_name || "-"}</span>
          </div>
        </div>
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
              ? formatVideoDateTimeWithDuration(video.jikkyo_date, video.duration)
              : "-"}
          </span>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">統計情報</h3>
        <div className="space-y-2 text-sm">
            <span className="text-muted-foreground pr-4">コメント数</span>
            <span className="text-xs leading-relaxed break-words">{video.jikkyo_comment_count ?? 0}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;
