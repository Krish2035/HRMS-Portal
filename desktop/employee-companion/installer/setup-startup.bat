@echo off
REM ==============================================================================
REM HRMS Enterprise Portal - Windows Startup Registration Script (Per-User)
REM ==============================================================================
echo [HRMS Setup] Configuring Windows Automatic Startup for current user...

set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set SHORTCUT_NAME=HRMS_Employee_Portal.url

echo [HRMS Setup] Creating browser autostart shortcut in: %STARTUP_DIR%

echo [InternetShortcut] > "%STARTUP_DIR%\%SHORTCUT_NAME%"
echo URL=http://localhost:3000 >> "%STARTUP_DIR%\%SHORTCUT_NAME%"
echo IconIndex=0 >> "%STARTUP_DIR%\%SHORTCUT_NAME%"

echo.
echo [HRMS Setup] SUCCESS: HRMS Employee Portal is now registered to open automatically when you log into Windows!
echo [HRMS Setup] Location: "%STARTUP_DIR%\%SHORTCUT_NAME%"
echo.
pause
