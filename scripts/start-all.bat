@echo off
REM Start all HyperMythsX services.
REM Usage: scripts\start-all.bat

cd /d "%~dp0\.."

echo === HyperMythsX Service Launcher ===
echo.

echo [1/4] Building kernel...
cargo build -p lx-core --release
if errorlevel 1 (echo Kernel build failed & exit /b 1)

echo [2/4] Starting kernel on :8787...
start "LX-Kernel" cmd /c "target\release\lx-core.exe"
timeout /t 2 /nobreak >nul

echo [3/4] Starting Hermes runtime on :8799...
start "Hermes" cmd /c "npm run dev:hermes"
timeout /t 1 /nobreak >nul

echo [4/4] Starting companion on :8798...
start "Companion" cmd /c "npm run dev:companion"
timeout /t 1 /nobreak >nul

echo.
echo === All services started ===
echo   Kernel:    http://127.0.0.1:8787
echo   Hermes:    http://127.0.0.1:8799
echo   Companion: http://127.0.0.1:8798
echo.
echo Starting web operator on :3000...
npm run dev:web
