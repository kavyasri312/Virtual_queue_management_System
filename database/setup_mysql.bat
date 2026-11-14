@echo off
title MySQL 8 Database Setup for Q-Flow
echo ========================================================
echo Importing Q-Flow Schema and Sample Data into MySQL 8
echo ========================================================
echo.
echo Please ensure your MySQL Server service is running on port 3306.
echo.
set /p MYSQL_USER=Enter MySQL username [default: root]: 
if "%MYSQL_USER%"=="" set MYSQL_USER=root

echo Importing database/smart_queue_schema.sql...
mysql -u %MYSQL_USER% -p < "%~dp0smart_queue_schema.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] MySQL Database 'smart_queue_db' has been created and populated!
    echo To run the backend with MySQL, use:
    echo   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
) else (
    echo.
    echo [ERROR] Failed to import schema. Please verify MySQL service and credentials.
)
pause
