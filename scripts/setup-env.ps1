# Setup environment variables for CommentPlayer development
# This script configures PATH and CC for Windows development environment

# Requires administrator privileges
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Please run PowerShell with 'Run as Administrator' and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Setting up environment variables for CommentPlayer..." -ForegroundColor Cyan

# MSYS2 MinGW GCC path
$msys2GccPath = "C:\msys64\mingw64\bin"

# GnuWin32 Make path (common installation location)
$gnuWin32MakePath = "C:\Program Files (x86)\GnuWin32\bin"

# OpenSSL path (common Winget installation location)
$opensslPath = "C:\Program Files\OpenSSL\bin"

# Check if MSYS2 GCC is available
if (-not (Test-Path $msys2GccPath)) {
    Write-Host "WARNING: MSYS2 GCC path not found: $msys2GccPath" -ForegroundColor Yellow
    Write-Host "Please ensure MSYS2 is installed at C:\msys64" -ForegroundColor Yellow
} else {
    Write-Host "OK: Found MSYS2 GCC at $msys2GccPath" -ForegroundColor Green
}

# Get current user PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

# Array of paths to add
$pathsToAdd = @()

# Check and add MSYS2 GCC path
if ($currentPath -notlike "*$msys2GccPath*") {
    $pathsToAdd += $msys2GccPath
    Write-Host "Will add MSYS2 GCC path: $msys2GccPath" -ForegroundColor Cyan
} else {
    Write-Host "MSYS2 GCC path already in PATH" -ForegroundColor Green
}

# Check and add GnuWin32 Make path
if ($currentPath -notlike "*$gnuWin32MakePath*") {
    $pathsToAdd += $gnuWin32MakePath
    Write-Host "Will add GnuWin32 Make path: $gnuWin32MakePath" -ForegroundColor Cyan
} else {
    Write-Host "GnuWin32 Make path already in PATH" -ForegroundColor Green
}

# Check and add OpenSSL path
if ($currentPath -notlike "*$opensslPath*") {
    $pathsToAdd += $opensslPath
    Write-Host "Will add OpenSSL path: $opensslPath" -ForegroundColor Cyan
} else {
    Write-Host "OpenSSL path already in PATH" -ForegroundColor Green
}

# Add new paths to environment
if ($pathsToAdd.Count -gt 0) {
    $newPath = $currentPath + ";" + ($pathsToAdd -join ";")
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "Updated PATH environment variable" -ForegroundColor Green
}

# Set CC environment variable for Go CGO
$ccPath = "$msys2GccPath\gcc.exe"
[Environment]::SetEnvironmentVariable("CC", $ccPath, "User")
Write-Host "Set CC environment variable: $ccPath" -ForegroundColor Green

# Set CXX environment variable for G++
$cxxPath = "$msys2GccPath\g++.exe"
[Environment]::SetEnvironmentVariable("CXX", $cxxPath, "User")
Write-Host "Set CXX environment variable: $cxxPath" -ForegroundColor Green

Write-Host ""
Write-Host "Environment setup complete!" -ForegroundColor Green
Write-Host "Please restart PowerShell to apply the changes." -ForegroundColor Yellow
Write-Host ""
Write-Host "To verify, run the following commands in a new PowerShell window:" -ForegroundColor Cyan
Write-Host "  gcc --version" -ForegroundColor Gray
Write-Host "  g++ --version" -ForegroundColor Gray
Write-Host "  make --version" -ForegroundColor Gray
Write-Host "  openssl version" -ForegroundColor Gray
