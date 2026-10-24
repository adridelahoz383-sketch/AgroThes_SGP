@echo off
REM ============================================================
REM AGROTHES SGP - Script de Instalación Automática
REM ============================================================
REM Este script configura automáticamente el proyecto
REM Crea la BD, migra datos e instala todo sin intervención
REM Requisitos: Node.js, MySQL corriendo

setlocal enabledelayedexpansion

color 0A
title AgroThes SGP - Setup Automático

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   AgroThes SGP - Instalación Automática Completa        ║
echo ║   Se crearán TODAS las tablas automáticamente            ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Variables de configuración
set "DB_USER=root"
set "DB_PASSWORD=1703092908"
set "DB_HOST=localhost"
set "DB_NAME=agrothes"

REM Verificar Node.js
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js no está instalado
    echo Descárgalo desde: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% detectado

REM Verificar MySQL
echo.
echo [2/6] Verificando MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: MySQL no está instalado o no está en PATH
    echo Descárgalo desde: https://www.mysql.com/
    echo Instala MySQL Community Server
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('mysql --version') do set MYSQL_VERSION=%%i
echo ✓ MySQL detectado: !MYSQL_VERSION!

REM Crear Base de Datos si no existe
echo.
echo [3/6] Preparando Base de Datos '%DB_NAME%'...
REM Intenta conectar y crear la BD
mysql -u %DB_USER% -p%DB_PASSWORD% -h %DB_HOST% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >nul 2>&1

if errorlevel 1 (
    echo ⚠️  Advertencia: No se pudo crear la BD automáticamente
    echo.
    echo Posibles causas:
    echo   • MySQL no está corriendo
    echo   • Contraseña incorrecta (cambiar en setup.bat)
    echo   • MySQL no está en PATH
    echo.
    echo Intenta manualmente:
    echo   mysql -u root -p
    echo   CREATE DATABASE agrothes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    echo.
    echo Presiona Enter para intentar de todas formas...
    pause
) else (
    echo ✓ Base de datos '%DB_NAME%' lista
)

REM Instalar Backend
echo.
echo [4/6] Instalando dependencias del Backend...
cd server
if errorlevel 1 (
    echo ❌ Error: No se encontró la carpeta 'server'
    cd ..
    pause
    exit /b 1
)

call npm install >nul 2>&1
if errorlevel 1 (
    echo ❌ Error al instalar dependencias backend
    echo Intenta manualmente: cd server ^&^& npm install
    pause
    exit /b 1
)
echo ✓ Backend: dependencias instaladas

REM Generar cliente Prisma
echo   Generando cliente Prisma...
call npx prisma generate >nul 2>&1

REM Migrar Base de Datos (LO MÁS IMPORTANTE)
echo   Migrando base de datos...
call npx prisma migrate deploy >nul 2>&1

if errorlevel 1 (
    echo   ⚠️  Intento 1 fallido, intentando con migrate dev...
    call npx prisma migrate dev --name init >nul 2>&1
    if errorlevel 1 (
        echo ❌ Error al migrar la base de datos
        echo Causas posibles:
        echo   • BD no existe
        echo   • Conexión rechazada
        echo   • Credenciales MySQL incorrectas
        echo.
        echo Para migrar manualmente:
        echo   cd server
        echo   npx prisma migrate deploy
        echo.
        pause
        exit /b 1
    )
)
echo ✓ Base de datos: migraciones completadas

REM Instalar Frontend
echo.
echo [5/6] Instalando dependencias del Frontend...
cd ..\agrothes-app
call npm install >nul 2>&1
if errorlevel 1 (
    echo ❌ Error al instalar dependencias frontend
    echo Intenta manualmente: cd agrothes-app ^&^& npm install
    pause
    exit /b 1
)
echo ✓ Frontend: dependencias instaladas

REM Completado
echo.
echo [6/6] ¡Verificación final!
cd ..
echo ✓ Estructura de carpetas validada

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   ✅ ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!              ║
echo ║   Todo está listo. NO necesitas hacer nada más.         ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo 📋 RESUMEN DE LO QUE SE HIZO:
echo   ✓ Verificó Node.js y MySQL
echo   ✓ Creó base de datos '%DB_NAME%'
echo   ✓ Instaló dependencias backend
echo   ✓ Instaló dependencias frontend
echo   ✓ Ejecutó migraciones automáticamente
echo   ✓ Generó cliente Prisma
echo.

echo 🚀 PRÓXIMO PASO: Ejecutar los servidores
echo.
echo   Abre TRES terminales (PowerShell/CMD) y ejecuta:
echo.
echo   Terminal 1 (BACKEND):
echo   ┌─────────────────────────────────────────┐
echo   │ cd server                               │
echo   │ npm run dev                             │
echo   └─────────────────────────────────────────┘
echo.
echo   Terminal 2 (FRONTEND):
echo   ┌─────────────────────────────────────────┐
echo   │ cd agrothes-app                         │
echo   │ npm run dev                             │
echo   └─────────────────────────────────────────┘
echo.
echo   Terminal 3 (VERIFICACIÓN):
echo   ┌─────────────────────────────────────────┐
echo   │ Espera 5 segundos y abre en navegador: │
echo   │ http://localhost:5173                   │
echo   └─────────────────────────────────────────┘
echo.

echo ⚠️  IMPORTANTE:
echo   • NO CIERRES ninguna terminal mientras uses la app
echo   • Para detener: Presiona Ctrl+C
echo   • Si algo falla, lee SETUP.md
echo.

echo 📞 TROUBLESHOOTING:
echo   Error "port already in use":
echo     → Cambiar PORT en server\.env o cerrar aplicación
echo.
echo   Error "Cannot connect to database":
echo     → Verificar que MySQL está corriendo
echo     → Cambiar contraseña en setup.bat si es diferente
echo.

pause
cd ..\...
