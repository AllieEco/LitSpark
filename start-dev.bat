@echo off
echo Démarrage de LitSpark en mode développement HTTPS...
echo.

echo Démarrage du backend (port 5000)...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Démarrage du frontend (port 5173)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Les serveurs démarrent...
echo Backend: https://localhost:5000
echo Frontend: https://localhost:5173
echo.
echo Vous pouvez fermer cette fenêtre une fois les serveurs démarrés.
pause 