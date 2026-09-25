@echo off
title Billing Software - Smart Bill Maker
echo ===================================================
echo     SMART BILLING SOFTWARE - STARTING...
echo ===================================================
cd /d "%~dp0"

echo Opening browser at http://localhost:5173/ ...
start http://localhost:5173/

echo Starting server...
npm run dev -- --port 5173 --host
pause
