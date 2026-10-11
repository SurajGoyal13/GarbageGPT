@echo off
echo ========================================================
echo   Starting GarbageGPT Waste-to-Energy Frontend
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error during npm install!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Launching Vite development server at http://localhost:5173 ...
call npm run dev

pause
