# Fraud Detection System - Startup Script
# Запуск фронтенда и бэкенда одновременно

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FRAUD DETECTION SYSTEM" -ForegroundColor Cyan
Write-Host "   Starting services..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Запуск бэкенда в новом окне PowerShell
Write-Host "[1/2] Starting Backend (FastAPI)..." -ForegroundColor Yellow
$backendPath = Join-Path $projectRoot "backend\app"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend starting on http://localhost:8000' -ForegroundColor Green; uvicorn main:app --reload --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2

# Запуск фронтенда в новом окне PowerShell
Write-Host "[2/2] Starting Frontend (Vite + React)..." -ForegroundColor Yellow
$frontendPath = Join-Path $projectRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend starting on http://localhost:5173' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Services started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to open frontend in browser..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:5173"
