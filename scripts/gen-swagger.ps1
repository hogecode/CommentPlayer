$gopath = go env GOPATH
$swagPath = "$gopath\bin\swag.exe"

if (-not (Test-Path $swagPath)) {
    Write-Host "Installing swag..."
    go install github.com/swaggo/swag/cmd/swag@latest
}

$env:Path += ";$gopath\bin"

cd server
swag init --parseDependency --parseDepth 2 --dir internal/handler  -g app.go -o ../docs