// Script para probar conexión TCP al servidor MCP
import net from 'net';

const HOST = '192.168.40.197';
const PORT = 3000;

console.log('🧪 Probando conexión TCP al servidor MCP...\n');

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log('✅ Conexión TCP establecida exitosamente');
  console.log(`📍 Conectado a ${HOST}:${PORT}`);
  
  // Enviar un mensaje de prueba
  const testMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };
  
  console.log('📤 Enviando mensaje de prueba...');
  client.write(JSON.stringify(testMessage) + '\n');
});

client.on('data', (data) => {
  console.log('📥 Respuesta recibida:');
  console.log(data.toString());
  
  // Cerrar conexión después de recibir respuesta
  client.destroy();
});

client.on('close', () => {
  console.log('🔌 Conexión cerrada');
  process.exit(0);
});

client.on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
  process.exit(1);
});

// Timeout después de 10 segundos
setTimeout(() => {
  console.log('⏰ Timeout - cerrando conexión');
  client.destroy();
}, 10000);
