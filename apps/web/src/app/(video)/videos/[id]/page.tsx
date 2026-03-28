"use client";

import { useNavigate, useParams } from "@tanstack/react-router";
import { config } from "@/lib/config";
import { RootLayout } from "@/components/common/RootLayout";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import DPlayerVideo from "@/components/video";
import VideoPanel from "@/components/video/panel/VideoPanel";
import { useVideoQuery } from "@/services/useVideos";
import { sampleDanmaku } from "@/misc/sampleDanmaku";
import type { Comment } from "@/types/danmaku";
import { EntityVideo } from "@/generated";
import Message from "@/message";
import { CommentUtils } from "@/lib/comment-utils";
import { useSettingsStore } from "@/stores/settings-store";
import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";

/**
 * ビデオページコンポーネント
 *
 * URLパラメータから動画IDを取得し、useVideoQueryでビデオデータを取得
 * ビデオデータ（src + コメント）をDPlayerVideoに渡す
 *
 * CommentUtilsを使用してコメント設定に基づいてコメントをフィルタリング
 */
export default function VideoPage() {
  const { id: videoIdParam } = useParams({ from: "/videos/$id" });
  const { settings } = useSettingsStore();
  const [currentTime, setCurrentTime] = useState(0);
  const [commentDelay, setCommentDelay] = useState(0);
  const navigate = useNavigate();

  // IDが有効な数値かチェック
  const videoId = videoIdParam ? parseInt(videoIdParam as string, 10) : null;
  const isValidId = videoId !== null && !isNaN(videoId) && videoId > 0;

  // 無効なIDの場合はエラー表示
  if (!isValidId) {
    return (
      <RootLayout>
        <div className="page-center-container">
          <div className="text-red-500 text-xl">ビデオIDが無効です</div>
        </div>
      </RootLayout>
    );
  }

  const { data: videoData, isLoading, error } = useVideoQuery(videoId);

  // コメントを変換・フィルタリング（useMemoで最適化）
  const commentList: Comment[] = useMemo(() => {
    if (!videoData) return sampleDanmaku;

    const comments = (videoData as any)?.comments;
    if (!Array.isArray(comments)) return sampleDanmaku;

    // 設定からデフォルトカラーとコメント数制限を取得
    const defaultColor = settings.default_comment_color || "white";
    const maxCommentsCount = settings.max_comments_display_count || 5000;

    // 変換とフィルタリング
    const filteredComments = comments
      .map((comment: any, index: number) => ({
        id: `${index}`,
        author: comment.author,
        time: comment.time,
        text: comment.text,
        // サーバーから返された色名を16進数カラーコードに変換
        // 無効な色（color: 184など）が来た場合はデフォルト色を使用
        color: CommentUtils.getCommentColor(
          comment.color && CommentUtils.isValidColor(comment.color)
            ? comment.color
            : defaultColor,
        ),
        type: comment.type || "right",
        size: comment.size || "medium",
      }))
      .filter((comment: Comment) => {
        // CommentUtilsを使用してコメント設定に基づいてミュート判定
        return !CommentUtils.isMutedComment(
          comment.text,
          comment.author,
          comment.color,
          comment.type,
          comment.size,
          settings,
        );
      });

    // ランダムに選択して、元の時間順序を保つ
    return CommentUtils.selectRandomComments(
      filteredComments,
      maxCommentsCount,
    );
  }, [videoData, settings]);

  const videoTitle =
    (videoData as any)?.file_name || `弾幕プレイヤー - ${videoId}`;
  const videoSrc =
    `${config.apiBaseUrl}${(videoData as any)?.src}` || "/blank30.mp4";

  const handleBackClick = () => {
    navigate({ to: "/videos" });
  };

  if (isLoading) {
    return (
      <RootLayout>
        <div className="page-center-container">
          <div className="text-white text-xl">読み込み中...</div>
        </div>
      </RootLayout>
    );
  }

  if (error) {
    return (
      <RootLayout>
        <div className="page-center-container">
          <div className="text-red-500 text-xl">
            ビデオの読み込みに失敗しました
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="page-container ">
        <div className="px-8 flex gap-3 ">
          {/* バック矢印ボタン */}
          <button
            className=" flex transition-colors hover:bg-white/10 active:bg-white/20"
            onClick={handleBackClick}
            aria-label="戻る"
          >
            <ChevronLeft width={16} height={16} className="text-white" />
          </button>
          <PageBreadcrumb
            items={[
              { label: "ホーム", href: "/" },
              { label: "動画", href: "/videos" },
              { label: videoTitle },
            ]}
          />
        </div>
        {/* ビデオプレイヤーとタイトル */}
        <div className="overflow-hidden px-8 pb-4">
          <DPlayerVideo
            src={videoSrc}
            commentList={commentList}
            videoId={videoId}
            commentDelay={commentDelay}
            onCurrentTimeChange={setCurrentTime}
            videoTitle={videoTitle}
          />
        </div>

        {/* コメントパネル（固定高さ） */}
        <div className="flex-1 border-t border-gray-700 bg-[#0D0807] overflow-hidden">
          <VideoPanel
            comments={commentList}
            playbackMode="Video"
            currentTime={currentTime}
            commentDelay={commentDelay}
            onCommentDelayChange={setCommentDelay}
            video={videoData as EntityVideo}
          />
        </div>
      </div>
    </RootLayout>
  );
}
