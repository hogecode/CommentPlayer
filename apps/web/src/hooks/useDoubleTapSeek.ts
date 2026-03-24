import React, { useEffect } from 'react';

interface DPlayerRef {
  video: HTMLVideoElement;
  danmaku?: {
    seek: () => void;
  };
}

/**
 * ダブルタップでビデオをシークするカスタムフック
 *
 * DPlayerコンポーネントと連携してビデオの再生時間を変更します。
 * 重要: ビデオ時間を変更する際に、danmaku.seek()も呼び出すことで
 *      コメント表示位置をビデオの再生時間と同期させます。
 *
 * ダブルタップ動作:
 *   - 左側（画面幅1/3以下）: 10秒戻す
 *   - 右側（画面幅2/3以上）: 10秒進める
 *   - 中央（画面幅1/3〜2/3）: 再生/停止をトグル
 *
 * @param dplayerRef - DPlayerインスタンスへの参照
 */
const useDoubleTapSeek = (dplayerRef: React.RefObject<DPlayerRef | null>) => {
  useEffect(() => {
    // タップ回数を管理
    let tapCount = 0;
    let tapTimeout: NodeJS.Timeout;

    const handleTouchStart = (event: TouchEvent) => {
      // タッチ位置が画面のどの部分かをチェック
      const screenWidth = window.innerWidth;
      const tapPositionX = event.touches[0].clientX;

      // ダブルタップ処理
      tapCount++;
      if (tapCount === 1) {
        tapTimeout = setTimeout(() => {
          tapCount = 0; // タイムアウト後にタップ回数をリセット
        }, 300); // ダブルタップとみなすタイムラグを300msに設定
      }

      if (tapCount === 2) {
        if (dplayerRef.current?.video) {
          const video = dplayerRef.current.video;
          const currentTime = video.currentTime;

          if (tapPositionX < screenWidth / 3) {
            // 左側の領域でダブルタップ => 10秒戻す
            video.currentTime = Math.max(0, currentTime - 10);
          } else if (tapPositionX > (screenWidth * 2) / 3) {
            // 右側の領域でダブルタップ => 10秒進める
            video.currentTime = currentTime + 10;
          } else {
            // 中央の領域でダブルタップ => 再生と停止をトグル
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
          }

          // ビデオ時間変更後、コメント表示位置を同期させる
          if (dplayerRef.current?.danmaku) {
            dplayerRef.current.danmaku.seek();
          }
        }
        tapCount = 0; // タップ回数をリセット
      }
    };

    // タッチイベントのリスナーを追加
    window.addEventListener('touchstart', handleTouchStart);

    // クリーンアップ
    return () => {
      clearTimeout(tapTimeout);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [dplayerRef]);
};

export default useDoubleTapSeek;
