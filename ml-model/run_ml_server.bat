@echo off
REM Start NeuroPath ML API Server

echo ==========================================
echo Starting NeuroPath ML API Server
echo ==========================================

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start Flask server
python ml_api_server.py

pause
