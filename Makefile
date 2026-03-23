.PHONY: help setup-dev dev web-dev web-build web-lint web-typecheck server-run server-build server-test server-fmt server-lint server-clean db-migrate db-setup-test db-rollback db-new db-dump db-migrate-test sqlc-generate seed goimports goimports-check generate-all swagger-gen-win generate-client-win up down

help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

## ========================
## 開発環境セットアップ
## ========================

setup-dev: ## 開発環境をセットアップ（DevContainer用）
	@echo "📦 開発環境をセットアップしています..."
	cd apps/web && yarn install
	cd server && go mod download
	go install github.com/air-verse/air@latest
	@echo "✅ セットアップが完了しました。'make help' でコマンド一覧を表示します。"


## ========================
## Docker Compose - 開発環境（ホットリロード）
## ========================

up: ## ホットリロード開発環境を起動（Vite + air + Caddy）
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up

down: ## 開発環境を停止
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml down

build: ## 開発環境をビルド
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml build

logs: ## 開発環境のログを表示
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml logs -f

ps: ## 開発環境のコンテナ状態を表示
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml ps

## ========================
## Docker Compose - 本番環境
## ========================

up-prod: ## 本番環境を起動（ビルド済みバイナリ + 静的配信）
	docker compose -f docker-compose.prod.yaml up -d

down-prod: ## 本番環境を停止
	docker compose -f docker-compose.prod.yaml down

build-prod: ## 本番環境をビルド
	docker compose -f docker-compose.prod.yaml build

logs-prod: ## 本番環境のログを表示
	docker compose -f docker-compose.prod.yaml logs -f

ps-prod: ## 本番環境のコンテナ状態を表示
	docker compose -f docker-compose.prod.yaml ps


## フロントエンド (apps/web) コマンド
## ========================

web-dev: ## Vite React開発サーバーを起動
	cd apps/web && yarn dev

web-build: ## Vite React をビルド
	cd apps/web && yarn build

web-typecheck: ## TypeScriptをチェック（ビルドなし）
	cd apps/web && yarn typecheck

web-lint: ## ESLintでリント
	cd apps/web && yarn lint

web-preview: ## ビルド後のプレビュー
	cd apps/web && yarn preview


## ========================
## バックエンド (server) コマンド
## ========================

server-run: ## サーバーを起動
	cd server && air -c .air.toml

server-run-win: ## サーバーを起動
	cd server && powershell -NoProfile -Command "Start-Process air -NoNewWindow -Wait"

server-build: ## バイナリをビルド
	cd server && go build -o bin/server cmd/server/main.go

server-test: db-setup-test ## テストを実行
	cd server && @which tparse > /dev/null || (echo "Installing tparse from go.mod..." && go install github.com/mfridman/tparse@latest)
	cd server && @bash -c 'set -o pipefail && go test -json -race ./... | tparse -all'

server-fmt: ## コードをフォーマット
	cd server && go fmt ./...
	@$(MAKE) goimports

server-lint: ## golangci-lintを実行
	cd server && @echo "🔍 golangci-lintを実行中..." && golangci-lint run --config=.golangci.yml ./...

server-clean: ## ビルド成果物をクリーン
	cd server && rm -rf bin/
	cd server && find . -name "*_templ.go" -type f -delete


## ========================
## データベースコマンド
## ========================

db-migrate: ## データベースマイグレーションを実行
	cd server && APP_ENV=dev op run --env-file=".env" -- dbmate up
	cd server && @sed -i '/^\\restrict /d;/^\\unrestrict /d' db/schema.sql

db-setup-test: ## テスト用データベースのスキーマをセットアップ
	@if [ "$$CI" = "true" ]; then \
		echo "CI環境: テストDBをリセットしてスキーマを適用"; \
		psql -h localhost -U postgres -d annict_test -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' > /dev/null 2>&1; \
		psql -h localhost -U postgres -d annict_test -f server/db/schema.sql > /dev/null; \
	else \
		echo "ローカル環境: テストDBをリセットしてスキーマを適用"; \
		psql -h postgresql -U postgres -d annict_test -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' > /dev/null 2>&1; \
		psql -h postgresql -U postgres -d annict_test -f server/db/schema.sql > /dev/null; \
	fi

db-rollback: ## 最後のマイグレーションをロールバック
	cd server && APP_ENV=dev op run --env-file=".env" -- dbmate down

db-new: ## 新しいマイグレーションファイルを作成（使用法: make db-new name=create_users）
	cd server && dbmate new $(name)

db-dump: ## データベーススキーマをdb/schema.sqlにダンプ
	cd server && APP_ENV=dev op run --env-file=".env" -- dbmate dump
	cd server && @sed -i '/^\\restrict /d;/^\\unrestrict /d' db/schema.sql

db-migrate-test: ## テスト環境のマイグレーションを実行（非推奨、db-setup-testを使用）
	@echo "警告: db-migrate-testは非推奨です。代わりにdb-setup-testを使用してください。"
	@make db-setup-test


## ========================
## コード生成・ツール
## ========================

seed: ## 開発環境用のシードデータを生成
	@echo "シードデータを生成しています..."
	cd server && APP_ENV=dev op run --env-file=".env" -- go run cmd/seed/main.go

goimports: ## goimportsでimport文を整理
	cd server && @which goimports > /dev/null || (echo "Installing goimports from go.mod..." && go install golang.org/x/tools/cmd/goimports)
	cd server && goimports -w .

goimports-check: ## goimportsでimport文をチェック（差分があればエラー）
	cd server && @which goimports > /dev/null || (echo "Installing goimports from go.mod..." && go install golang.org/x/tools/cmd/goimports)
	cd server && @unformatted=$$(goimports -l .); \
	if [ -n "$$unformatted" ]; then \
		echo "The following files have incorrect imports:"; \
		echo "$$unformatted"; \
		echo ""; \
		echo "Please run 'make goimports' to fix imports"; \
		exit 1; \
	fi


## ========================
## API コード生成 (Windows用)
## ========================

swagger-gen-win: ## Ginコメントから swagger.yaml を生成
	powershell -ExecutionPolicy Bypass -File scripts/gen-swagger.ps1

generate-client-win: ## React Query TypeScriptクライアント生成
	powershell -Command "docker run --rm -v \"$${PWD}:/local\" openapitools/openapi-generator-cli:latest generate -i /local/docs/swagger.yaml -g typescript-axios -o /local/apps/web/src/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,hideGenerationTimestamp=true,modelPackage=models,apiPackage=apis"

generate-all-win: swagger-gen-win generate-client-win ## swagger.yaml から全コード生成
	@echo "✅ Swagger とクライアントコードを生成しました"
