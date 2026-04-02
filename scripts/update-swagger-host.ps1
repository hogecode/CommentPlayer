# Swagger host/schemes を config.yaml から読み込んで app.go を置換し、swag init を実行
# Usage: .\scripts\update-swagger-host.ps1
# Do not write nonASCII characters logs in this file to avoid encoding issues.

param(
    [string]$ConfigFile = "server/config.yaml",
    [string]$AppGoFile = "server/internal/handler/app.go"
)

Write-Host "Reading Swagger host/schemes from config.yaml..." -ForegroundColor Cyan

# デフォルト値
$host_value = "localhost:8000"
$schemes_value = "http"

# config.yaml が存在するか確認
if (Test-Path $ConfigFile) {
    # config.yaml を読み込む
    $content = Get-Content $ConfigFile -Raw
    
    # server.host を抽出
    $host_extracted = $null
    if ($content -match "host:\s*[`"`']?([^`"`'\n]+)[`"`']?") {
        $host_extracted = $matches[1].Trim()
    }
    
    # server.port を抽出
    $port_extracted = $null
    if ($content -match "port:\s*(\d+)") {
        $port_extracted = $matches[1].Trim()
    }
    
    # server.schemes を抽出
    $schemes_extracted = $null
    if ($content -match "schemes:\s*[`"`']?([^`"`'\n]+)[`"`']?") {
        $schemes_extracted = $matches[1].Trim()
    }
    
    # デフォルト値の設定
    if ([string]::IsNullOrEmpty($host_extracted)) {
        $host_extracted = "localhost"
        Write-Host "server.host not found. Default: localhost" -ForegroundColor Yellow
    }
    
    if ([string]::IsNullOrEmpty($port_extracted)) {
        $port_extracted = "8000"
        Write-Host "server.port not found. Default: 8000" -ForegroundColor Yellow
    }
    
    if ([string]::IsNullOrEmpty($schemes_extracted)) {
        $schemes_extracted = "http"
        Write-Host "server.schemes not found. Default: http" -ForegroundColor Yellow
    }
    
    $host_value = "$host_extracted`:$port_extracted"
    $schemes_value = $schemes_extracted
} else {
    Write-Host "Warning: Config file not found: $ConfigFile" -ForegroundColor Yellow
    Write-Host "Using default values: localhost:8000" -ForegroundColor Yellow
}

Write-Host "Swagger Configuration" -ForegroundColor Green
Write-Host "  Host: $host_value"
Write-Host "  Schemes: $schemes_value"

# app.go ファイルが存在するか確認
if (-not (Test-Path $AppGoFile)) {
    Write-Host "Error: $AppGoFile not found" -ForegroundColor Red
    exit 1
}

# app.go を読み込む
$appGoContent = Get-Content $AppGoFile -Raw

# @host と @schemes をコメント置換
$updatedContent = $appGoContent -replace "// @host [^\n]*", "// @host $host_value"
$updatedContent = $updatedContent -replace "// @schemes [^\n]*", "// @schemes $schemes_value"

# app.go に書き込む
Set-Content -Path $AppGoFile -Value $updatedContent -Encoding UTF8 -NoNewline

Write-Host "Updated app.go" -ForegroundColor Green

# swag init を実行
Write-Host ""
Write-Host "Executing swag init..." -ForegroundColor Cyan

# swag がインストールされているか確認
$gopath = go env GOPATH
$swagPath = "$gopath\bin\swag.exe"

if (-not (Test-Path $swagPath)) {
    Write-Host "Installing swag..."
    go install github.com/swaggo/swag/cmd/swag@latest
}

$binPath = "$gopath\bin"
$env:Path = "$env:Path;$binPath"

Push-Location server
try {
    swag init --parseDependency --parseDepth 2 --dir internal/handler -g app.go -o ../docs
    Write-Host "Generated Swagger documentation" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to execute swag init: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

# docs/swagger.json を handler 配下にコピー
if (Test-Path "docs/swagger.json") {
    Copy-Item -Path "docs/swagger.json" -Destination "server/internal/handler/swagger.json" -Force
    Write-Host "Copied swagger.json" -ForegroundColor Green
}

Write-Host ""
Write-Host "Swagger generation process completed!" -ForegroundColor Green
Write-Host "   Host: $host_value" -ForegroundColor Green
Write-Host "   Schemes: $schemes_value" -ForegroundColor Green
