@echo off
title Store Rating Management System Launcher
echo ===================================================
echo   Store Rating Management System - Starting Up...
echo ===================================================
echo.
echo 1. Launching Backend Server on Port 5000...
start "Backend Server (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"

echo 2. Launching Frontend React App on Port 5173...
start "Frontend App (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   Both servers launched in separate windows!
echo   - Backend:  http://localhost:5000
echo   - Frontend: http://localhost:5173
echo ===================================================
echo.
echo Opening browser to http://localhost:5173 in 3 seconds...
timeout /t 3 >nul
start http://localhost:5173
echo Done! Keep the two server windows open while testing.
