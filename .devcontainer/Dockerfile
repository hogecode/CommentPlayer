FROM mcr.microsoft.com/devcontainers/go:latest

ENV DEBIAN_FRONTEND=noninteractive

# システムパッケージ更新・インストール
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y \
    curl \
    wget \
    build-essential \
    ca-certificates \
    git \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 のインストール（Vite React 開発用）
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Yarn のインストール
RUN npm install -g yarn

# Caddy のインストール（HTTPS リバースプロキシ用）
RUN apt-get update && \
    apt-get install -y caddy && \
    rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ
WORKDIR /workspace

CMD ["/bin/bash"]
