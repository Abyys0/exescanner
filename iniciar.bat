@echo off
echo =====================================
echo ExeScanner Monitor - Iniciando
echo =====================================
echo.

echo Verificando instalacao...
if not exist "server\node_modules" (
    echo ERRO: Backend nao instalado. Execute instalar.bat primeiro.
    pause
    exit /b 1
)

if not exist "web\node_modules" (
    echo ERRO: Frontend nao instalado. Execute instalar.bat primeiro.
    pause
    exit /b 1
)

if not exist "server\.env" (
    echo ERRO: Arquivo server\.env nao encontrado. Execute instalar.bat primeiro.
    pause
    exit /b 1
)

echo.
echo Iniciando backend (porta 3001)...
start "ExeScanner Backend" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak > nul

echo Iniciando frontend (porta 5173)...
start "ExeScanner Frontend" cmd /k "cd web && npm run dev"

echo.
echo =====================================
echo Sistema iniciado!
echo =====================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Login padrao: admin / admin
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause > nul

start http://localhost:5173

echo.
echo Para parar: feche as janelas do backend e frontend
echo.
