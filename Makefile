# Windows環境でのみ動作する

.PHONY: generate-server generate-client generate-all

# Echo Serverコード生成
generate-server:
	powershell -Command "docker run --rm -v \"$${PWD}:/local\" openapitools/openapi-generator-cli:latest generate -i /local/docs/swagger.yaml -g go-gin-server -o /local/server/generated --skip-validate-spec --additional-properties=packageName=generated,hideGenerationTimestamp=true,serverPort=8000"

# React Query TypeScriptクライアント生成
generate-client:
	powershell -Command "docker run --rm -v \"$${PWD}:/local\" openapitools/openapi-generator-cli:latest generate -i /local/docs/swagger.yaml -g typescript-axios -o /local/frontend/src/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,hideGenerationTimestamp=true,modelPackage=models,apiPackage=api"

# 両方生成
generate-all: generate-server generate-client
	@echo "✅ Echo Server と React Query TypeScript コードを生成しました"

# レガシー互換性のため
server: generate-server
