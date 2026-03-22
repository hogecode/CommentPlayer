# CommePlayer - Claude Code プロジェクト設定

## プロジェクト構成

```
CommePlayer/
├── apps/web/              # Vite + React フロントエンド (SPA)
├── server/                # Go バックエンド API
├── caddy/                 # Caddy リバースプロキシ設定
├── .devcontainer/         # VS Code Dev Container 設定（参考用）
├── docker-compose.yaml    # 開発環境（ホットリロード）
├── docker-compose.prod.yaml # 本番環境（本番ビルド）
└── Makefile              # コマンドライン インターフェース
```

フロント、バックエンドは/apps/web/CLAUDE.md、server/CLAUDE.mdをそれぞれ参照してください。


## 開発環境のセットアップ

### 推奨: Docker Compose ホットリロード開発

```bash
make up      # Vite（フロント） + air（バック） + Caddy でホットリロード起動
make down    # 停止
make logs    # ログ表示
```

**アクセス:**
- Caddy 統合: http://localhost
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8000
- Vite HMR: localhost:5173

### ローカル開発（Docker 不使用）

```bash
# フロントエンド
cd apps/web && yarn install && yarn dev

# バックエンド（別ターミナル）
cd server && go mod download && air
```

### 本番環境デプロイ

```bash
make up-prod      # 本番環境を起動
make down-prod    # 停止
make logs-prod    # ログ表示
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

## 主要コマンド

全コマンドは `Makefile` に定義されています：

```bash
make help              # コマンド一覧を表示

# フロントエンド開発
make web-dev          # Vite 開発サーバー起動
make web-build        # ビルド
make web-typecheck    # 型チェック
make web-lint         # ESLint

# バックエンド開発
make server-run       # 開発サーバー起動
make server-build     # ビルド
make server-test      # テスト実行
make server-fmt       # コードフォーマット
make server-lint      # golangci-lint

# 本番環境
make up               # Docker Compose で起動
make down             # 停止
make logs             # ログ表示
```

## コーディング規約

### 全般
- **コードはざっくり斜め読みした際の可読性を高めるため、日本語のコメントを多めに記述する**
- ログメッセージは**英語**で記述（文字化け防止）
- 既存コメントはコード変更時も保持（内容がコードと合わなくなった場合を除く）
- 不要な薄いラッパー関数は作らない
- Enum・Literal・Union 型の文字列表現は UpperCamelCase（例：`'TopLeft' | 'BottomRight'`）
- DB スキーマ定義：親スキーマを最上位、子スキーマはフィールド定義順に配置

### TypeScript / React コード

- **コード編集後は必ず `yarn lint; yarn typecheck` を実行**
  - `apps/web/` ディレクトリで実行
- 文字列はシングルクォート使用
- 関数・クラス名は UpperCamelCase（例：`function HomePage() {}`）
- 変数・プロップは lowerCamelCase
- コンポーネント属性は可能な限り1行（約100文字まで）
- 複数行コレクションは末尾カンマを含める
- 型安全性を確保（`any` は避ける）
- **`new Date()` は絶対に使わない → `date-fns` を使用**

### Go コード

- **コード編集後は必ず `make server-fmt` を実行**
  - goimports による import 整理
  - golangci-lint によるリント
- 変数・メソッド名は camelCase
- 関数・型名は PascalCase
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

## デバッグ・開発時のコマンド

```bash
# フロントエンド
make web-preview       # ビルド後のプレビュー

# バックエンド
make server-clean      # ビルド成果物削除
make goimports         # import 自動整理

# データベース
make db-migrate        # マイグレーション実行
make db-dump           # スキーマ確認
```

## トラブルシューティング

### DevContainer が起動しない
```bash
# VS Code コマンドパレット
Dev Containers: Rebuild Container
```

### ポート競合
```bash
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000
```

### 型エラー
```bash
# フロントエンド
cd apps/web && yarn typecheck

# バックエンド
cd server && make server-lint
```

## 参考資料

- [README.md](./README.md) - プロジェクト全体の説明
- [.devcontainer/README.md](.devcontainer/README.md) - Dev Container 詳細
- [Makefile](./Makefile) - 全コマンド定義