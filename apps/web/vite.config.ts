import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Dev server 設定
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['frontend', 'localhost', 'app.local', '127.0.0.1'],
    watch: {
      usePolling: true,
    },
    middlewareMode: false,
  },
  // ビルド時に環境変数をバージョン情報として埋め込む
  define: {
    'process.env': {},
    'import.meta.env.COMMEPLAYER_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    react(),
    // PWA サポート（オフライン対応）
    VitePWA({
      strategies: 'generateSW',
      registerType: 'prompt',
      injectRegister: 'auto',
      manifest: {
        name: 'CommePlayer',
        short_name: 'CommePlayer',
        description: '弾幕コメント機能付きビデオプレイヤー',
        theme_color: '#0D0807',
        background_color: '#1E1310',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
      },
      // 後でアイコンを追加する場合はここに記述
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/^\/api/],
        maximumFileSizeToCacheInBytes: 1024 * 1024 * 15, // 15MB
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ビルド最適化
  build: {
    chunkSizeWarningLimit: 3 * 1024 * 1024, // 3MB に緩和
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // フォントファイルはハッシュを付けずに出力
          if (assetInfo.name && /\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name][extname]'
          }
          return 'assets/[name].[hash][extname]'
        },
      },
    },
  },
  // CSS プリプロセッサ設定
  css: {
    preprocessorOptions: {
      scss: {

      },
    },
  },
  // プレビューサーバー設定
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
  },
  // Web Worker 設定（並列処理が必要な場合）
  // worker: {
  //   plugins: () => [comlink()],
  // },
})
