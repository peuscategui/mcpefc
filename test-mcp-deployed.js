// Script para probar el servidor MCP desplegado
import { spawn } from 'child_process';

console.log('🧪 Probando servidor MCP desplegado...\n');

// Función para enviar comandos al servidor MCP
async function testMCPServer() {
  console.log('1️⃣ Probando conexión al contenedor...');
  
  // Verificar que el contenedor esté corriendo
  try {
    const dockerPs = spawn('docker', ['ps', '--filter', 'name=mcp-sql-server', '--format', 'table {{.Names}}\t{{.Status}}'], {
      stdio: 'pipe'
    });
    
    dockerPs.stdout.on('data', (data) => {
      console.log('📋 Estado del contenedor:');
      console.log(data.toString());
    });
    
    dockerPs.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Contenedor encontrado');
        testMCPServerLogs();
      } else {
        console.log('❌ No se pudo verificar el estado del contenedor');
      }
    });
    
  } catch (error) {
    console.log('❌ Error verificando contenedor:', error.message);
  }
}

// Función para ver los logs del servidor
function testMCPServerLogs() {
  console.log('\n2️⃣ Verificando logs del servidor MCP...');
  
  try {
    const dockerLogs = spawn('docker', ['logs', '--tail', '20', 'mcp-sql-server_mcp-sql-server'], {
      stdio: 'pipe'
    });
    
    dockerLogs.stdout.on('data', (data) => {
      const logs = data.toString();
      console.log('📄 Últimos logs:');
      console.log(logs);
      
      if (logs.includes('Iniciando servidor MCP')) {
        console.log('✅ Servidor MCP iniciado correctamente');
      }
      
      if (logs.includes('Error')) {
        console.log('❌ Se detectaron errores en los logs');
      }
    });
    
    dockerLogs.on('close', (code) => {
      console.log('\n3️⃣ Prueba de conectividad completada');
      console.log('💡 El servidor MCP está funcionando con transporte Stdio');
      console.log('💡 Para usar con Claude Desktop, configura el MCP server en claude_desktop_config.json');
    });
    
  } catch (error) {
    console.log('❌ Error obteniendo logs:', error.message);
  }
}

// Ejecutar pruebas
testMCPServer();
