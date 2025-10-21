// Prueba simple de conexión con mssql
const sql = require('mssql');

const config = {
  server: '192.162.2.18',
  port: 1433,
  database: 'PRUEBA_MCP',
  user: 'peuscategui',
  password: 'Pe47251918//*',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

console.log('🔌 Intentando conectar a SQL Server...');
console.log(`Server: ${config.server}:${config.port}`);
console.log(`Database: ${config.database}`);
console.log(`User: ${config.user}`);
console.log('');

sql.connect(config).then(pool => {
  console.log('✅ ¡CONEXIÓN EXITOSA!');
  console.log('');
  
  return pool.request().query('SELECT @@VERSION as version, DB_NAME() as db, SUSER_NAME() as user, GETDATE() as time');
}).then(result => {
  console.log('📊 Información del servidor:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Base de datos:', result.recordset[0].db);
  console.log('Usuario:', result.recordset[0].user);
  console.log('Fecha/Hora:', result.recordset[0].time);
  console.log('Versión:', result.recordset[0].version.substring(0, 80) + '...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✨ ¡Todo funcionó correctamente!');
  sql.close();
  process.exit(0);
}).catch(err => {
  console.error('❌ ERROR:', err.message);
  console.error('Código:', err.code);
  console.error('');
  console.error('💡 Verifica la configuración del SQL Server');
  sql.close();
  process.exit(1);
});
