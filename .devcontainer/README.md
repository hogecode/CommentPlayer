# CommePlayer Dev Container

VS Code Dev Containers を使用した開発環境。

## 前提条件

- Docker Desktop がインストール済み
- VS Code がインストール済み
- "Dev Containers" 拡張機能がインストール済み

## Claude AI の設定

### API キー の取得と設定

1. **API キーを取得** - https://console.anthropic.com/ から API キーを取得

2. **環境変数を設定** - `.env.local` または `.env` ファイルを作成：

```bash
# プロジェクトルートに .env ファイルを作成
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx
```

または、環境変数として設定：

```bash
# Windows
set CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx

# macOS/Linux
export CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx
```

3. **Dev Container を開く** - VS Code で開くと自動的に環境変数が読み込まれます

### Claude CLI の使用

```bash
# Claude CLI で質問
claude "このコードの問題点は何ですか？"

# ファイルの内容を解析
claude --file ./src/main.tsx

# 対話型シェル
claude --interactive
```

## 使用方法

### 1. Dev Container を開く

VS Code のコマンドパレット (`Ctrl+Shift+P`) で以下を実行：

```
Dev Containers: Open Folder in Container
```

このリポジトリのルートディレクトリを選択。

### 2. 開発サーバーを起動

コンテナ内で以下を実行：

```bash
# フロントエンド開発サーバー
make web-dev

# バックエンド開発サーバー（別ターミナルで）
make server-run
```

### 3. アクセス

- **フロントエンド**: http://localhost:3000
- **HTTPS プロキシ**: https://localhost:7001 または https://my.local.konomi.tv:7001
- **API サーバー**: http://localhost:8000

## 含まれるツール

- **Go 開発環境**
  - Go 1.22+
  - air (ホットリロード)
  - golangci-lint
  - swag (Swagger 生成)
  - sqlc
  - dbmate
  - goimports

- **Node.js 開発環境**
  - Node.js 20
  - Yarn

- **その他**
  - Caddy (HTTPS リバースプロキシ)
  - PostgreSQL クライアント
  - Docker (Docker-in-Docker)

## 利用可能なコマンド

```bash
make help              # 全コマンド一覧

# フロントエンド
make web-dev          # 開発サーバー起動
make web-build        # ビルド
make web-typecheck    # 型チェック
make web-lint         # ESLint

# バックエンド
make server-run       # 開発サーバー起動
make server-build     # ビルド
make server-test      # テスト
make server-fmt       # コードフォーマット
make server-lint      # リント

# データベース
make db-migrate       # マイグレーション実行
make db-dump          # スキーマダンプ
make db-new name=...  # 新規マイグレーション作成

# ツール
make generate-all     # Swagger + クライアント生成
```

## トラブルシューティング

### ポート競合エラー

別のプロセスがポートを使用している場合：

```bash
# macOS/Linux
lsof -i :3000   # ポート 3000 を使用しているプロセスを表示
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 依存関係の問題

コンテナを再構築：

```bash
# VS Code コマンドパレット (Ctrl+Shift+P)
Dev Containers: Rebuild Container
```

### ホットリロードが動作しない

Vite または air の設定を確認：

```bash
# apps/web/vite.config.ts
# server: { port: 3000, watch: { usePolling: true } }

# server/air.toml
# poll = true
```

## ホストマシンとの連携

### ファイル共有

コンテナ内のファイルは `/workspace` にマウントされており、ホストマシンと自動同期。

### Git

コンテナ内で Git を使用可能（ホストマシンの認証情報を使用）。

### Docker コマンド

Docker-in-Docker を使用可能：

```bash
docker ps   # コンテナ一覧表示
```

## 本番環境との違い

Dev Container は開発用であり、以下の点が本番環境と異なります：

- ホットリロード機能が有効
- デバッグツールが含まれている
- HTTPS は自己署名証明書を使用
- SQLite をローカルファイルで使用（本番は PostgreSQL）

## 参考リンク

- [VS Code Dev Containers ドキュメント](https://code.visualstudio.com/docs/remote/containers)
- [Docker ドキュメント](https://docs.docker.com/)
- [Caddy ドキュメント](https://caddyserver.com/docs/)
