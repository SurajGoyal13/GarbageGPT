@echo off
echo ========================================================
echo    GarbageGPT - Waste-to-Energy Intelligence Platform
echo       Built for Amazon Hackathon 2026 (Track 03)
echo ========================================================

echo [1/2] Starting FastAPI Backend on port 8000...
start cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo [2/2] Starting React Frontend on port 5173...
start cmd /k "cd frontend && npx vite --host 0.0.0.0 --port 5173"

echo.
echo ========================================================
echo All servers launched!
echo Open your browser at: http://localhost:5173
echo API Docs at: http://localhost:8000/docs
echo ========================================================
pause
