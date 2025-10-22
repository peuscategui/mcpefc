import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

class MCPSQLServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-sql-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.pool = null;
    this.setupHandlers();
  }

  async connectToDatabase() {
    try {
      // Configuración por defecto si no hay variables de entorno
      const defaultConfig = {
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

      // Usar variables de entorno si están disponibles, sino usar configuración por defecto
      const config = {
        server: process.env.DB_HOST || defaultConfig.server,
        port: parseInt(process.env.DB_PORT) || defaultConfig.port,
        database: process.env.DB_NAME || defaultConfig.database,
        user: process.env.DB_USER || defaultConfig.user,
        password: process.env.DB_PASSWORD || defaultConfig.password,
        options: {
          encrypt: process.env.DB_ENCRYPT === 'true' || defaultConfig.options.encrypt,
          trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || defaultConfig.options.trustServerCertificate,
          enableArithAbort: defaultConfig.options.enableArithAbort,
          useUTC: defaultConfig.options.useUTC,
          connectionTimeout: defaultConfig.options.connectionTimeout,
          requestTimeout: defaultConfig.options.requestTimeout,
        },
        pool: defaultConfig.pool,
      };

      this.pool = await sql.connect(config);
      // Logs comentados para evitar interferir con el protocolo MCP
      // console.log('✅ Conectado a Microsoft SQL Server');
      // console.log(`📍 Servidor: ${config.server}:${config.port}`);
      // console.log(`🗄️ Base de datos: ${config.database}`);
      // console.log(`👤 Usuario: ${config.user}`);
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error);
      throw error;
    }
  }

  setupHandlers() {
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'execute_query',
            description: 'Ejecuta una consulta SQL SELECT en la base de datos',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'La consulta SQL SELECT a ejecutar',
                },
                params: {
                  type: 'object',
                  description: 'Parámetros para la consulta preparada',
                  additionalProperties: { type: 'string' },
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_tables',
            description: 'Obtiene la lista de tablas en la base de datos',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'describe_table',
            description: 'Describe la estructura de una tabla específica',
            inputSchema: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Nombre de la tabla a describir',
                },
              },
              required: ['table_name'],
            },
          },
        ],
      };
    });

    // Manejar llamadas a herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'execute_query':
            return await this.executeQuery(args.query, args.params || {});
            
          case 'get_tables':
            return await this.getTables();
            
          case 'describe_table':
            return await this.describeTable(args.table_name);
            
          default:
            throw new Error(`Herramienta desconocida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error ejecutando ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async executeQuery(query, params = {}) {
    if (!this.pool) {
      throw new Error('No hay conexión a la base de datos');
    }

    try {
      // Validar que sea una consulta SELECT para seguridad
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery.startsWith('select')) {
        throw new Error('Solo se permiten consultas SELECT por seguridad');
      }

      const request = this.pool.request();
      
      // Agregar parámetros si existen
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });

      const result = await request.query(query);
      
      return {
        content: [
          {
            type: 'text',
            text: `📊 Resultado de la consulta:\n\n${JSON.stringify(result.recordset, null, 2)}\n\n📈 Total de registros: ${result.recordset.length}`,
          },
        ],
      };
    } catch (error) {
      console.error('Error ejecutando consulta:', error);
      throw new Error(`Error ejecutando consulta: ${error.message}`);
    }
  }

  async getTables() {
    const query = `
      SELECT 
        TABLE_SCHEMA as schema_name,
        TABLE_NAME as table_name,
        TABLE_TYPE as table_type
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `;
    
    try {
      const result = await this.executeQuery(query);
      
      // Agregar información adicional sobre las tablas
      const tablesResult = await this.pool.request().query(query);
      
      let tablesInfo = '📋 Tablas disponibles en la base de datos:\n\n';
      tablesResult.recordset.forEach(table => {
        tablesInfo += `• ${table.schema_name}.${table.table_name}\n`;
      });
      
      tablesInfo += `\n📊 Total de tablas: ${tablesResult.recordset.length}`;
      
      return {
        content: [
          {
            type: 'text',
            text: tablesInfo,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error obteniendo lista de tablas: ${error.message}`);
    }
  }

  async describeTable(tableName) {
    const query = `
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
    
    try {
      const result = await this.executeQuery(query, { tableName });
      
      // Crear descripción más legible
      const columnsResult = await this.pool.request()
        .input('tableName', tableName)
        .query(query);
      
      let tableInfo = `📋 Estructura de la tabla: ${tableName}\n\n`;
      tableInfo += '| Columna | Tipo | Longitud | Nulo | Valor por defecto |\n';
      tableInfo += '|---------|------|----------|------|-------------------|\n';
      
      columnsResult.recordset.forEach(col => {
        const length = col.max_length ? `(${col.max_length})` : '';
        const nullable = col.is_nullable === 'YES' ? 'Sí' : 'No';
        const defaultVal = col.column_default || '-';
        
        tableInfo += `| ${col.column_name} | ${col.data_type}${length} | ${col.max_length || '-'} | ${nullable} | ${defaultVal} |\n`;
      });
      
      tableInfo += `\n📊 Total de columnas: ${columnsResult.recordset.length}`;
      
      return {
        content: [
          {
            type: 'text',
            text: tableInfo,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Error describiendo tabla ${tableName}: ${error.message}`);
    }
  }

  async start() {
    try {
      await this.connectToDatabase();
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      // console.log('Servidor MCP SQL iniciado correctamente');
    } catch (error) {
      console.error('Error iniciando el servidor:', error);
      process.exit(1);
    }
  }
}

// Manejo de señales para cerrar conexiones limpiamente
process.on('SIGINT', async () => {
  console.log('Cerrando servidor MCP...');
  if (sql) {
    await sql.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cerrando servidor MCP...');
  if (sql) {
    await sql.close();
  }
  process.exit(0);
});

// Iniciar el servidor
const mcpServer = new MCPSQLServer();
mcpServer.start().catch(console.error);