// Prueba con MÚLTIPLES configuraciones
const sql = require('mssql');

const configs = [
  {
    name: "Config 1: Sin encriptación",
    config: {
      server: '192.162.2.18',
      port: 1433,
      database: 'PRUEBA_MCP',
      user: 'peuscategui',
      password: 'Pe47251918//*',
      options: {
        encrypt: false,
      },
      connectionTimeout: 30000,
    }
  },
  {
    name: "Config 2: Con encriptación y trust",
    config: {
      server: '192.162.2.18',
      port: 1433,
      database: 'PRUEBA_MCP',
      user: 'peuscategui',
      password: 'Pe47251918//*',
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
      connectionTimeout: 30000,
    }
  },
  {
    name: "Config 3: Sin especificar base de datos",
    config: {
      server: '192.162.2.18',
      port: 1433,
      user: 'peuscategui',
      password: 'Pe47251918//*',
      options: {
        encrypt: false,
      },
      connectionTimeout: 30000,
    }
  }
];

async function testConfigs() {
  for (let i = 0; i < configs.length; i++) {
    const test = configs[i];
    console.log('');
    console.log('═'.repeat(70));
    console.log(`🧪 Probando: ${test.name}`);
    console.log('═'.repeat(70));
    
    try {
      const pool = await sql.connect(test.config);
      console.log('✅ ¡CONEXIÓN EXITOSA!');
      
      const result = await pool.request().query('SELECT @@VERSION as v, DB_NAME() as db');
      console.log(`📊 Base de datos: ${result.recordset[0].db}`);
      console.log(`📊 Versión: ${result.recordset[0].v.substring(0, 60)}...`);
      
      await sql.close();
      console.log('');
      console.log('✨ ¡Esta configuración funciona!');
      return true;
      
    } catch (err) {
      console.error(`❌ ERROR: ${err.message}`);
      console.error(`   Código: ${err.code || 'N/A'}`);
      await sql.close();
    }
  }
  
  console.log('');
  console.log('═'.repeat(70));
  console.log('❌ Ninguna configuración funcionó');
  console.log('═'.repeat(70));
  return false;
}

testConfigs().then(success => {
  process.exit(success ? 0 : 1);
});
