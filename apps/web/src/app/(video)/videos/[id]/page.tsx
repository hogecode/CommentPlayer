'use client';

import { useParams } from '@tanstack/react-router';
import { RootLayout } from '@/components/common/RootLayout';
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb';
import DPlayerVideo from '@/components/video';
import CommentPanel from '@/components/video/CommentPanel';
import { useVideoQuery } from '@/services/useVideosQuery';
import { sampleDanmaku } from '@/misc/sampleDanmaku';
import type { Comment } from '@/types/danmaku';
import Message from '@/message';
import { CommentUtils } from '@/lib/comment-utils';
import { useSettingsStore } from '@/stores/settings-store';
import { useMemo, useState } from 'react';

/**
 * ビデオページコンポーネント
 *
 * URLパラメータから動画IDを取得し、useVideoQueryでビデオデータを取得
 * ビデオデータ（src + コメント）をDPlayerVideoに渡す
 * 
 * CommentUtilsを使用してコメント設定に基づいてコメントをフィルタリング
 */
export default function VideoPage() {
  const { id: videoIdParam } = useParams({ from: '/videos/$id' });
  const { settings } = useSettingsStore();
  const [currentTime, setCurrentTime] = useState(0);
  const [commentDelay, setCommentDelay] = useState(0);
  
  // IDが有効な数値かチェック
  const videoId = videoIdParam ? parseInt(videoIdParam as string, 10) : null;
  const isValidId = videoId !== null && !isNaN(videoId) && videoId > 0;

  // 無効なIDの場合はエラー表示
  if (!isValidId) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8 pt-24">
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

    return comments
      .map((comment: any, index: number) => ({
        id: `${index}`,
        author: comment.author,
        time: comment.time,
        text: comment.text,
        // サーバーから返された色名を16進数カラーコードに変換
        color: CommentUtils.getCommentColor(comment.color || 'white'),
        type: comment.type || 'right',
        size: comment.size || 'medium',
      }))
      .filter((comment: Comment) => {
        // CommentUtilsを使用してコメント設定に基づいてミュート判定
        return !CommentUtils.isMutedComment(
          comment.text,
          comment.author,
          comment.color,
          comment.type,
          comment.size,
          settings
        );
      });
  }, [videoData, settings]);

  const videoTitle = ((videoData as any)?.title) || `弾幕プレイヤー - ${videoId}`;
  const videoSrc = (`http://100.72.160.115:8000${(videoData as any)?.src}`) || '/blank30.mp4';
  
  if (isLoading) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-[#0D0807] flex flex-col items-center justify-center p-8 pt-24">
          <div className="text-white text-xl">読み込み中...</div>
        </div>
      </RootLayout>
    );
  }

  if (error) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-[#0D0807] flex flex-col items-center justify-center p-8 pt-24">
          <div className="text-red-500 text-xl">ビデオの読み込みに失敗しました</div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="h-screen bg-[#0D0807] flex flex-col pt-24">
        <div className="px-8 pt-8">
          <PageBreadcrumb items={[
            { label: '動画', href: '/videos' },
            { label: videoTitle }
          ]} />
        </div>
        
        {/* ビデオプレイヤーとタイトル */}
        <div className="flex-1 flex flex-col overflow-hidden px-8 py-4">
          <DPlayerVideo
            src={videoSrc}
            commentList={commentList}
            videoId={videoId}
            onCurrentTimeChange={setCurrentTime}
          />
        </div>

        {/* コメントパネル（固定高さ） */}
        <div className="h-64 border-t border-gray-700 bg-[#0D0807] overflow-hidden">
          <CommentPanel
            comments={commentList}
            playbackMode="Video"
            currentTime={currentTime}
            commentDelay={commentDelay}
            onCommentDelayChange={setCommentDelay}
          />
        </div>
      </div>
    </RootLayout>
  );
}
