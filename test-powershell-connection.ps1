# Script de PowerShell para probar conexión SQL usando .NET
# Este script no requiere sqlcmd

$server = "192.162.2.18,1433"
$database = "PRUEBA_MCP"
$username = "peuscategui"
$password = "Pe47251918//*"

Write-Host "🔌 Intentando conectar a SQL Server con .NET SqlClient..." -ForegroundColor Cyan
Write-Host "Server: $server" -ForegroundColor Yellow
Write-Host "Database: $database" -ForegroundColor Yellow
Write-Host "User: $username" -ForegroundColor Yellow
Write-Host ""

$connectionString = "Server=$server;Database=$database;User Id=$username;Password=$password;Encrypt=True;TrustServerCertificate=True;Connection Timeout=30;"

try {
    # Cargar el ensamblado System.Data.SqlClient
    Add-Type -AssemblyName System.Data
    
    # Crear conexión
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    
    Write-Host "⏳ Abriendo conexión..." -ForegroundColor Yellow
    $connection.Open()
    
    Write-Host "✅ ¡CONEXIÓN EXITOSA!" -ForegroundColor Green
    Write-Host ""
    
    # Ejecutar consulta de prueba
    $command = $connection.CreateCommand()
    $command.CommandText = "SELECT @@VERSION AS SQLVersion, DB_NAME() AS CurrentDB, SUSER_NAME() AS CurrentUser, GETDATE() AS CurrentTime"
    
    $reader = $command.ExecuteReader()
    
    if ($reader.Read()) {
        Write-Host "📊 Información del servidor SQL:" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        
        $version = $reader["SQLVersion"].ToString()
        if ($version.Length -gt 100) {
            $version = $version.Substring(0, 100) + "..."
        }
        Write-Host "Versión: $version" -ForegroundColor White
        Write-Host "Base de datos actual: $($reader["CurrentDB"])" -ForegroundColor White
        Write-Host "Usuario actual: $($reader["CurrentUser"])" -ForegroundColor White
        Write-Host "Fecha/Hora del servidor: $($reader["CurrentTime"])" -ForegroundColor White
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    }
    
    $reader.Close()
    
    # Probar listar algunas tablas
    Write-Host ""
    Write-Host "📋 Listando tablas en la base de datos..." -ForegroundColor Cyan
    $command.CommandText = "SELECT TOP 5 TABLE_SCHEMA + '.' + TABLE_NAME AS TableName FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
    $reader = $command.ExecuteReader()
    
    $tableCount = 0
    while ($reader.Read()) {
        Write-Host "  • $($reader["TableName"])" -ForegroundColor White
        $tableCount++
    }
    
    if ($tableCount -eq 0) {
        Write-Host "  (No se encontraron tablas o no hay permisos para listarlas)" -ForegroundColor Yellow
    }
    
    $reader.Close()
    $connection.Close()
    
    Write-Host ""
    Write-Host "✅ Prueba de conexión completada exitosamente!" -ForegroundColor Green
    Write-Host "💡 La conexión desde PowerShell funciona correctamente." -ForegroundColor Yellow
    Write-Host ""
    exit 0
    
} catch {
    Write-Host "❌ ERROR DE CONEXIÓN" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Mensaje: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.InnerException) {
        Write-Host "Detalle: $($_.Exception.InnerException.Message)" -ForegroundColor Red
    }
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Posibles causas:" -ForegroundColor Yellow
    Write-Host "  1. SQL Server no está ejecutándose en 192.162.2.18:1433" -ForegroundColor White
    Write-Host "  2. Credenciales incorrectas" -ForegroundColor White
    Write-Host "  3. Base de datos 'PRUEBA_MCP' no existe" -ForegroundColor White
    Write-Host "  4. Usuario no tiene permisos" -ForegroundColor White
    Write-Host "  5. TCP/IP no está habilitado en SQL Server" -ForegroundColor White
    Write-Host "  6. Autenticación SQL no está habilitada" -ForegroundColor White
    Write-Host ""
    exit 1
} finally {
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
}
