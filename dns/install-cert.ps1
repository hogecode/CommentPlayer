# Caddy自己署名証明書をWindowsの信頼済みCAに追加するスクリプト
# 管理者権限で実行してください

Write-Host "Caddy証明書をWindowsにインストール中..." -ForegroundColor Cyan

# 証明書ファイルのパス
$certPath = "C:\Users\user\AppData\Local\Temp\root.crt"

# ファイルが存在するか確認
if (-not (Test-Path $certPath)) {
    Write-Host "エラー: 証明書ファイルが見つかりません" -ForegroundColor Red
    Write-Host "以下のコマンドをまず実行してください:" -ForegroundColor Yellow
    Write-Host "docker cp commeplayer-caddy:/data/caddy/pki/authorities/local/root.crt C:\Users\user\AppData\Local\Temp\root.crt" -ForegroundColor Yellow
    exit
}

try {
    # 証明書をRoot CAストアに追加
    certutil -addstore -f "Root" $certPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 証明書の追加に成功しました" -ForegroundColor Green
        Write-Host "`n次のステップ:" -ForegroundColor Cyan
        Write-Host "1. ブラウザを完全に閉じてください"
        Write-Host "2. 再度ブラウザを開き、https://app.local にアクセスしてください"
        Write-Host "3. 証明書エラーが消えているはずです"
    } else {
        Write-Host "✗ 証明書の追加に失敗しました" -ForegroundColor Red
        Write-Host "このスクリプトを管理者権限で実行してください"
    }
} catch {
    Write-Host "エラーが発生しました: $_" -ForegroundColor Red
}
