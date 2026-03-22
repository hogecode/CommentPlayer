# CommePlayer

弾幕コメント機能付きビデオプレイヤーアプリケーション

## 🏗️ アーキテクチャ

```
CommePlayer/
├── apps/web/              # Vite + React フロントエンド (SPA)
├── server/                # Go + Gin バックエンド API
├── caddy/                 # リバースプロキシ設定
├── .devcontainer/         # VS Code 開発環境（参考用）
├── docker-compose.yaml    # 開発環境（ホットリロード）
├── docker-compose.prod.yaml # 本番環境
└── Makefile              # 各種コマンド
```

**技術スタック:**
- **フロントエンド:** Vite, React 19, TanStack Router, TypeScript
- **バックエンド:** Go, Gin, SQLite
- **リバースプロキシ:** Caddy (HTTPS)

## 🚀 開発環境のセットアップ

### 方式 1: Docker Compose ホットリロード開発（推奨）

```bash
make up      # Vite（フロント）+ air（バック）+ Caddy でホットリロード起動
make down    # 停止
make logs    # ログ表示
```

**アクセス:**
- **Caddy 統合**: http://localhost (API と フロント自動振り分け)
- フロントエンド直接: http://localhost:3000
- バックエンド直接: http://localhost:8000
- Vite HMR: localhost:5173

### 方式 2: ローカル環境（Docker 不使用）

**前提条件:** Node.js 20+、Go 1.22+、SQLite3

```bash
# フロントエンド
cd apps/web && yarn install && yarn dev

# バックエンド（別ターミナル）
cd server && go mod download && air
```

## 📝 よく使うコマンド

```bash
make help              # 全コマンド一覧

# 開発環境（Docker Compose ホットリロード）
make up                # 起動（Vite + air + Caddy）
make down              # 停止
make logs              # ログ表示
make ps                # コンテナ状態確認

# 本番環境（docker-compose.prod.yaml）
make up-prod           # 起動
make down-prod         # 停止
make logs-prod         # ログ表示
make ps-prod           # コンテナ状態確認

# 手動起動（ローカル開発）
make web-dev           # Vite フロントエンド
make server-run        # Go air ホットリロード

# ビルド・検証
make web-build         # フロント本番ビルド
make web-lint          # TypeScript + ESLint
make server-test       # Go テスト
make server-fmt        # Go フォーマット
```

## 🐳 Docker Compose ファイルの役割分け

| 用途 | ファイル | コマンド | 説明 |
|------|---------|---------|------|
| 開発 | `docker-compose.yaml` | `make up` | Vite + air ホットリロード + Caddy |
| 本番 | `docker-compose.prod.yaml` | `make up-prod` | Go バイナリ実行 + 静的配信 + Caddy |

## 📦 Dockerfile について

**フロントエンド:**
- `apps/web/Dockerfile.dev` - 開発環境用（Vite ホットリロード）
- `apps/web/Dockerfile` - 本番環境用（静的配信）

**バックエンド:**
- `server/Dockerfile` - 本番環境用（Go バイナリ実行）

## 🚀 本番環境へのデプロイ

```bash
# 本番環境を起動
make up-prod

# ログを確認
make logs-prod

# 停止する場合
make down-prod
```

フロントエンドとバックエンドが Caddy を通じて統合され、`http://localhost` にアクセスすると自動的に適切なサービスに振り分けられます。
| ローカル | なし | `make web-dev` + `make server-run` | ホストで直接実行 |

## 🔐 Claude API 設定

DevContainer 内で Claude AI を使用する場合：

```bash
# 1. API キーを取得
# https://console.anthropic.com/ から取得

# 2. 環境変数を設定
cp .env.local.example .env.local
# CLAUDE_API_KEY を .env.local に記入

# 3. Dev Container を開く
# 自動的に環境変数が読み込まれます

# 4. Claude CLI で質問
claude "このコードの問題点は？"
```

## 📚 詳細ドキュメント

- [.devcontainer/README.md](.devcontainer/README.md) - Dev Container 詳細設定
- [Makefile](Makefile) - 全コマンド一覧

## 🔄 ワークフロー

### 新機能開発

```bash
# 1. Dev Container で開く
Dev Containers: Open Folder in Container

# 2. ターミナルで開発サーバー起動
make web-dev      # ターミナル 1
make server-run   # ターミナル 2

# 3. コードを編集
# 自動リロード

# 4. テスト
make web-typecheck
make server-test

# 5. Commit & Push
git add .
git commit -m "feat: 新機能追加"
git push
```

### 本番デプロイ

```bash
# 1. ビルド確認
make web-build
make server-build

# 2. Docker で起動
make up

# 3. ログ確認
make logs

# 4. 検証後、デプロイ
```

## 🐛 トラブルシューティング

### Dev Container が起動しない

```bash
# コンテナをリビルド
# VS Code コマンドパレット → Dev Containers: Rebuild Container
```

### ポート競合エラー

```bash
# Windows: 使用中のプロセスを確認
netstat -ano | findstr :3000

# macOS/Linux: 同じコマンド
lsof -i :3000
```

### Claude API キーエラー

```bash
# .env.local が存在して、CLAUDE_API_KEY が設定されているか確認
cat .env.local | grep CLAUDE_API_KEY
```

## 📦 関連リソース

- [Claude Console](https://console.anthropic.com/)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/remote/containers)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

## 📄 License

Proprietary - All rights reserved
