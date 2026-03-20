# Windows環境でのみ動作する

.PHONY: generate-server generate-client generate-all swagger-gen

# Ginコメントから swagger.yaml を生成
swagger-gen:
	powershell -Command "cd server && swag init -g cmd/main.go -o ../docs"

# React Query TypeScriptクライアント生成
generate-client:
	powershell -Command "docker run --rm -v \"$${PWD}:/local\" openapitools/openapi-generator-cli:latest generate -i /local/docs/swagger.yaml -g typescript-axios -o /local/frontend/src/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,hideGenerationTimestamp=true,modelPackage=models,apiPackage=api"

# swagger.yaml から全コード生成
generate-all: swagger-gen generate-client
	@echo "✅ Swagger とクライアントコードを生成しました"

# レガシー互換性のため
server: swagger-gen
