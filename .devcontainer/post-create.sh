#!/bin/bash
set -e

echo "📦 開発環境をセットアップしています..."

# Docker グループ設定（vscode ユーザーが存在する場合）
if id vscode &>/dev/null; then
    if ! getent group docker &>/dev/null; then
        groupadd docker || true
    fi
    usermod -aG docker vscode || true
    echo "✅ Docker グループ設定完了"
fi

# Go モジュールのダウンロード
echo "⏳ Go モジュールをダウンロード中..."
cd /workspace/server && go mod download && go mod tidy

# Go 開発ツールのインストール（個別に実行してエラーハンドリング）
echo "⏳ Go 開発ツールをインストール中..."
go install github.com/cosmtrek/air@latest || true
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest || true
go install github.com/swaggo/swag/cmd/swag@latest || true
go install golang.org/x/tools/cmd/goimports@latest || true
go install github.com/mfridman/tparse@latest || true
go install github.com/amacneil/dbmate@latest || true

# Node.js 依存関係のインストール
echo "⏳ Node.js 依存関係をインストール中..."
cd /workspace/apps/web && yarn install

echo "✅ セットアップが完了しました！"
echo ""
echo "📝 次のステップ："
echo "  - make help           : 利用可能なコマンド一覧"
echo "  - make web-dev        : フロントエンド開発サーバー起動"
echo "  - make server-run     : バックエンド開発サーバー起動"
