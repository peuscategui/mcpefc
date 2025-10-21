// Script de diagnóstico avanzado para SQL Server
const sql = require('mssql');
require('dotenv').config();

async function testMultipleConfigs() {
  const configs = [
    {
      name: "Configuración 1: Encrypt=true, TrustCertificate=true",
      config: {
        server: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 1433,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
        connectionTimeout: 15000,
      }
    },
    {
      name: "Configuración 2: Sin encriptación",
      config: {
        server: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 1433,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        options: {
          encrypt: false,
        },
        connectionTimeout: 15000,
      }
    },
    {
      name: "Configuración 3: Con instancia named",
      config: {
        server: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
        connectionTimeout: 15000,
      }
    }
  ];

  console.log('🔍 Iniciando diagnóstico de conexión SQL Server...\n');
  console.log(`🎯 Destino: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
  console.log(`👤 Usuario: ${process.env.DB_USER}\n`);

  for (const test of configs) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Probando: ${test.name}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const pool = await sql.connect(test.config);
      console.log('✅ ¡CONEXIÓN EXITOSA!');
      
      // Probar consulta
      const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as current_db');
      console.log('\n📊 Información del servidor:');
      console.log('Version:', result.recordset[0].version.substring(0, 100) + '...');
      console.log('Base de datos actual:', result.recordset[0].current_db);
      
      await pool.close();
      console.log('\n✨ Esta configuración funciona correctamente!');
      return; // Salir si encontramos una configuración que funcione
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('Código de error:', error.code);
      if (error.originalError) {
        console.log('Error original:', error.originalError.message);
      }
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('❌ Ninguna configuración funcionó.');
  console.log('\n💡 Sugerencias:');
  console.log('1. Verifica que SQL Server esté configurado para autenticación mixta (SQL + Windows)');
  console.log('2. Confirma que el usuario tiene permisos para la base de datos');
  console.log('3. Verifica que SQL Server Browser esté ejecutándose');
  console.log('4. Revisa que TCP/IP esté habilitado en SQL Server Configuration Manager');
}

testMultipleConfigs();
