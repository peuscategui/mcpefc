const axios = require('axios');

async function testDeployedMCPServer() {
  const mcpServerUrl = 'http://localhost:3000'; // Ajusta la IP si es diferente
  
  console.log('🧪 Probando conexión al MCP Server desplegado...');
  console.log(`📍 URL: ${mcpServerUrl}`);
  
  try {
    // Test 1: Verificar que el servidor responde
    console.log('\n1️⃣ Verificando respuesta del servidor...');
    const response = await axios.get(`${mcpServerUrl}/health`, {
      timeout: 10000
    });
    console.log('✅ Servidor responde:', response.status);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ No se puede conectar al servidor');
      console.log('💡 Verifica que:');
      console.log('   - El contenedor esté corriendo en Portainer');
      console.log('   - El puerto 3000 esté expuesto');
      console.log('   - No haya firewall bloqueando');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// Si no tienes axios instalado, usa fetch nativo
async function testWithFetch() {
  const mcpServerUrl = 'http://localhost:3000';
  
  console.log('🧪 Probando con fetch nativo...');
  
  try {
    const response = await fetch(`${mcpServerUrl}/health`, {
      method: 'GET',
      timeout: 10000
    });
    
    if (response.ok) {
      console.log('✅ Servidor responde correctamente');
      const data = await response.text();
      console.log('📄 Respuesta:', data);
    } else {
      console.log('❌ Error HTTP:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

// Ejecutar pruebas
console.log('🚀 Iniciando pruebas de conexión...\n');

// Probar con axios si está disponible
testDeployedMCPServer().catch(() => {
  console.log('\n🔄 Intentando con fetch nativo...');
  testWithFetch();
});
