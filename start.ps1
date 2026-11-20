Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Store Rating Management System - Starting Up...  " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

Write-Host "1. Launching Backend on Port 5000..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\backend`" && npm run dev"

Write-Host "2. Launching Frontend on Port 5173..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\frontend`" && npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  Both servers launched in separate windows!" -ForegroundColor Green
Write-Host "  - Backend  : http://localhost:5000" -ForegroundColor Green
Write-Host "  - Frontend : http://localhost:5173" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Opening http://localhost:5173 in default browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
