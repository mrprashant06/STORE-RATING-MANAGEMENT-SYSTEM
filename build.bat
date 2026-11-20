@echo off
title Store Rating Management System - Production Build
echo ===================================================
echo   Building Production React Frontend Bundle...
echo ===================================================
cd /d %~dp0frontend
call npx vite build
echo.
echo ===================================================
echo   Production build completed! 
echo   Assets generated in: frontend/dist
echo ===================================================
pause
