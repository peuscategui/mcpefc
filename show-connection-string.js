// Script para mostrar la cadena de conexión
const sql = require('mssql');
require('dotenv').config();

console.log('📋 Información de la cadena de conexión:\n');

const config = {
  server: process.env.DB_HOST || '192.162.2.18',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'PRUEBA_MCP',
  user: process.env.DB_USER || 'peuscategui',
  password: process.env.DB_PASSWORD || 'Pe47251918//*',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

console.log('🔧 Configuración actual:');
console.log('─'.repeat(60));
console.log(`Server:   ${config.server}`);
console.log(`Port:     ${config.port}`);
console.log(`Database: ${config.database}`);
console.log(`User:     ${config.user}`);
console.log(`Password: ${config.password.replace(/./g, '*')}`);
console.log(`Encrypt:  ${config.options.encrypt}`);
console.log(`Trust Certificate: ${config.options.trustServerCertificate}`);
console.log('─'.repeat(60));

console.log('\n📝 Cadenas de conexión equivalentes:\n');

// Formato 1: Connection String estilo ADO.NET
const adoConnStr = `Server=${config.server},${config.port};Database=${config.database};User Id=${config.user};Password=${config.password};Encrypt=${config.options.encrypt};TrustServerCertificate=${config.options.trustServerCertificate};`;
console.log('1️⃣  Formato ADO.NET (para .NET/C#):');
console.log(adoConnStr.replace(config.password, '***PASSWORD***'));

// Formato 2: Connection String para SSMS
const ssmsConnStr = `${config.server},${config.port}`;
console.log('\n2️⃣  Para SQL Server Management Studio (SSMS):');
console.log('─'.repeat(60));
console.log(`Server name:  ${ssmsConnStr}`);
console.log(`Authentication: SQL Server Authentication`);
console.log(`Login:        ${config.user}`);
console.log(`Password:     ***PASSWORD***`);
console.log(`Database:     ${config.database}`);

// Formato 3: Connection String para JDBC
const jdbcConnStr = `jdbc:sqlserver://${config.server}:${config.port};databaseName=${config.database};user=${config.user};password=${config.password};encrypt=${config.options.encrypt};trustServerCertificate=${config.options.trustServerCertificate};`;
console.log('\n3️⃣  Formato JDBC (para Java):');
console.log(jdbcConnStr.replace(config.password, '***PASSWORD***'));

// Formato 4: Connection String para ODBC
const odbcConnStr = `Driver={ODBC Driver 17 for SQL Server};Server=${config.server},${config.port};Database=${config.database};Uid=${config.user};Pwd=${config.password};Encrypt=yes;TrustServerCertificate=yes;`;
console.log('\n4️⃣  Formato ODBC:');
console.log(odbcConnStr.replace(config.password, '***PASSWORD***'));

// Formato 5: Node.js mssql config object
console.log('\n5️⃣  Formato Node.js (mssql):');
console.log('─'.repeat(60));
console.log(JSON.stringify({
  ...config,
  password: '***PASSWORD***'
}, null, 2));

console.log('\n\n💡 Para probar en SSMS:');
console.log('─'.repeat(60));
console.log(`1. Abre SQL Server Management Studio`);
console.log(`2. Server name: ${config.server},${config.port}`);
console.log(`3. Authentication: SQL Server Authentication`);
console.log(`4. Login: ${config.user}`);
console.log(`5. Password: [tu contraseña]`);
console.log(`6. Click "Connect"`);
console.log('─'.repeat(60));

console.log('\n\n🔍 Comando para probar conectividad desde PowerShell:');
console.log('─'.repeat(60));
console.log(`sqlcmd -S ${config.server},${config.port} -U ${config.user} -P "${config.password}" -d ${config.database} -Q "SELECT @@VERSION"`);
console.log('─'.repeat(60));
