# Do not write non-ascii characters in make task to avoid encoding issues. 

.PHONY: help setup-dev dev web-dev web-build web-lint web-typecheck server-run server-build server-test server-fmt server-lint server-clean set-gcc-env db-migrate db-setup-test db-rollback db-new db-dump db-migrate-test sqlc-generate seed goimports goimports-check generate-all swagger-gen-win generate-client-win up down


help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

## ========================
## 開発環境セットアップ
## ========================

setup-dev: ## 開発環境をセットアップ（DevContainer用）
	@echo "Installing dependencies..."
	cd apps/web && yarn install
	cd server && go mod download
	go install github.com/air-verse/air@latest
	@echo "✅ Setup complete. Run 'make help' to see the list of commands."


## ========================
## Docker Compose - 開発環境（ホットリロード）
## ========================

up: ## ホットリロード開発環境を起動（Vite + air + Caddy）
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up

down: ## 開発環境を停止
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml down

build: ## 開発環境をビルド
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml build


## ========================
## Docker Compose - 本番環境
## ========================

up-prod: ## 本番環境を起動（ビルド済みバイナリ + 静的配信）
	docker compose -f docker-compose.dns.yaml up -d

down-prod: ## 本番環境を停止
	docker compose -f docker-compose.dns.yaml down


## フロントエンド (apps/web) コマンド
## ========================

web-dev: ## Vite React開発サーバーを起動
	cd apps/web && yarn dev

web-build: ## Vite React をビルド
	cd apps/web && yarn build

web-lint: ## ESLintでリント
	cd apps/web && yarn lint


## ========================
## バックエンド (server) コマンド
## ========================

server-dev: ## サーバーを起動
	cd server && go run cmd/main.go serve

server-run-hot: ## サーバーをホットリロードで起動
	cd server && air -c .air.toml

server-test: db-setup-test ## テストを実行
	cd server && @which tparse > /dev/null || (echo "Installing tparse from go.mod..." && go install github.com/mfridman/tparse@latest)
	cd server && @bash -c 'set -o pipefail && go test -json -race ./... | tparse -all'

server-fmt: ## コードをフォーマット
	cd server && go fmt ./...
	@$(MAKE) goimports

server-lint: ## golangci-lintを実行
	cd server && @echo "🔍 golangci-lintを実行中..." && golangci-lint run --config=.golangci.yml ./...


## ========================
## インストーラコマンド
## ========================
installer-build: ## バイナリをビルド
	cd installer && go build -o bin/ main.go


## ========================
## コード生成・ツール
## ========================

seed: ## 開発環境用のシードデータを生成
	@echo "Generating seed data..."
	cd server && op run --env-file=".env" -- go run cmd/seed/main.go

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

sqlc-generate: ## sqlcでコード生成
	cd server && sqlc generate

db-migrate: ## dbmateでマイグレーションを実行
	cd server && @which dbmate > /dev/null || (echo "Installing dbmate from go.mod..." && go install github.com/amacneil/dbmate@latest)
	cd server && dbmate -d db/migrations up

.PHONY: db-migrate-down
db-migrate-down:
	cd server && dbmate -d db/migrations down

.PHONY: db-migrate-new
db-migrate-new:
	cd server && dbmate -d db/migrations new $(NAME)

	
## ========================
## API コード生成 (Windows用)
## ========================

generate-yaml-win: ## swagger.yaml を生成
	powershell -ExecutionPolicy Bypass -File scripts/update-swagger-host.ps1

generate-client-docker-win: ## Axios TypeScriptクライアント生成
	powershell -Command "docker run --rm -v \"$${PWD}:/local\" openapitools/openapi-generator-cli:latest generate -i /local/docs/swagger.yaml -g typescript-axios -o /local/apps/web/src/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,hideGenerationTimestamp=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=apis"

generate-client-win: ## Axios TypeScriptクライアント生成
	npx @openapitools/openapi-generator-cli generate -i docs/swagger.yaml -g typescript-axios -o apps/web/src/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,hideGenerationTimestamp=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=apis

generate-all-win: generate-yaml-win generate-client-docker-win  ## swagger.yaml から全コード生成
	@echo "✅ Swagger and client code generated"