@echo off
title Q-Flow Smart Queue Management System
echo ========================================================
echo    Launching Smart Queue Management System (Q-Flow)
echo ========================================================
echo.
echo 1. Starting Spring Boot Backend on http://localhost:8080...
start "Q-Flow Backend (Spring Boot)" cmd /k "%~dp0start-backend.bat"
echo.
echo Waiting 5 seconds for backend initialization...
timeout /t 5 /nobreak > nul
echo.
echo 2. Starting React Vite Frontend on http://localhost:5173...
start "Q-Flow Frontend (React)" cmd /k "%~dp0start-frontend.bat"
echo.
echo ========================================================
echo    Q-Flow Application Started Successfully!
echo    Frontend URL: http://localhost:5173
echo    Backend API:  http://localhost:8080/api
echo    H2 Console:   http://localhost:8080/h2-console
echo.
echo    Default Credentials:
echo    - Admin:    admin@smartqueue.com    / Admin@123
echo    - Staff:    dr.sharma@hospital.com  / Staff@123
echo    - Customer: john.doe@example.com    / Customer@123
echo ========================================================
