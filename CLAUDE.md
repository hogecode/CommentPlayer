# CommePlayer - Claude Code プロジェクト設定

## プロジェクト構成

```
CommePlayer/
├── apps/web/              # Vite + React フロントエンド (SPA)
├── server/                # Go バックエンド API
├── caddy/                 # Caddy リバースプロキシ設定
├── .devcontainer/         # VS Code Dev Container 設定（参考用）
├── docker-compose.yaml    # 開発環境（ホットリロード）
├── docker-compose.dns.yaml # 本番環境（本番ビルド）
└── Makefile              # コマンドライン インターフェース
```

フロント、バックエンドは/apps/web/CLAUDE.md、server/CLAUDE.mdをそれぞれ参照してください。


## 開発環境のセットアップ

### 推奨: Docker Compose ホットリロード開発

```bash
make up      # Vite（フロント） + air（バック） + Caddy でホットリロード起動
make down    # 停止
```

## 技術スタック

### フロントエンド (`apps/web/`)
- **React** 19.x
- **Vite** - 高速ビルドツール
- **TanStack Router** - ルーティング（ファイルベースではなく手動定義）
- **TypeScript** - 型安全性
- **Tailwind CSS** + **shadcn-ui** - UI コンポーネント
- **TanStack Query** - API データ管理
- **Zustand** - 状態管理

### バックエンド (`server/`)
- **Go** 1.22+
- **Gin** - HTTP ルーター
- **SQLite** - データベース
- **Gorm** - SQL コード生成


## コーディング規約

### 全般
- **コードはざっくり斜め読みした際の可読性を高めるため、日本語のコメントを多めに記述する**
- ログメッセージは**英語**で記述（文字化け防止）
- 既存コメントはコード変更時も保持（内容がコードと合わなくなった場合を除く）
- 不要な薄いラッパー関数は作らない


### TypeScript / React コード

- **コード編集後は必ず `make web-lint; make web-typecheck` を実行**
- 文字列はシングルクォート使用
- 型安全性を確保（`any` は避ける）
- **`new Date()` は絶対に使わない → `date-fns` を使用**

### Go コード

- **コード編集後は必ず `make server-fmt` を実行**
  - goimports による import 整理
  - golangci-lint によるリント
- 変数・メソッド名は camelCase
- 複数行処理にはコメント記載（「なぜ」を説明）
- エラーハンドリングは明示的に実装
- Log メッセージは英語で記述

### スタイリング

- CSS 変数は `src/styles/globals.css` に定義
- shadcn-ui コンポーネントベース（新規 UI はこの方向性に合わせる）
- Tailwind CSS ユーティリティクラスを活用
- ダークモード対応（CSS 変数で実装）

## Claude AI 統合

DevContainer で Claude API を使用可能：

```bash
# API キー設定（.env.local）
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx

# Claude CLI での質問
claude "このコードの問題点は？"
claude --file ./src/main.tsx
```
