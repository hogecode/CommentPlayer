"use client";

import { useState } from "react";
import { Comment } from "@/types/danmaku";
import { EntityVideo } from "@/generated";
import CommentList from "./CommentList";
import CommentDelay from "./CommentDelay";
import SeriesInfo from "./SeriesInfo";
import VideoInfo from "./VideoInfo";
import CommentSearch from "./CommentSearch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageCircle, Clock, List, Info, Search } from "lucide-react";

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
  /** ビデオデータ（オプション） */
  video?: EntityVideo;
}

/**
 * コメントリストとコメント遅延のタブ付きパネルコンポーネント
 * /videos/:id ページの下部に配置される
 */
export default function VideoPanel({
  comments,
  playbackMode,
  currentTime,
  commentDelay,
  onCommentDelayChange,
  onCommentClick,
  video,
}: CommentPanelProps) {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full flex flex-col"
    >
      {" "}
      {/* 動画情報タブ */}
      <TabsContent
        value="info"
        className="flex-1 flex flex-col overflow-scroll"
      >
        <VideoInfo video={video} />
      </TabsContent>
      {/* シリーズ情報タブ */}
      <TabsContent
        value="series"
        className="flex-1 flex flex-col overflow-scroll"
      >
        <SeriesInfo video={video} />
      </TabsContent>
      {/* コメント一覧タブ */}
      <TabsContent
        value="comments"
        className="flex-1 flex flex-col overflow-scroll"
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
        className="flex-1 flex flex-col gap-4 p-4"
      >
        <CommentDelay
          currentTime={currentTime}
          comments={comments}
          commentDelay={commentDelay}
          handleCommentDelay={onCommentDelayChange}
        />
      </TabsContent>
      {/* コメント検索タブ */}
      <TabsContent
        value="search"
        className="flex-1 flex flex-col overflow-scroll"
      >
        <CommentSearch comments={comments} />
      </TabsContent>
      <TabsList
        className="fixed bottom-0 w-[95%] flex align-center justify-center min-h-12 bg-red-950"
        variant="line"
      >
        <TabsTrigger value="info">
          <Info className="size-6" />
        </TabsTrigger>
        <TabsTrigger value="series">
          <List className="size-6" />
        </TabsTrigger>
        <TabsTrigger value="comments">
          <MessageCircle className="size-6" />
        </TabsTrigger>
        <TabsTrigger value="search">
          <Search className="size-6" />
        </TabsTrigger>        
        <TabsTrigger value="delay">
          <Clock className="size-6" />
        </TabsTrigger>

      </TabsList>
    </Tabs>
  );
}
