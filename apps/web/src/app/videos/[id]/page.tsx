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
  const videoId = videoIdParam ? parseInt(videoIdParam as string, 10) : null;

  const { data: videoData, isLoading, error } = useVideoQuery(videoId);

  //const videoSrc = ((videoData as any)?.src) || '/blank30.mp4';
const videoSrc =  'http://localhost:8000/api/v1/files/1/hibi01.mp4';

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

  if (isLoading) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8 pt-24">
          <div className="text-white text-xl">読み込み中...</div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8 pt-24">
        <h1 className="text-white text-2xl font-bold mb-6">{videoTitle}</h1>
        {error && (
          <div className="text-red-500 text-sm mb-4">
            エラーが発生しました
          </div>
        )}
        <DPlayerVideo src={videoSrc} commentList={commentList} />
      </div>
    </RootLayout>
  );
}
