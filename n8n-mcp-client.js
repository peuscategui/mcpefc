// Cliente MCP para n8n
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const path = require('path');

class N8nMCPClient {
  constructor(config = {}) {
    this.config = {
      serverPath: config.serverPath || path.join(__dirname, 'src', 'server.js'),
      serverCwd: config.serverCwd || __dirname,
      env: config.env || {},
      ...config
    };
    
    this.client = null;
    this.transport = null;
    this.connected = false;
  }

  async connect() {
    try {
      console.log('🔌 Conectando al MCP Server...');
      
      this.transport = new StdioClientTransport({
        command: 'node',
        args: [this.config.serverPath],
        cwd: this.config.serverCwd,
        env: {
          ...process.env,
          ...this.config.env
        }
      });
      
      this.client = new Client({
        name: 'n8n-mcp-client',
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      await this.client.connect(this.transport);
      this.connected = true;
      
      console.log('✅ Conectado al MCP Server');
      return true;
    } catch (error) {
      console.error('❌ Error conectando al MCP Server:', error);
      this.connected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client && this.connected) {
        await this.client.close();
        this.connected = false;
        console.log('🔌 Desconectado del MCP Server');
      }
    } catch (error) {
      console.error('❌ Error desconectando:', error);
    }
  }

  async executeQuery(query, params = {}) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      console.log(`📊 Ejecutando consulta: ${query.substring(0, 50)}...`);
      
      const result = await this.client.callTool({
        name: 'execute_query',
        arguments: { 
          query: query,
          params: params
        }
      });

      return {
        success: true,
        data: result.content[0].text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error ejecutando consulta:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getTables() {
    if (!this.connected) {
      await this.connect();
    }

    try {
      console.log('📋 Obteniendo lista de tablas...');
      
      const result = await this.client.callTool({
        name: 'get_tables',
        arguments: {}
      });

      return {
        success: true,
        data: result.content[0].text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error obteniendo tablas:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async describeTable(tableName) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      console.log(`📋 Describiendo tabla: ${tableName}`);
      
      const result = await this.client.callTool({
        name: 'describe_table',
        arguments: { 
          table_name: tableName
        }
      });

      return {
        success: true,
        data: result.content[0].text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error describiendo tabla:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async listTools() {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const result = await this.client.listTools();
      return {
        success: true,
        tools: result.tools,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error listando herramientas:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Método para usar en n8n Function Node
  async processN8nRequest(action, params = {}) {
    try {
      switch (action) {
        case 'execute_query':
          return await this.executeQuery(params.query, params.params);
        
        case 'get_tables':
          return await this.getTables();
        
        case 'describe_table':
          return await this.describeTable(params.tableName);
        
        case 'list_tools':
          return await this.listTools();
        
        default:
          return {
            success: false,
            error: `Acción no soportada: ${action}`,
            timestamp: new Date().toISOString()
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Función para usar directamente en n8n
async function createMCPClient(config = {}) {
  const client = new N8nMCPClient(config);
  await client.connect();
  return client;
}

// Función para procesar requests desde n8n
async function processMCPRequest(action, params = {}, config = {}) {
  const client = new N8nMCPClient(config);
  try {
    const result = await client.processN8nRequest(action, params);
    return result;
  } finally {
    await client.disconnect();
  }
}

module.exports = {
  N8nMCPClient,
  createMCPClient,
  processMCPRequest
};

// Si se ejecuta directamente, hacer una prueba
if (require.main === module) {
  async function test() {
    console.log('🧪 Probando cliente MCP para n8n...');
    
    const client = new N8nMCPClient();
    
    try {
      // Probar conexión
      await client.connect();
      
      // Probar obtener tablas
      const tables = await client.getTables();
      console.log('📋 Tablas:', tables);
      
      // Probar consulta simple
      const query = "SELECT TOP 5 * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
      const result = await client.executeQuery(query);
      console.log('📊 Resultado:', result);
      
    } catch (error) {
      console.error('❌ Error en prueba:', error);
    } finally {
      await client.disconnect();
    }
  }
  
  test();
}
