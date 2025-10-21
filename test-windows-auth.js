// Script para probar diferentes configuraciones de autenticación de Windows
const sql = require('mssql');

const configs = [
  {
    name: 'Configuración 1: Autenticación Windows estándar',
    config: {
      server: 'SURDBP04',
      port: 1433,
      database: 'PRUEBA_MCP',
      options: {
        encrypt: true,
        trustServerCertificate: true,
        integratedSecurity: true,
      }
    }
  },
  {
    name: 'Configuración 2: Sin encriptación',
    config: {
      server: 'SURDBP04',
      port: 1433,
      database: 'PRUEBA_MCP',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        integratedSecurity: true,
      }
    }
  },
  {
    name: 'Configuración 3: Con dominio explícito',
    config: {
      server: 'SURDBP04',
      port: 1433,
      database: 'PRUEBA_MCP',
      options: {
        encrypt: true,
        trustServerCertificate: true,
        integratedSecurity: true,
        domain: 'EFCSAC',
      }
    }
  },
  {
    name: 'Configuración 4: Usando instancia por defecto',
    config: {
      server: 'SURDBP04',
      database: 'PRUEBA_MCP',
      options: {
        encrypt: true,
        trustServerCertificate: true,
        integratedSecurity: true,
      }
    }
  }
];

async function testConfig(configObj) {
  try {
    console.log(`\n🧪 Probando: ${configObj.name}`);
    console.log(`📍 Configuración:`, JSON.stringify(configObj.config, null, 2));
    console.log('─'.repeat(50));
    
    const pool = await sql.connect(configObj.config);
    console.log('✅ ¡Conexión exitosa!');
    
    // Probar una consulta simple
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('📊 Versión del SQL Server:', result.recordset[0].version.split('\n')[0]);
    
    await pool.close();
    return true;
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(`🔍 Código: ${error.code || 'N/A'}`);
    return false;
  }
}

async function testAllConfigs() {
  console.log('🔍 Probando diferentes configuraciones de autenticación de Windows...');
  console.log(`👤 Usuario actual: ${process.env.USERNAME}`);
  console.log(`🏢 Dominio: ${process.env.USERDOMAIN}`);
  console.log(`💻 Computadora: ${process.env.COMPUTERNAME}`);
  console.log('='.repeat(60));
  
  let successCount = 0;
  
  for (const configObj of configs) {
    const success = await testConfig(configObj);
    if (success) {
      successCount++;
      console.log('\n🎉 ¡Esta configuración funciona! Puedes usarla en tu script principal.');
      break; // Si una funciona, no necesitamos probar las demás
    }
    console.log('\n' + '─'.repeat(60));
  }
  
  console.log(`\n📊 Resumen: ${successCount} de ${configs.length} configuraciones funcionaron`);
  
  if (successCount === 0) {
    console.log('\n💡 Recomendaciones:');
    console.log('1. Verifica que el servidor SURDBP04 esté ejecutándose');
    console.log('2. Confirma que acepta autenticación de Windows');
    console.log('3. Solicita al administrador que agregue tu usuario como login');
    console.log('4. Considera usar autenticación SQL Server con credenciales específicas');
  }
}

// Ejecutar las pruebas
testAllConfigs().catch(console.error);
