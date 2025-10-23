// Proxy TCP para conectar Claude Desktop al servidor MCP remoto
import { spawn } from 'child_process';
import net from 'net';

const REMOTE_HOST = '192.168.40.197';
const REMOTE_PORT = 3000;
const LOCAL_PORT = 3001;

console.log('🚀 Iniciando proxy TCP para MCP...');
console.log(`📍 Redirigiendo: localhost:${LOCAL_PORT} → ${REMOTE_HOST}:${REMOTE_PORT}`);

const server = net.createServer((localSocket) => {
  console.log('🔗 Cliente conectado');
  
  const remoteSocket = net.createConnection(REMOTE_PORT, REMOTE_HOST, () => {
    console.log('✅ Conectado al servidor MCP remoto');
    
    // Pipe datos bidireccionalmente
    localSocket.pipe(remoteSocket);
    remoteSocket.pipe(localSocket);
    
    localSocket.on('close', () => {
      console.log('🔌 Cliente desconectado');
      remoteSocket.destroy();
    });
    
    remoteSocket.on('close', () => {
      console.log('🔌 Servidor remoto desconectado');
      localSocket.destroy();
    });
    
    remoteSocket.on('error', (err) => {
      console.error('❌ Error del servidor remoto:', err.message);
      localSocket.destroy();
    });
  });
  
  remoteSocket.on('error', (err) => {
    console.error('❌ Error conectando al servidor remoto:', err.message);
    localSocket.destroy();
  });
  
  localSocket.on('error', (err) => {
    console.error('❌ Error del cliente:', err.message);
    remoteSocket.destroy();
  });
});

server.listen(LOCAL_PORT, () => {
  console.log(`🎯 Proxy TCP escuchando en puerto ${LOCAL_PORT}`);
  console.log(`💡 Configura Claude Desktop para usar: localhost:${LOCAL_PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Error del servidor proxy:', err.message);
});
