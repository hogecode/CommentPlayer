"use client";

import { useState } from "react";
import { Comment } from "@/types/danmaku";
import CommentList from "./CommentList";
import CommentDelay from "./CommentDelay";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageCircle, Clock } from "lucide-react";

interface CommentPanelProps {
  /** コメント一覧 */
  comments: Comment[];
  /** 再生モード ('Live' または 'Video') */
  playbackMode: "Live" | "Video";
  /** ビデオの現在の再生位置（秒） */
  currentTime: number;
  /** コメント遅延時間 */
  commentDelay: number;
  /** コメント遅延時間の更新関数 */
  onCommentDelayChange: (delay: number) => void;
  /** ユーザーがコメントをクリック時のコールバック */
  onCommentClick?: (comment: Comment) => void;
}

/**
 * コメントリストとコメント遅延のタブ付きパネルコンポーネント
 * /videos/:id ページの下部に配置される
 */
export default function CommentPanel({
  comments,
  playbackMode,
  currentTime,
  commentDelay,
  onCommentDelayChange,
  onCommentClick,
}: CommentPanelProps) {
  const [activeTab, setActiveTab] = useState("delay");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full flex flex-col"
    >
      {/* コメント一覧タブ */}
      <TabsContent
        value="comments"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <CommentList
          comments={comments}
          playbackMode={playbackMode}
          currentPlaybackPosition={currentTime}
          onCommentClick={onCommentClick}
        />
      </TabsContent>
      {/* コメント遅延設定タブ */}
      <TabsContent
        value="delay"
        className="flex-1 flex flex-col justify-center gap-4 p-4"
      >
        <CommentDelay
          currentTime={currentTime}
          comments={comments}
          commentDelay={commentDelay}
          handleCommentDelay={onCommentDelayChange}
        />
      </TabsContent>{" "}
      <TabsList className="w-full align-start bg-gray-800" variant="default">
        <TabsTrigger value="comments" className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
        </TabsTrigger>
        <TabsTrigger value="delay" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
