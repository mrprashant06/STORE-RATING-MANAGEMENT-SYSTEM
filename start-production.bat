@echo off
title Store Rating Management System - Production Single-Port Server
echo ===================================================
echo   Store Rating Management System - Production Mode
echo ===================================================
echo.
echo Checking if frontend is built...
if not exist "%~dp0frontend\dist\index.html" (
    echo Building production frontend first...
    cd /d "%~dp0frontend"
    call npx vite build
    cd /d "%~dp0"
)

echo.
echo Starting Production Express Server (Serving both API & React UI)...
echo URL: http://localhost:5000
echo.
set NODE_ENV=production
node backend/server.js
pause
