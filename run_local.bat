@echo off
title EcoRoute AI - Local Server
echo ======================================================================
echo   EcoRoute AI: Vehicular Carbon Leak Detector & Eco-Navigator
echo   Department of Electronics & Communication Engineering
echo   Ballari Institute of Technology and Management (BITM), Ballari
echo ======================================================================
echo.
echo Starting local web server on port 8085...
echo Opening browser at http://localhost:8085 ...
echo.

start "" "http://localhost:8085"
python -m http.server 8085

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Python not found. Attempting py launcher...
  py -m http.server 8085
)

pause
