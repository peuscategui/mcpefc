#!/usr/bin/env node

// Script de inicio robusto para el servidor MCP TCP
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando servidor MCP TCP robusto...\n');

let serverProcess = null;
let restartCount = 0;
const maxRestarts = 5;

function startServer() {
  console.log(`🔄 Iniciando servidor (intento ${restartCount + 1}/${maxRestarts + 1})...`);
  
  serverProcess = spawn('node', ['mcp-tcp-fixed.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      MCP_PORT: process.env.MCP_PORT || '3000'
    }
  });

  serverProcess.on('close', (code, signal) => {
    console.log(`\n📊 Servidor terminado con código: ${code}, señal: ${signal}`);
    
    if (restartCount < maxRestarts) {
      restartCount++;
      console.log(`🔄 Reiniciando servidor en 5 segundos... (${restartCount}/${maxRestarts})`);
      setTimeout(startServer, 5000);
    } else {
      console.log('❌ Máximo número de reintentos alcanzado. Deteniendo...');
      process.exit(1);
    }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Error iniciando servidor:', error.message);
    
    if (restartCount < maxRestarts) {
      restartCount++;
      console.log(`🔄 Reiniciando servidor en 5 segundos... (${restartCount}/${maxRestarts})`);
      setTimeout(startServer, 5000);
    } else {
      console.log('❌ Máximo número de reintentos alcanzado. Deteniendo...');
      process.exit(1);
    }
  });
}

// Manejar señales de cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

// Iniciar el servidor
startServer();
