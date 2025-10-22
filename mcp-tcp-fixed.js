// Servidor MCP TCP corregido para conexiones remotas
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import sql from 'mssql';
import dotenv from 'dotenv';
import net from 'net';

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

    this.setupToolHandlers();
  }

  async connectToDatabase() {
    try {
      const config = {
        server: '192.168.2.18',
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

      this.pool = await sql.connect(config);
      console.log('✅ Conectado a Microsoft SQL Server');
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error);
      throw error;
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_tables',
            description: 'Obtiene la lista de todas las tablas en la base de datos',
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
                tableName: {
                  type: 'string',
                  description: 'Nombre de la tabla a describir',
                },
              },
              required: ['tableName'],
            },
          },
          {
            name: 'execute_query',
            description: 'Ejecuta una consulta SQL en la base de datos',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Consulta SQL a ejecutar',
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_tables':
            return await this.getTables();
          case 'describe_table':
            return await this.describeTable(args.tableName);
          case 'execute_query':
            return await this.executeQuery(args.query);
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
          isError: true,
        };
      }
    });
  }

  async getTables() {
    const result = await this.pool.request().query(`
      SELECT 
        TABLE_SCHEMA as schema_name,
        TABLE_NAME as table_name,
        TABLE_TYPE as table_type
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `);

    const tables = result.recordset.map(row => 
      `📋 **${row.schema_name}.${row.table_name}** (${row.table_type})`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `🗄️ **Tablas en la base de datos:**\n\n${tables}\n\n📊 Total: ${result.recordset.length} tablas`,
        },
      ],
    };
  }

  async describeTable(tableName) {
    const result = await this.pool.request()
      .input('tableName', sql.NVarChar, tableName)
      .query(`
        SELECT 
          COLUMN_NAME as column_name,
          DATA_TYPE as data_type,
          CHARACTER_MAXIMUM_LENGTH as max_length,
          IS_NULLABLE as is_nullable,
          COLUMN_DEFAULT as default_value
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = @tableName
        ORDER BY ORDINAL_POSITION
      `);

    if (result.recordset.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Tabla '${tableName}' no encontrada`,
          },
        ],
      };
    }

    const columns = result.recordset.map(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const length = col.max_length ? `(${col.max_length})` : '';
      const defaultValue = col.default_value ? ` DEFAULT ${col.default_value}` : '';
      
      return `  • **${col.column_name}**: ${col.data_type}${length} ${nullable}${defaultValue}`;
    }).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `📋 **Estructura de la tabla '${tableName}':**\n\n${columns}\n\n📊 Total: ${result.recordset.length} columnas`,
        },
      ],
    };
  }

  async executeQuery(query) {
    const result = await this.pool.request().query(query);
    
    if (result.recordset.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `✅ Consulta ejecutada exitosamente.\n📊 Filas afectadas: ${result.rowsAffected[0] || 0}`,
          },
        ],
      };
    }

    const headers = Object.keys(result.recordset[0]);
    const rows = result.recordset.map(row => 
      headers.map(header => row[header] || 'NULL').join(' | ')
    );

    const table = [
      headers.join(' | '),
      headers.map(() => '---').join(' | '),
      ...rows
    ].join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `✅ **Resultados de la consulta:**\n\n${table}\n\n📊 Total: ${result.recordset.length} filas`,
        },
      ],
    };
  }

  async start() {
    try {
      await this.connectToDatabase();
      
      const port = process.env.MCP_PORT || 3000;
      
      const tcpServer = net.createServer((socket) => {
        console.log('🔗 Cliente conectado al servidor MCP TCP');
        
        let buffer = '';
        
        // Manejar datos entrantes
        socket.on('data', async (data) => {
          buffer += data.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop(); // Mantener la línea incompleta
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const message = JSON.parse(line);
                console.log('📥 Mensaje recibido:', JSON.stringify(message, null, 2));
                
                // Manejar mensaje según el protocolo MCP
                if (message.method === 'initialize') {
                  const response = {
                    jsonrpc: '2.0',
                    id: message.id,
                    result: {
                      protocolVersion: '2025-06-18',
                      capabilities: {
                        tools: {}
                      },
                      serverInfo: {
                        name: 'mcp-sql-server',
                        version: '1.0.0'
                      }
                    }
                  };
                  socket.write(JSON.stringify(response) + '\n');
                  console.log('📤 Respuesta initialize enviada');
                  
                } else if (message.method === 'tools/list') {
                  const response = {
                    jsonrpc: '2.0',
                    id: message.id,
                    result: {
                      tools: [
                        {
                          name: 'get_tables',
                          description: 'Obtiene la lista de todas las tablas en la base de datos',
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
                              tableName: {
                                type: 'string',
                                description: 'Nombre de la tabla a describir',
                              },
                            },
                            required: ['tableName'],
                          },
                        },
                        {
                          name: 'execute_query',
                          description: 'Ejecuta una consulta SQL en la base de datos',
                          inputSchema: {
                            type: 'object',
                            properties: {
                              query: {
                                type: 'string',
                                description: 'Consulta SQL a ejecutar',
                              },
                            },
                            required: ['query'],
                          },
                        },
                      ]
                    }
                  };
                  socket.write(JSON.stringify(response) + '\n');
                  console.log('📤 Lista de herramientas enviada');
                  
                } else if (message.method === 'tools/call') {
                  const { name, arguments: args } = message.params;
                  let result;
                  
                  try {
                    switch (name) {
                      case 'get_tables':
                        result = await this.getTables();
                        break;
                      case 'describe_table':
                        result = await this.describeTable(args.tableName);
                        break;
                      case 'execute_query':
                        result = await this.executeQuery(args.query);
                        break;
                      default:
                        throw new Error(`Herramienta desconocida: ${name}`);
                    }
                    
                    const response = {
                      jsonrpc: '2.0',
                      id: message.id,
                      result: result
                    };
                    socket.write(JSON.stringify(response) + '\n');
                    console.log('📤 Resultado de herramienta enviado');
                    
                  } catch (error) {
                    const response = {
                      jsonrpc: '2.0',
                      id: message.id,
                      error: {
                        code: -32603,
                        message: `Error ejecutando ${name}: ${error.message}`
                      }
                    };
                    socket.write(JSON.stringify(response) + '\n');
                    console.log('📤 Error enviado');
                  }
                }
                
              } catch (err) {
                console.error('❌ Error parseando mensaje:', err.message);
              }
            }
          }
        });
        
        socket.on('close', () => {
          console.log('🔌 Cliente desconectado');
        });
        
        socket.on('error', (err) => {
          console.error('❌ Error del socket:', err.message);
        });
      });
      
      tcpServer.listen(port, () => {
        console.log(`🚀 Servidor MCP TCP iniciado en puerto ${port}`);
        console.log(`📍 Conecta desde Claude Desktop usando: ${process.env.MCP_HOST || 'localhost'}:${port}`);
      });
      
    } catch (error) {
      console.error('Error iniciando el servidor:', error);
      process.exit(1);
    }
  }
}

// Manejo de señales para cierre limpio
process.on('SIGINT', async () => {
  console.log('Cerrando servidor MCP TCP...');
  if (sql) {
    await sql.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cerrando servidor MCP TCP...');
  if (sql) {
    await sql.close();
  }
  process.exit(0);
});

// Iniciar el servidor
const mcpServer = new MCPSQLServer();
mcpServer.start().catch(console.error);
