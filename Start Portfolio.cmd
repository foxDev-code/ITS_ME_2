@echo off
cd /d "%~dp0"
node "%~dp0serve.mjs" --open
if errorlevel 1 pause
