"use client";

import React from "react";
import { EntityVideo } from "@/generated";

interface SeriesInfoProps {
  /**ビデオデータ */
  video?: EntityVideo;
}

/**
 * シリーズ情報表示コンポーネント
 * 同じフォルダーに属する動画情報を表示する
 */
const SeriesInfo: React.FC<SeriesInfoProps> = ({ video }) => {
  if (!video) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-muted-foreground">
        シリーズ情報がありません
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">フォルダーID</h3>
        <p className="text-sm text-muted-foreground">{video.folder_id || "未設定"}</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">説明</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
          {video.description || "説明はありません"}
        </p>
      </div>
    </div>
  );
};

export default SeriesInfo;
