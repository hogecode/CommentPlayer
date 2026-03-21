'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';

/**
 * QueryClient設定
 * React Queryのグローバル設定を管理
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // キャッシュが有効と判断される時間（ミリ秒）
      staleTime: 1000 * 60 * 5, // 5分
      // キャッシュが保持される時間（ミリ秒）
      gcTime: 1000 * 60 * 10, // 10分
      // 重試回数
      retry: 1,
      // 重試間隔（ミリ秒）
      retryDelay: 1000,
      // バックグラウンドでの再フェッチを無効化
      refetchOnWindowFocus: false,
    },
    mutations: {
      // ミューテーション失敗時の重試回数
      retry: 3,
      retryDelay: 1000,
    },
  },
});

/**
 * React Query QueryClientプロバイダー
 * アプリケーション全体をラップして、React Queryの機能を有効化
 */
export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
}

/**
 * QueryClientインスタンスをエクスポート
 * サーバーサイドやテストで必要な場合に使用
 */
export { queryClient };
