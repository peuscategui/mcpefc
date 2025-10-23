// Script para probar las herramientas MCP HTTP
import fetch from 'node-fetch';

const MCP_SERVER_URL = 'http://192.168.40.197:3000';

async function testMCPTools() {
  console.log('🧪 Probando herramientas MCP HTTP...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Probando health check...');
    const healthResponse = await fetch(`${MCP_SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test 2: List tools
    console.log('2️⃣ Probando list tools...');
    const toolsResponse = await fetch(`${MCP_SERVER_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'tools/list',
        params: {}
      })
    });
    const toolsData = await toolsResponse.json();
    console.log('✅ Tools disponibles:', JSON.stringify(toolsData, null, 2));
    console.log('');

    // Test 3: Get tables
    console.log('3️⃣ Probando get_tables...');
    const tablesResponse = await fetch(`${MCP_SERVER_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'get_tables',
          arguments: {}
        }
      })
    });
    const tablesData = await tablesResponse.json();
    console.log('✅ Tablas en la base de datos:');
    console.log(JSON.stringify(tablesData, null, 2));
    console.log('');

    // Test 4: Execute query
    console.log('4️⃣ Probando execute_query...');
    const queryResponse = await fetch(`${MCP_SERVER_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'execute_query',
          arguments: {
            query: 'SELECT COUNT(*) as total_tables FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\''
          }
        }
      })
    });
    const queryData = await queryResponse.json();
    console.log('✅ Resultado de consulta:');
    console.log(JSON.stringify(queryData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar pruebas
testMCPTools();
