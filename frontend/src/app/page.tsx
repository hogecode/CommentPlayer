"use client";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ナビゲーションバー */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">CommeVideo</h1>
          <Button variant="outline">ログイン</Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 container mx-auto mt-16 text-center px-4">
        <h2 className="text-4xl font-bold mb-4">ようこそ、CommeVideoへ</h2>
        <p className="text-gray-600 mb-8">
          ここでは動画再生と弾幕コメントを楽しめます。サンプルボタンをクリックしてみてください。
        </p>

        <div className="flex justify-center gap-4">
          <Button size="lg">動画を見る</Button>
          <Button variant="outline" size="lg">
            サンプル弾幕
          </Button>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-muted text-muted-foreground py-6 text-center mt-16">
        <p className="text-sm">&copy; 2026 CommeVideo. All rights reserved.</p>
      </footer>
    </div>
  );
}