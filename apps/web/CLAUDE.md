# CommePlayer フロントエンド - 開発ガイド

## ディレクトリ構成

```
apps/web/
├── src/
│   ├── app/             # TanStack Router ルート定義
│   ├── components/      # React コンポーネント
│   │   └── /common      # ヘッダー等共通コンポーネント   
│   │   └── ui/          # shadcn-ui コンポーネント
│   ├── pages/           # ページコンポーネント（ルート対応）
│   ├── lib/             # ユーティリティ関数
│   ├── providers/       # プロバイダー（Query Client等）
│   ├── services/        # API クライアント（TanStack Query）
│   ├── stores/          # Zustand ストア（状態管理）
│   ├── types/           # TypeScript 型定義
│   ├── styles/          # グローバルスタイル
│   ├── main.tsx         # エントリポイント
│   └── router.ts        # TanStack Router 設定
├── vite.config.ts       # Vite 設定
├── tsconfig.json        # TypeScript 設定
├── tailwind.config.ts   # Tailwind CSS 設定
└── package.json         # 依存関係定義
```

## 開発ワークフロー

### 開発サーバー起動

```bash
cd apps/web
yarn install           # 初回のみ
yarn dev              # 開発サーバー起動（http://localhost:3000）
```

npmコマンドは使わず、必ずyarnを使用してください。

### コード品質チェック

```bash
# 型チェック（必須）
yarn typecheck

# リント（必須）
yarn lint

# ビルド検証
yarn build
```

## コーディング規約（TypeScript / React）


### コメント

```tsx
// コンポーネント説明（ファイル先頭）
/**
 * VideoPlayer - DPlayer を使用したビデオ再生コンポーネント
 *
 * Props:
 * - id: ビデオ ID
 * - commentList: 表示するコメント（弾幕）リスト
 */
export function VideoPlayer({ id, commentList }: VideoPlayerProps) {
  // 何をしているか、なぜそうするのかを記載
  const [isPlaying, setIsPlaying] = useState(false)

  // コメント表示の遅延を管理
  const [commentDelay, setCommentDelay] = useState(0)

  return (/* JSX */)
}
```

### 型安全性

```tsx
// 複雑な型は Zod で検証
import { z } from 'zod'

const VideoSchema = z.object({
  id: z.string(),
  title: z.string(),
})

const data = VideoSchema.parse(response.json())
```

### 日付操作

```tsx
// ❌ 絶対に new Date() を使わない
const now = new Date()

// ✅ date-fns を使用
import { addDays, format } from 'date-fns'

const now = new Date()
const tomorrow = addDays(now, 1)
const formatted = format(now, 'yyyy-MM-dd')
```

## TanStack Router


TanStack QueryとOpenAPIで自動生成されたファイルを使用してください。


## Zustand（状態管理）

## Tailwind CSS + shadcn-ui


## ビルド・デプロイ

```bash
# 本番ビルド
yarn build

# 出力：dist/ ディレクトリ

# ビルド結果をプレビュー
yarn preview
```


## 参考資料

- [React ドキュメント](https://react.dev)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn-ui](https://ui.shadcn.com)
- [Vite ドキュメント](https://vitejs.dev)
