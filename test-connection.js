// Script mejorado de prueba para conexión a SQL Server
const sql = require('mssql');

// ⚙️ CONFIGURACIÓN DE BASE DE DATOS
// Configurado para autenticación SQL Server con usuario y contraseña
const DB_CONFIG = {
  server: 'SURDBP04',           // Tu servidor SQL Server
  port: 1433,                   // Puerto de SQL Server
  database: 'PRUEBA_MCP',       // Nombre de tu base de datos
  user: 'MCP',       // Tu usuario de SQL Server
  password: 'm_25_9e_pe1_',  // Tu contraseña de SQL Server
  options: {
    encrypt: true,              // Usar encriptación
    trustServerCertificate: true, // Confiar en certificado del servidor
    enableArithAbort: true,     // Mejora compatibilidad
    useUTC: false,              // Usar zona horaria local
    connectionTimeout: 30000,   // Timeout de conexión
    requestTimeout: 30000,      // Timeout de solicitud
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// También intenta cargar desde variables de entorno si están disponibles
require('dotenv').config();

// Construir configuración dinámicamente
const config = {
  server: process.env.DB_HOST || DB_CONFIG.server,
  port: parseInt(process.env.DB_PORT) || DB_CONFIG.port,
  database: process.env.DB_NAME || DB_CONFIG.database,
  user: process.env.DB_USER || DB_CONFIG.user,
  password: process.env.DB_PASSWORD || DB_CONFIG.password,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || DB_CONFIG.options.encrypt,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || DB_CONFIG.options.trustServerCertificate,
    enableArithAbort: DB_CONFIG.options.enableArithAbort,
    useUTC: DB_CONFIG.options.useUTC,
    connectionTimeout: DB_CONFIG.options.connectionTimeout,
    requestTimeout: DB_CONFIG.options.requestTimeout,
    // Para autenticación SQL Server, NO usar integratedSecurity
    integratedSecurity: false,
  },
  pool: DB_CONFIG.pool,
};

async function testConnection() {
  let pool = null;
  
  try {
    console.log('🔌 Probando conexión a SQL Server...');
    console.log(`📍 Host: ${config.server}:${config.port}`);
    console.log(`🗄️  Database: ${config.database}`);
    console.log(`🔐 Authentication: ${config.options.integratedSecurity ? 'Windows Authentication' : 'SQL Server Authentication'}`);
    console.log(`👤 User: ${config.user}`);
    console.log(`🔑 Password: ${'*'.repeat(config.password.length)}`);
    console.log('─'.repeat(50));
    
    // Conectar a la base de datos
    pool = await sql.connect(config);
    console.log('✅ ¡Conexión exitosa a SQL Server!');
    
    // Probar consultas básicas
    await testBasicQueries(pool);
    await testDatabaseInfo(pool);
    await testTablesInfo(pool);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('─'.repeat(50));
    console.error('💡 Posibles soluciones:');
    console.error('  1. Verifica que SQL Server esté ejecutándose');
    console.error('  2. Confirma que el puerto 1433 esté abierto');
    console.error('  3. Revisa las credenciales de usuario y contraseña');
    console.error('  4. Asegúrate de que el firewall permita la conexión');
    console.error('  5. Verifica que la base de datos existe');
    console.error('  6. Para SQL Server Express, usa "localhost\\SQLEXPRESS"');
    console.error('─'.repeat(50));
    
    if (error.code) {
      console.error(`🔍 Código de error: ${error.code}`);
    }
    
    if (error.number) {
      console.error(`🔍 Número de error SQL: ${error.number}`);
    }
    
  } finally {
    if (pool) {
      await pool.close();
      console.log('🔌 Conexión cerrada correctamente');
    }
  }
}

async function testBasicQueries(pool) {
  try {
    console.log('\n📊 Ejecutando consultas básicas...');
    
    // Versión del SQL Server
    const versionResult = await pool.request().query('SELECT @@VERSION as version');
    console.log('🔖 Versión del SQL Server:');
    console.log(`   ${versionResult.recordset[0].version.split('\n')[0]}`);
    
    // Información del servidor
    const serverResult = await pool.request().query(`
      SELECT 
        @@SERVERNAME as server_name,
        @@SERVICENAME as service_name,
        DB_NAME() as current_database,
        USER_NAME() as current_user
    `);
    console.log('ℹ️  Información del servidor:');
    console.log(`   Servidor: ${serverResult.recordset[0].server_name}`);
    console.log(`   Servicio: ${serverResult.recordset[0].service_name}`);
    console.log(`   Base actual: ${serverResult.recordset[0].current_database}`);
    console.log(`   Usuario actual: ${serverResult.recordset[0].current_user}`);
    
  } catch (error) {
    console.error('❌ Error en consultas básicas:', error.message);
  }
}

async function testDatabaseInfo(pool) {
  try {
    console.log('\n🗄️  Información de la base de datos...');
    
    // Tamaño de la base de datos
    const sizeResult = await pool.request().query(`
      SELECT 
        name as database_name,
        size * 8 / 1024 as size_mb,
        max_size,
        growth
      FROM sys.database_files
      WHERE type = 0
    `);
    
    console.log('📏 Tamaño de la base de datos:');
    sizeResult.recordset.forEach(file => {
      console.log(`   ${file.database_name}: ${file.size_mb} MB`);
    });
    
    // Esquemas disponibles
    const schemaResult = await pool.request().query(`
      SELECT SCHEMA_NAME as schema_name
      FROM INFORMATION_SCHEMA.SCHEMATA
      ORDER BY SCHEMA_NAME
    `);
    
    console.log('📁 Esquemas disponibles:');
    schemaResult.recordset.forEach(schema => {
      console.log(`   - ${schema.schema_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo información de BD:', error.message);
  }
}

async function testTablesInfo(pool) {
  try {
    console.log('\n📋 Información de tablas...');
    
    // Contar tablas
    const countResult = await pool.request().query(`
      SELECT COUNT(*) as table_count
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log(`📊 Total de tablas: ${countResult.recordset[0].table_count}`);
    
    // Listar primeras 10 tablas
    const tablesResult = await pool.request().query(`
      SELECT TOP 10
        TABLE_SCHEMA as schema_name,
        TABLE_NAME as table_name,
        TABLE_TYPE as table_type
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `);
    
    if (tablesResult.recordset.length > 0) {
      console.log('📝 Primeras tablas encontradas:');
      tablesResult.recordset.forEach(table => {
        console.log(`   - ${table.schema_name}.${table.table_name}`);
      });
    } else {
      console.log('ℹ️  No se encontraron tablas en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo información de tablas:', error.message);
  }
}

// Ejecutar la prueba
testConnection();
