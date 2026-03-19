# =========================
# ビルドステージ
# =========================
FROM golang:1.26-alpine AS builder

# 必要なパッケージ
RUN apk add --no-cache git build-base

WORKDIR /app

# 依存ファイルだけ先にコピー → キャッシュ利用
COPY go.mod go.sum ./
RUN go mod tidy
RUN go mod download

# ソースをコピー
COPY . .

# メインパッケージだけビルド
# cmd/main.go がエントリーポイントの場合
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -v -o generated ./cmd

# =========================
# ランタイムステージ
# =========================
FROM alpine:3.18

WORKDIR /app

# 実行ユーザーを作成
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# ビルド成果物をコピー
COPY --from=builder /app/generated .

EXPOSE 8000

ENTRYPOINT ["./generated"]
