@echo off
chcp 65001 >nul
title DONG BO DU LIEU LEN WEBSITE (MINE DIARY)
echo ========================================================
echo    DANG KIEM TRA VA DONG BO THAY DOI LEN WEB...
echo =======================================================
echo
.

node scripts/validate-assets.js
if %errorlevel% neq 0 (
    echo.
    echo [LOI] Co file media rong 0 bytes! Da dung dong bo de bao ve web.
    pause
    exit /b %errorlevele
)

git add -A
git commit -m "Cap nhat giao dien va du lieu: %date% %time%"
git push origin main

echo
.
echo =======================================================
echo    THANH CONG! DA DAY TAT CA THAY DOI LEN GITHUB!
echo    Vercel dang tu dong cap nhat web (sau 1-2 phut).
echo =======================================================
pause
