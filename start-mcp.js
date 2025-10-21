// Script de inicio para el servidor MCP SQL Server
const { spawn } = require('child_process');
const path = require('path');

// Logs comentados para evitar interferir con el protocolo MCP
// console.log('🚀 Iniciando MCP SQL Server...');
// console.log('📍 Configuración:');
// console.log('   • Servidor: SURDBP04:1433');
// console.log('   • Base de datos: PRUEBA_MCP');
// console.log('   • Usuario: MCP');
// console.log('   • Herramientas disponibles: execute_query, get_tables, describe_table');
// console.log('─'.repeat(50));

// Iniciar el servidor MCP
const serverPath = path.join(__dirname, 'src', 'server.js');
const mcpProcess = spawn('node', [serverPath], {
  stdio: ['inherit', 'inherit', 'inherit'],
  cwd: __dirname
});

mcpProcess.on('error', (error) => {
  console.error('❌ Error iniciando el servidor MCP:', error);
});

mcpProcess.on('close', (code) => {
  // console.log(`\n🔌 Servidor MCP cerrado con código: ${code}`);
});

// Manejo de señales para cerrar limpiamente
process.on('SIGINT', () => {
  // console.log('\n🛑 Cerrando servidor MCP...');
  mcpProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  // console.log('\n🛑 Cerrando servidor MCP...');
  mcpProcess.kill('SIGTERM');
});

// console.log('✅ Servidor MCP iniciado. Presiona Ctrl+C para detener.');
