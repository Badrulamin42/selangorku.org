@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-selangorku.ps1"
set "result=%errorlevel%"
if "%result%"=="0" (
  echo Deployment completed. You can close this window.
) else (
  echo Deployment failed. Copy the error above before closing this window.
)
pause
exit /b %result%
