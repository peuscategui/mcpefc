// Script para probar la reconexión automática del servidor MCP TCP
import net from 'net';

const HOST = 'localhost';
const PORT = 3000;

console.log('🧪 Probando reconexión automática del servidor MCP TCP...\n');

function testConnection() {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    
    client.connect(PORT, HOST, () => {
      console.log('✅ Conexión TCP establecida');
      
      // Enviar mensaje de prueba
      const testMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      };
      
      client.write(JSON.stringify(testMessage) + '\n');
    });

    client.on('data', (data) => {
      console.log('📥 Respuesta recibida:', data.toString());
      client.destroy();
      resolve();
    });

    client.on('close', () => {
      console.log('🔌 Conexión cerrada');
      resolve();
    });

    client.on('error', (err) => {
      console.error('❌ Error de conexión:', err.message);
      reject(err);
    });

    // Timeout de 5 segundos
    setTimeout(() => {
      client.destroy();
      reject(new Error('Timeout'));
    }, 5000);
  });
}

async function runTests() {
  console.log('🔄 Ejecutando pruebas de conexión...\n');
  
  for (let i = 1; i <= 5; i++) {
    try {
      console.log(`--- Prueba ${i}/5 ---`);
      await testConnection();
      console.log(`✅ Prueba ${i} exitosa\n`);
      
      // Esperar 2 segundos entre pruebas
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Prueba ${i} falló:`, error.message);
      console.log('Esperando 5 segundos antes de reintentar...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('🏁 Pruebas completadas');
}

runTests().catch(console.error);
