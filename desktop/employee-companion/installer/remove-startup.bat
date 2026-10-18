@echo off
REM ==============================================================================
REM HRMS Enterprise Portal - Remove Windows Automatic Startup
REM ==============================================================================
set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set SHORTCUT_NAME=HRMS_Employee_Portal.url

if exist "%STARTUP_DIR%\%SHORTCUT_NAME%" (
    del "%STARTUP_DIR%\%SHORTCUT_NAME%"
    echo [HRMS Setup] Removed startup shortcut from "%STARTUP_DIR%\%SHORTCUT_NAME%"
) else (
    echo [HRMS Setup] No startup shortcut was found in Startup folder.
)

echo [HRMS Setup] Automatic startup disabled.
pause
