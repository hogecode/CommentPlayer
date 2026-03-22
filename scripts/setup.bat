@echo off
REM Windows batch script for setup

setlocal enabledelayedexpansion

echo.
echo === Video App OpenAPI Code Generation Setup ===
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Warning: Docker is not installed. Please install Docker and try again.
    exit /b 1
)

echo OK: Docker is installed
echo.

REM Check if Make is installed (optional)
where make >nul 2>&1
if errorlevel 1 (
    echo Info: Make is not installed. Using docker-compose directly.
    set HAS_MAKE=false
) else (
    echo OK: Make is installed
    set HAS_MAKE=true
)
echo.

REM Generate Go Chi Server code
echo Generating Go Chi Server code...
if "!HAS_MAKE!"=="true" (
    make generate-server
) else (
    docker-compose up openapi-go-chi-server
)

if errorlevel 1 (
    echo Warning: Go Chi Server code generation might have failed
) else (
    echo OK: Go Chi Server code generated successfully
)
echo.

REM Generate React Query TypeScript client code
echo Generating React Query TypeScript client code...
if "!HAS_MAKE!"=="true" (
    make generate-client-win
) else (
    docker-compose up openapi-typescript-react-query
)

if errorlevel 1 (
    echo Warning: React Query TypeScript client code generation might have failed
) else (
    echo OK: React Query TypeScript client code generated successfully
)
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo Warning: Frontend dependency installation failed
    exit /b 1
) else (
    echo OK: Frontend dependencies installed successfully
)
cd ..
echo.

REM Create .env files if not exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo OK: .env file created
    echo.
)

if not exist frontend\.env.local (
    echo Creating frontend\.env.local file...
    (
        echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    ) > frontend\.env.local
    echo OK: frontend\.env.local file created
    echo.
)

echo === Setup completed successfully! ===
echo.
echo Next steps:
echo 1. Start the development server: npm run dev (in frontend directory)
echo 2. Review the generated code:
echo    - Go Chi Server: server/generated/
echo    - React Query hooks: frontend/src/hooks/useVideosQuery.ts
echo    - Generated API: frontend/src/generated/
echo.
echo For more information, see docs/code-generation.md
echo.

endlocal
