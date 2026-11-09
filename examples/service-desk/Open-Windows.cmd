@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale Node.js 22 ou superior em https://nodejs.org/en/download
  echo Install Node.js 22 or newer from https://nodejs.org/en/download
  pause
  exit /b 1
)
node server.mjs
pause
