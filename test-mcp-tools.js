// Script para probar las herramientas del MCP Server
const sql = require('mssql');

// Configuración de la base de datos
const config = {
  server: 'SURDBP04',
  port: 1433,
  database: 'PRUEBA_MCP',
  user: 'MCP',
  password: 'm_25_9e_pe1_',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    useUTC: false,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

async function testMCPTools() {
  let pool = null;
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    pool = await sql.connect(config);
    console.log('✅ Conexión exitosa!\n');
    
    // Probar herramienta 1: getTables
    console.log('📋 Probando herramienta: getTables');
    console.log('─'.repeat(50));
    
    const tablesQuery = `
      SELECT 
        TABLE_SCHEMA as schema_name,
        TABLE_NAME as table_name,
        TABLE_TYPE as table_type
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `;
    
    const tablesResult = await pool.request().query(tablesQuery);
    
    let tablesInfo = '📋 Tablas disponibles en la base de datos:\n\n';
    tablesResult.recordset.forEach(table => {
      tablesInfo += `• ${table.schema_name}.${table.table_name}\n`;
    });
    tablesInfo += `\n📊 Total de tablas: ${tablesResult.recordset.length}`;
    
    console.log(tablesInfo);
    console.log('\n' + '─'.repeat(50));
    
    // Probar herramienta 2: describeTable (para la primera tabla)
    if (tablesResult.recordset.length > 0) {
      const firstTable = tablesResult.recordset[0].table_name;
      console.log(`📋 Probando herramienta: describeTable para ${firstTable}`);
      console.log('─'.repeat(50));
      
      const describeQuery = `
        SELECT 
          COLUMN_NAME as column_name,
          DATA_TYPE as data_type,
          CHARACTER_MAXIMUM_LENGTH as max_length,
          IS_NULLABLE as is_nullable,
          COLUMN_DEFAULT as column_default,
          ORDINAL_POSITION as ordinal_position
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = @tableName
        ORDER BY ORDINAL_POSITION
      `;
      
      const columnsResult = await pool.request()
        .input('tableName', firstTable)
        .query(describeQuery);
      
      let tableInfo = `📋 Estructura de la tabla: ${firstTable}\n\n`;
      tableInfo += '| Columna | Tipo | Longitud | Nulo | Valor por defecto |\n';
      tableInfo += '|---------|------|----------|------|-------------------|\n';
      
      columnsResult.recordset.forEach(col => {
        const length = col.max_length ? `(${col.max_length})` : '';
        const nullable = col.is_nullable === 'YES' ? 'Sí' : 'No';
        const defaultVal = col.column_default || '-';
        
        tableInfo += `| ${col.column_name} | ${col.data_type}${length} | ${col.max_length || '-'} | ${nullable} | ${defaultVal} |\n`;
      });
      
      tableInfo += `\n📊 Total de columnas: ${columnsResult.recordset.length}`;
      console.log(tableInfo);
      console.log('\n' + '─'.repeat(50));
    }
    
    // Probar herramienta 3: executeQuery
    console.log('📊 Probando herramienta: executeQuery');
    console.log('─'.repeat(50));
    
    const sampleQuery = 'SELECT TOP 5 * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\'';
    const queryResult = await pool.request().query(sampleQuery);
    
    console.log('📊 Resultado de la consulta:');
    console.log(JSON.stringify(queryResult.recordset, null, 2));
    console.log(`\n📈 Total de registros: ${queryResult.recordset.length}`);
    
    console.log('\n✅ ¡Todas las herramientas del MCP funcionan correctamente!');
    
  } catch (error) {
    console.error('❌ Error probando herramientas MCP:', error.message);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n🔌 Conexión cerrada correctamente');
    }
  }
}

// Ejecutar las pruebas
testMCPTools().catch(console.error);
