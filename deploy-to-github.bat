@echo off
title Push Vedabhyas College Predictor to GitHub
echo ====================================================================
echo   Vedabhyas College Predictor - GitHub Cloud Deployment
echo ====================================================================
echo.
echo Pushing local code to https://github.com/drdipali/vedabhyas-college-predictor ...
echo If prompted, click 'Sign in with your browser' to authorize Git.
echo.
git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================================
    echo   [SUCCESS] Code pushed successfully to GitHub!
    echo.
    echo   Next: Enable GitHub Actions for Pages:
    echo   1. Visit: https://github.com/drdipali/vedabhyas-college-predictor/settings/pages
    echo   2. Under 'Source', select 'GitHub Actions'
    echo   3. Your live site will be ready at:
    echo      https://drdipali.github.io/vedabhyas-college-predictor/
    echo ====================================================================
) else (
    echo.
    echo ====================================================================
    echo   [FAILED] Could not push. Please verify your GitHub login or Personal Access Token.
    echo ====================================================================
)
echo.
pause
