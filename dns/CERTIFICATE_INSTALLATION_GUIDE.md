# Caddy 自己署名証明書 インストールガイド

## 問題
`https://app.local` にアクセスすると SSL/HTTPS 証明書エラーが表示される

## 解決方法（3つから選択）

### 方法1: PowerShell スクリプトで自動インストール（推奨）

**手順:**

1. **PowerShell を管理者権限で起動する**
   - Windows キーを押して「PowerShell」と入力
   - 右クリック → 「管理者として実行」を選択

2. **スクリプトを実行**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
   C:\Users\user\install-cert.ps1
   ```

3. **ブラウザを完全に閉じる**
   - すべてのブラウザウィンドウを終了

4. **ブラウザを再起動して確認**
   ```
   https://app.local
   ```

### 方法2: 手動で Windows 証明書ストアに追加

**手順:**

1. **証明書ファイルを抽出** （まだしていなければ）
   ```powershell
   docker cp commeplayer-caddy:/data/caddy/pki/authorities/local/root.crt "C:\Users\user\AppData\Local\Temp\root.crt"
   ```

2. **証明書マネージャーで追加**
   - ファイルエクスプローラーで `C:\Users\user\AppData\Local\Temp\root.crt` を開く
   - ファイルをダブルクリック
   - 「証明書のインストール」をクリック
   - 「ローカルマシン」を選択
   - パスワードを入力（管理者権限）
   - 「信頼されたルート証明機関」ストアに配置
   - 完了

3. **ブラウザキャッシュをクリア**
   - Chrome/Edge: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - ブラウザを完全に再起動

### 方法3: ブラウザの警告を無視してアクセス（一時的な対応）

**Chrome/Edge の場合:**
1. 警告画面で「詳細」をクリック
2. 「app.local にアクセスする（安全ではありません）」をクリック

**Firefox の場合:**
1. 警告画面で「詳細情報」をクリック
2. 「リスクを承知して続行」をクリック

⚠️ この方法は毎回警告が表示されます

### 方法4: localhost でアクセス（別のドメインを使用）

hosts ファイルを編集せず、localhost で直接アクセスします：

```
https://localhost
```

**ただし、この場合も自己署名証明書の警告が表示されます**

## トラブルシューティング

### PowerShell スクリプトが実行できない場合

```powershell
# 実行ポリシーを一時的に変更
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# その後スクリプトを実行
C:\Users\user\install-cert.ps1
```

### 「アクセスが拒否されました」エラーが出た場合

PowerShell を**管理者権限**で実行していることを確認してください：
- スタートメニュー → 右クリック
- 「Windows PowerShell (管理者)」を選択

### 証明書をアンインストールしたい場合

```powershell
# 証明書マネージャーを起動
certmgr.msc
```

1. 「信頼されたルート証明機関」 → 「証明書」を展開
2. 「caddy-root」を探す
3. 右クリック → 削除

## 推奨される方法

**方法1（PowerShell スクリプト）** が最も簡単です。以下の手順を実行してください：

```powershell
# 1. PowerShell を管理者権限で起動
# 2. 以下を実行
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; C:\Users\user\install-cert.ps1

# 3. ブラウザを完全に再起動
# 4. https://app.local にアクセス
```

---

**これで証明書警告なしに `https://app.local` にアクセスできるようになります！**
