@echo off
title Q-Flow Backend Server
echo ===================================================
echo Starting Q-Flow Smart Queue Backend (Spring Boot 3)
echo Port: http://localhost:8080
echo Database: Embedded MySQL-compatible H2 mode
echo ===================================================
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot
cd /d "%~dp0backend"
"C:\Users\manim\.gemini\antigravity\scratch\apache-maven\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
pause
