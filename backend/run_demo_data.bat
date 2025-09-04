@echo off
echo ========================================
echo Running Demo Data Population Script
echo ========================================
echo.

cd /d "E:\Internship\NUDRRS\backend"
call venv\Scripts\activate
python populate_demo_data.py

echo.
echo ========================================
echo Demo data population complete!
echo ========================================
echo.
pause
