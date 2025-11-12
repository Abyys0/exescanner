@echo off
echo =====================================
echo ExeScanner Monitor - Instalacao
echo =====================================
echo.

echo [1/4] Instalando dependencias do backend...
cd "server"
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias do backend
        pause
        exit /b 1
    )
) else (
    echo Backend ja instalado, pulando...
)
echo.

echo [2/4] Configurando backend...
if not exist ".env" (
    copy ".env.example" ".env"
    echo Arquivo .env criado! EDITE-O antes de executar.
) else (
    echo .env ja existe
)
cd ..
echo.

echo [3/4] Instalando dependencias do frontend...
cd "web"
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias do frontend
        pause
        exit /b 1
    )
) else (
    echo Frontend ja instalado, pulando...
)
echo.

echo [4/4] Configurando frontend...
if not exist ".env" (
    copy ".env.example" ".env"
    echo Arquivo .env criado!
) else (
    echo .env ja existe
)
cd ..
echo.

echo =====================================
echo Instalacao concluida com sucesso!
echo =====================================
echo.
echo Proximos passos:
echo 1. Edite server\.env e configure JWT_SECRET e SCANNER_API_TOKEN
echo 2. Execute: iniciar.bat
echo.
pause
