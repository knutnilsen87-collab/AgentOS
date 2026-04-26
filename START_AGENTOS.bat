@echo off
setlocal

cd /d "%~dp0"

echo Starting AgentOS from %CD%
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\dev.ps1"

if errorlevel 1 (
  echo.
  echo AgentOS failed to start. Check the message above.
  pause
)
