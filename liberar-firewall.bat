@echo off
echo ================================================
echo ExeScanner - Liberando Firewall
echo ================================================
echo.
echo Este script libera as portas necessarias para
echo o sistema de monitoramento funcionar na rede.
echo.
echo Portas a serem liberadas:
echo - 3001 (Backend/API)
echo - 5173 (Dashboard Web)
echo.
pause

echo.
echo Liberando porta 3001 (Backend)...
netsh advfirewall firewall add rule name="ExeScanner Backend" dir=in action=allow protocol=TCP localport=3001
if errorlevel 1 (
    echo ERRO: Falha ao liberar porta 3001
    echo Execute este script como Administrador!
    pause
    exit /b 1
)

echo.
echo Liberando porta 5173 (Dashboard)...
netsh advfirewall firewall add rule name="ExeScanner Dashboard" dir=in action=allow protocol=TCP localport=5173
if errorlevel 1 (
    echo ERRO: Falha ao liberar porta 5173
    pause
    exit /b 1
)

echo.
echo ================================================
echo Firewall configurado com sucesso!
echo ================================================
echo.
echo Portas liberadas:
echo - 3001 (Backend)
echo - 5173 (Dashboard)
echo.
echo Agora o sistema pode receber conexoes da rede.
echo.
pause
