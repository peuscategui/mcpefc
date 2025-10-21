# Script para configurar Git y subir a GitHub
Write-Host "🚀 Configurando repositorio Git..." -ForegroundColor Green

# Inicializar repositorio Git
Write-Host "📦 Inicializando repositorio Git..." -ForegroundColor Yellow
git init

# Agregar todos los archivos
Write-Host "📁 Agregando archivos..." -ForegroundColor Yellow
git add .

# Commit inicial
Write-Host "💾 Creando commit inicial..." -ForegroundColor Yellow
git commit -m "🚀 Initial commit: MCP SQL Server implementation

- ✅ MCP Server con conectividad a SQL Server
- ✅ Herramientas: execute_query, get_tables, describe_table
- ✅ Configuración Docker para Portainer
- ✅ Documentación completa
- ✅ Scripts de prueba y configuración"

# Configurar branch principal
Write-Host "🌿 Configurando branch principal..." -ForegroundColor Yellow
git branch -M main

Write-Host "✅ Repositorio Git configurado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Crear repositorio en GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Conectar repositorio local con GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/TU_USUARIO/mcp-sql-server.git" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Subir código a GitHub:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Implementar en Portainer usando:" -ForegroundColor White
Write-Host "   https://github.com/TU_USUARIO/mcp-sql-server" -ForegroundColor Gray
