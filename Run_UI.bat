@echo off
echo ===================================================
echo   Novatech Autonomous Vending Machine UI Setup
echo ===================================================
echo.
echo Installing React & Vite dependencies...
call npm install
echo.
echo Starting the Vite Development Server...
start "" npm run dev
echo.
echo Waiting for server to initialize...
timeout /t 4 /nobreak >nul
echo.
echo Launching Chrome in Fullscreen Kiosk Mode...
start chrome --kiosk --user-data-dir="%TEMP%\vending_kiosk_profile" http://localhost:5173
echo.
echo Setup complete. Close this window to exit, or press Ctrl+C in the server window.
pause
