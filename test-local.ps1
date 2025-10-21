# Script de PowerShell para probar el servidor MCP localmente
# Ejecuta este script después de configurar tus credenciales

Write-Host "🚀 Iniciando pruebas del servidor MCP" -ForegroundColor Green

# Configurar variables de entorno (REEMPLAZA ESTOS VALORES)
$env:DB_HOST = "192.162.2.18"  # Cambia por la IP de tu SQL Server
$env:DB_PORT = "1433"
$env:DB_NAME = "PRUEBA_MCP"  # Cambia por el nombre de tu BD
$env:DB_USER = "peuscategui"  # Cambia por tu usuario
$env:DB_PASSWORD = "Pe47251918//*"  # Cambia por tu contraseña
$env:DB_ENCRYPT = "true"
$env:DB_TRUST_SERVER_CERTIFICATE = "true"
$env:LOG_LEVEL = "debug"

Write-Host "📋 Variables de entorno configuradas:" -ForegroundColor Yellow
Write-Host "  DB_HOST: $env:DB_HOST"
Write-Host "  DB_PORT: $env:DB_PORT"
Write-Host "  DB_NAME: $env:DB_NAME"
Write-Host "  DB_USER: $env:DB_USER"
Write-Host "  DB_PASSWORD: [OCULTO]"
Write-Host ""

# Paso 1: Probar conexión básica
Write-Host "🔌 Paso 1: Probando conexión básica..." -ForegroundColor Cyan
node test-connection.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Conexión exitosa! Continuando con las pruebas..." -ForegroundColor Green
    
    # Paso 2: Ejecutar servidor MCP en modo desarrollo
    Write-Host "🚀 Paso 2: Iniciando servidor MCP..." -ForegroundColor Cyan
    Write-Host "💡 El servidor MCP se ejecutará en modo stdio (entrada/salida estándar)" -ForegroundColor Yellow
    Write-Host "💡 Para detener el servidor, presiona Ctrl+C" -ForegroundColor Yellow
    Write-Host ""
    
    # Ejecutar el servidor MCP
    npm run dev
} else {
    Write-Host ""
    Write-Host "❌ Error en la conexión. Revisa la configuración y vuelve a intentar." -ForegroundColor Red
    Write-Host "💡 Asegúrate de:" -ForegroundColor Yellow
    Write-Host "  1. Cambiar los valores en este script con tus credenciales reales" -ForegroundColor Yellow
    Write-Host "  2. Que el SQL Server esté ejecutándose y sea accesible" -ForegroundColor Yellow
    Write-Host "  3. Que el puerto 1433 esté abierto" -ForegroundColor Yellow
}
