#!/bin/bash

echo "📦 開発環境をセットアップしています..."

# Claude CLI のインストール/確認
echo "⏳ Claude CLI をインストール中..."
npm install -g @anthropic-ai/claude-cli 2>&1 || echo "Warning: Claude CLI installation failed"

# Claude API キー設定
if [ -n "$CLAUDE_API_KEY" ]; then
    echo "✅ Claude API キーが設定されています"
    export ANTHROPIC_API_KEY="$CLAUDE_API_KEY"
elif [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "✅ ANTHROPIC_API_KEY が設定されています"
else
    echo "⚠️  Claude API キーが設定されていません"
    echo "   devcontainer.json に CLAUDE_API_KEY 環境変数を設定してください"
fi

# Go モジュールのダウンロード
echo "⏳ Go モジュールをダウンロード中..."
cd /workspace/server
go mod download 2>&1 || echo "Warning: go mod download failed"
go mod tidy 2>&1 || echo "Warning: go mod tidy failed"

# Go 開発ツールのインストール（個別に実行してエラーハンドリング）
echo "⏳ Go 開発ツールをインストール中..."
go install github.com/cosmtrek/air@latest 2>&1 || echo "Warning: air installation failed"
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest 2>&1 || echo "Warning: golangci-lint installation failed"
go install github.com/swaggo/swag/cmd/swag@latest 2>&1 || echo "Warning: swag installation failed"
go install golang.org/x/tools/cmd/goimports@latest 2>&1 || echo "Warning: goimports installation failed"
go install github.com/mfridman/tparse@latest 2>&1 || echo "Warning: tparse installation failed"
go install github.com/amacneil/dbmate@latest 2>&1 || echo "Warning: dbmate installation failed"

# Node.js 依存関係のインストール
echo "⏳ Node.js 依存関係をインストール中..."
cd /workspace/apps/web
yarn install 2>&1 || echo "Warning: yarn install failed"

echo "✅ セットアップが完了しました！"
echo ""
echo "📝 次のステップ："
echo "  - make help           : 利用可能なコマンド一覧"
echo "  - make web-dev        : フロントエンド開発サーバー起動"
echo "  - make server-run     : バックエンド開発サーバー起動"
echo ""
