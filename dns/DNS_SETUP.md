# DNS サーバー セットアップガイド

## 概要

このプロジェクトでは、**dnsmasq** をローカル開発環境にカスタムドメイン `app.local` を設定しています。これにより、Caddy で自己署名 HTTPS 証明書を使用して `https://app.local` でアプリケーションにアクセスできます。

## セットアップ手順

### 方法A: PowerShell スクリプトで自動設定（推奨・管理者権限不要の場合）

**管理者権限がない場合:**

以下のスクリプトを実行して hosts ファイルを更新します：

```powershell
# PowerShell を管理者権限で実行
# 以下のコマンドをペースト
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$entry = "127.0.0.1       app.local"

# 既に存在するかチェック
if (-not (Select-String -Path $hostsPath -Pattern "app\.local" -Quiet)) {
    # 末尾に追加
    Add-Content -Path $hostsPath -Value "`n$entry" -Encoding UTF8
    Write-Host "hosts ファイルに app.local を追加しました"
} else {
    Write-Host "app.local は既に hosts ファイルに存在します"
}
```

### 方法B: 手動で hosts ファイルを編集

**hosts ファイルの場所:**
```
C:\Windows\System32\drivers\etc\hosts
```

**以下の行を追加:**
```
127.0.0.1       app.local
```

ファイルを管理者権限で編集してください。

### 方法C: localhost でアクセス（hosts 編集なし）

hosts ファイルへのアクセス権限がない場合は、以下で直接アクセスできます：
```
https://localhost
```
SSL 警告が表示されたら、**「続行」** をクリックしてください。

### 2. Docker Compose を起動

```bash
docker-compose up -d
```

以下のコンテナが起動します：
- `commeplayer-dns` - dnsmasq DNS サーバー（ポート 53）
- `commeplayer-caddy` - Caddy リバースプロキシ（ポート 80, 443）
- `commeplayer-frontend` - React フロントエンド（ポート 3000）
- `commeplayer-backend` - Go バックエンド（ポート 8000）

### 3. ブラウザでアクセス

```
https://app.local
```

## 自己署名証明書の警告について

Caddy は開発環境用に自動的に自己署名証明書を生成します（`tls internal` の設定）。

ブラウザで SSL 警告が表示された場合：

### Chrome/Edge の場合
1. 警告画面で **「詳細」** をクリック
2. **「app.local にアクセスする（安全ではありません）」** をクリック

### Firefox の場合
1. 警告画面で **「詳細情報」** をクリック
2. **「リスクを承知で続行」** をクリック

### 警告を永続的に無効化したい場合
Windows の場合は、以下のツールで自己署名証明書をローカルマシンの信頼済み CA に追加できます：

```bash
# Caddy が生成した証明書を取得
docker cp commeplayer-caddy:/data/caddy/pki/authorities/local/root.crt ./root.crt

# Windows にインストール（管理者権限が必要）
certutil -addstore -f "Root" root.crt
```

その後、ブラウザを再起動してください。

## DNS 設定の詳細

### dnsmasq.conf（DNS 設定ファイル）
```
# DNS サーバーを起動するポート
port=53

# ログ出力
log-queries
log-facility=/var/log/dnsmasq.log

# app.local をカスタムホストと定義
address=/app.local/127.0.0.1

# ローカルホストもサポート
address=/localhost/127.0.0.1

# upstreamのDNS（外部DNSクエリ用）
server=8.8.8.8
server=8.8.4.4

# インターフェース設定
listen-address=0.0.0.0
bind-interfaces

# キャッシュサイズ
cache-size=1000
```

### アクセス可能な URL

| URL | 説明 |
|-----|------|
| `https://app.local` | メインアプリケーション（HTTPS） |
| `http://localhost` | メインアプリケーション（HTTP） |
| `https://app.local/api/*` | API エンドポイント |

## トラブルシューティング

### DNS が解決できない

1. **DNS サーバーが起動しているか確認:**
   ```bash
   docker ps | grep dns
   ```

2. **ポート 53 が使用可能か確認（Windows の場合）:**
   ```powershell
   netstat -ano | findstr :53
   ```
   既に別のプロセスが使用している場合は、そのプロセスを停止するか、`dns/dnsmasq.conf` の `port=53` を別のポート番号に変更してください。

3. **hosts ファイルが正しく編集されているか確認:**
   ```bash
   ping app.local
   ```

4. **dnsmasq コンテナのログを確認:**
   ```bash
   docker logs commeplayer-dns
   ```

### Caddy の証明書エラー

1. **Caddy コンテナを再起動:**
   ```bash
   docker restart commeplayer-caddy
   ```

2. **キャッシュされた証明書をクリア:**
   ```bash
   docker volume rm commeplayer_caddy_data commeplayer_caddy_config
   docker-compose up -d caddy
   ```

### Docker ネットワーク内で app.local にアクセスできない

Docker ネットワーク内のコンテナは、`app.local` ではなく `caddy` という DNS 名を使用してください。

```javascript
// コンテナ内からのアクセス例
fetch('http://caddy/api/videos')
```

## 後方互換性

`localhost` でのアクセスも引き続きサポートされています：
```
http://localhost
https://localhost
```

## 環境変数の設定

フロントエンド・バックエンドの API URL を設定する際は、環境に応じて以下を使用してください：

**開発環境（ホストマシン）:**
```
VITE_API_URL=https://app.local/api
```

**Docker コンテナ内:**
```
VITE_API_URL=http://caddy/api
```

## 参考リンク

- [CoreDNS 公式ドキュメント](https://coredns.io/)
- [Caddy 公式ドキュメント](https://caddyserver.com/docs/)
- [Windows hosts ファイルについて](https://support.microsoft.com/ja-jp/help/972034)
