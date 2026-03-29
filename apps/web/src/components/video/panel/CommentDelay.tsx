"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Comment } from "@/types/danmaku";
import {
  ArrowLeft,
  ArrowDown,
  RotateCcw,
  ArrowUp,
  ArrowRight,
} from "lucide-react";

interface CommentDelayProps {
  currentTime: number; // 現在の動画再生時間（秒）
  comments: Comment[]; // コメントデータ
  commentDelay: number; // コメント遅延時間
  handleCommentDelay: (newDelay: number) => void; // commentDelayの更新関数
}

/**
 * コメント遅延コントロールコンポーネント
 *
 * DPlayer 用のコメント遅延調整UI
 * アイコンボタンとトグルグループを使用してコメントの表示タイミングを調整します。
 * 正の値でコメントを遅延、負の値で先行表示。
 *
 * 機能:
 * - ±1秒、±5秒、±60秒の粗調整ボタン
 * - A、B、Cコメントへの自動遷移
 * - コメント遅延時間のリアルタイム表示
 */
const CommentDelay: React.FC<CommentDelayProps> = ({
  currentTime,
  comments,
  commentDelay,
  handleCommentDelay,
}) => {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // 時間を分:秒形式で表示する関数
  const formatTime = (seconds: number): string => {
    const isPositive = seconds < 0;
    const absSeconds = Math.abs(seconds);

    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = Math.floor(absSeconds % 60);

    return `${isPositive ? "+" : "-"}${minutes < 10 ? "0" : ""}${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`;
  };

  // コメントデータに基づいて遅延時間を設定する
  const handleSetDelayFromComment = (text: string) => {
    const commentAfterCurrentTime = comments.find(
      (comment) =>
        comment.text === text && comment.time >= currentTime + commentDelay,
    );

    if (commentAfterCurrentTime) {
      const delayInSeconds = commentAfterCurrentTime.time - currentTime;
      handleCommentDelay(- delayInSeconds);
      setSelectedMarker(text);
    }
  };

  // 正規表現パターンに基づいてコメントを検索し遅延時間を設定する
  const handleSetDelayFromPatternComment = (pattern: RegExp) => {
    const commentAfterCurrentTime = comments.find(
      (comment) =>
        pattern.test(comment.text) &&
        comment.time >= currentTime + commentDelay,
    );

    if (commentAfterCurrentTime) {
      const delayInSeconds = commentAfterCurrentTime.time - currentTime;
      handleCommentDelay(- delayInSeconds);
      setSelectedMarker(commentAfterCurrentTime.text);
    }
  };

  // リセットボタン
  const handleReset = () => {
    handleCommentDelay(0);
    setSelectedMarker(null);
  };

  return (
    <div className="flex flex-col justify-start  gap-4 p-4">
      {/* ヘッダー */}
      <div className="flex justify-center">
        <Label className="text-base font-medium">
          コメント遅延: {formatTime(commentDelay)}
        </Label>
      </div>

      {/* 大粗調整ボタン群（±60秒） */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="default"
          size="lg"
          onClick={() => handleCommentDelay(commentDelay + 60)}
          title="60秒減少"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={() => handleCommentDelay(commentDelay + 5)}
          title="5秒減少"
        >
          <ArrowDown className="w-6 h-6" />
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={() => handleCommentDelay(commentDelay - 5)}
          title="5秒増加"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={() => handleCommentDelay(commentDelay - 60)}
          title="60秒増加"
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={handleReset}
          title="遅延をリセット"
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={() => handleSetDelayFromPatternComment(/^キタ/)}
          title="キタコメントへ遷移"
          className={
            selectedMarker && /^キタ/.test(selectedMarker)
              ? "bg-primary text-primary-foreground"
              : ""
          }
        >
          K
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={() => handleSetDelayFromComment("A")}
          title="Aコメントへ遷移"
          className={
            selectedMarker === "A" ? "bg-primary text-primary-foreground" : ""
          }
        >
          A
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={() => handleSetDelayFromComment("B")}
          title="Bコメントへ遷移"
          className={
            selectedMarker === "B" ? "bg-primary text-primary-foreground" : ""
          }
        >
          B
        </Button>
      </div>
    </div>
  );
};

export default CommentDelay;
