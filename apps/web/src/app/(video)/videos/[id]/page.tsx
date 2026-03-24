'use client';

import { useParams } from '@tanstack/react-router';
import { RootLayout } from '@/components/common/RootLayout';
import DPlayerVideo from '@/components/video';
import { useVideoQuery } from '@/services/useVideosQuery';
import { sampleDanmaku } from '@/misc/sampleDanmaku';
import type { Comment } from '@/types/danmaku';

/**
 * ビデオページコンポーネント
 *
 * URLパラメータから動画IDを取得し、useVideoQueryでビデオデータを取得
 * ビデオデータ（src + コメント）をDPlayerVideoに渡す
 */
export default function VideoPage() {
  const { id: videoIdParam } = useParams({ from: '/videos/$id' });
  
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

  // コメントを変換
  const commentList: Comment[] = (() => {

    if (!videoData) return sampleDanmaku;
    
    const comments = (videoData as any)?.comments;
    if (!Array.isArray(comments)) return sampleDanmaku;

    return comments.map((comment: any, index: number) => ({
      id: `${index}`,
      author: comment.author || 'Anonymous',
      time: comment.time,
      text: comment.text,
      color: comment.color || '#ffffff',
      type: comment.type || 'right',
      size: comment.size || 'medium',
    }));
  })();

  const videoTitle = ((videoData as any)?.title) || `弾幕プレイヤー - ${videoId}`;
    const videoSrc = (`http://localhost:8000${(videoData as any)?.src}`) || '/blank30.mp4';
  if (isLoading) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8 pt-24">
          <div className="text-white text-xl">読み込み中...</div>
        </div>
      </RootLayout>
    );
  }

  if(error) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8 pt-24">
          <div className="text-red-500 text-xl">ビデオの読み込みに失敗しました</div>
        </div>
      </RootLayout>
    );
  }
  return (
    <RootLayout>
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-start p-8 pt-24">
        <DPlayerVideo src={videoSrc} commentList={commentList} />
        <h1 className="text-white text-2xl font-bold mb-6">{videoTitle}</h1>
      </div>
    </RootLayout>
  );
}
