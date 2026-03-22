FROM node:20-alpine

# 作業ディレクトリ
WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json package-lock.json ./

# 依存関係インストール（dev依存も含む）
RUN npm install

# ソースをコピー
COPY . .

# ポート設定
EXPOSE 3000

# 実行（開発モードまたは production モードに応じて変更可能）
CMD ["npm", "run", "dev"]
# CMD ["npm", "start"]  # production で SSR 実行する場合