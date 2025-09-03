@echo off
echo Setting up NUDRRS development environment...
echo ========================================

:: Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

:: Create and activate virtual environment
echo.
echo Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

:: Install backend dependencies
echo.
echo Installing backend dependencies...
pip install -r backend/requirements.txt

:: Run migrations
echo.
echo Running database migrations...
cd backend
python manage.py migrate
cd ..

:: Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo ========================================
echo Setup complete!
echo.
echo To start the development servers:
echo 1. Start backend: cd backend && python manage.py runserver
echo 2. Start frontend: cd frontend && npm start
echo.
pause
