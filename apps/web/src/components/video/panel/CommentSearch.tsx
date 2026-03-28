"use client";

import React, { useState } from 'react';
import { Comment } from '@/types/danmaku';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CommentSearchProps {
  comments: Comment[];
}

// タブを変えても再レンダリングされないように React.memo を使用
const CommentSearch: React.FC<CommentSearchProps> = React.memo(({ comments }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);

  // 秒を mm:ss 形式に変換
  const formatTimeToMinutesSeconds = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 検索処理
  const handleSearch = () => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = comments.filter((comment) =>
      comment.text.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredComments(filtered);
  };

  // エンターキーで検索をトリガーする処理
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 検索バーとボタン */}
      <div className="flex gap-2">
        <Input
          placeholder="コメント検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={handleSearch}>検索</Button>
      </div>

      {/* 検索結果テーブル */}
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th className="px-4 py-2 text-left font-semibold w-20">時間</th>
                <th className="px-4 py-2 text-left font-semibold">コメント</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.length > 0 ? (
                filteredComments.map((comment) => (
                  <tr key={`${comment.id}`} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-2 text-xs whitespace-nowrap">
                      {formatTimeToMinutesSeconds(comment.time)}
                    </td>
                    <td className="px-4 py-2 text-xs break-words">{comment.text}</td>
                  </tr>
                ))
              ) : searchTerm ? (
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-center text-xs text-muted-foreground">
                    検索結果がありません
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-center text-xs text-muted-foreground">
                    検索キーワードを入力して検索してください
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

CommentSearch.displayName = 'CommentSearch';

export default CommentSearch;
