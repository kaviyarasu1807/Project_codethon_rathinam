@echo off
REM NeuroPath ML Model Setup Script for Windows

echo ==========================================
echo NeuroPath ML Model Setup
echo ==========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo X Python is not installed. Please install Python 3.8 or higher.
    exit /b 1
)

echo √ Python found
python --version

REM Create virtual environment
echo.
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ==========================================
echo √ Setup Complete!
echo ==========================================
echo.
echo To activate the virtual environment, run:
echo   venv\Scripts\activate.bat
echo.
echo To train the model, run:
echo   python cognitive_twin_model.py
echo.
echo To start the ML API server, run:
echo   python ml_api_server.py
echo.
pause
