@echo off
set "APP=%~dp0dist\win-unpacked\Bethel ID.exe"
if exist "%APP%" (
  start "" "%APP%"
) else (
  echo App not found: %APP%
  echo Run npm run electron-build first.
  pause
)
