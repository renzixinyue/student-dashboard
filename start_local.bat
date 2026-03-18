@echo off
echo Starting Student Dashboard System...
echo ====================================
echo.
echo [1/3] Checking environment...
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo.
echo [2/3] Starting backend and frontend services...
echo Please wait for the browser to open automatically...
echo.
echo Backend URL: http://localhost:3001
echo Frontend URL: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server.
echo.

call npm run dev
pause
