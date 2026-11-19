@echo off
title Vedabhyas College Predictor
echo Starting Vedabhyas College Predictor on http://localhost:4173 ...
cd /d "%~dp0"
start "" http://localhost:4173
call npm.cmd run preview -- --port 4173 --host 127.0.0.1
pause
