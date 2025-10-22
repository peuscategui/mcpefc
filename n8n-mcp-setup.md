# 🔗 Configuración MCP Client en n8n

## 📋 **Paso 1: Instalar MCP Client en n8n**

### **Opción A: Instalación via npm**
```bash
# En tu entorno n8n
npm install @modelcontextprotocol/sdk
```

### **Opción B: Instalación via Docker (si usas n8n en Docker)**
Agregar al Dockerfile de n8n:
```dockerfile
RUN npm install @modelcontextprotocol/sdk
```

## 📋 **Paso 2: Configurar MCP Client en n8n**

### **Crear archivo de configuración MCP**
Crea un archivo `mcp-client-config.json` en n8n:

```json
{
  "mcpServers": {
    "sql-server-local": {
      "command": "node",
      "args": ["C:\\desk\\mcp-server\\src\\server.js"],
      "cwd": "C:\\desk\\mcp-server",
      "env": {
        "DB_HOST": "SURDBP04",
        "DB_PORT": "1433",
        "DB_NAME": "PRUEBA_MCP",
        "DB_USER": "MCP",
        "DB_PASSWORD": "m_25_9e_pe1_"
      }
    }
  }
}
```

## 📋 **Paso 3: Crear workflow en n8n**

### **Ejemplo de workflow básico:**

1. **Trigger**: Manual o Webhook
2. **HTTP Request Node**: Para llamar al MCP Client
3. **Function Node**: Para procesar respuestas
4. **Output**: Mostrar resultados

## 📋 **Paso 4: Configurar Node personalizado**

### **Crear custom node para MCP:**

```javascript
// mcp-sql-node.js
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

class MCPSQLNode {
  constructor() {
    this.client = null;
    this.transport = null;
  }

  async connect() {
    this.transport = new StdioClientTransport({
      command: 'node',
      args: ['C:\\desk\\mcp-server\\src\\server.js'],
      cwd: 'C:\\desk\\mcp-server'
    });
    
    this.client = new Client({
      name: 'n8n-mcp-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await this.client.connect(this.transport);
  }

  async executeQuery(query) {
    if (!this.client) {
      await this.connect();
    }

    const result = await this.client.callTool({
      name: 'execute_query',
      arguments: { query }
    });

    return result;
  }

  async getTables() {
    if (!this.client) {
      await this.connect();
    }

    const result = await this.client.callTool({
      name: 'get_tables',
      arguments: {}
    });

    return result;
  }

  async describeTable(tableName) {
    if (!this.client) {
      await this.connect();
    }

    const result = await this.client.callTool({
      name: 'describe_table',
      arguments: { table_name: tableName }
    });

    return result;
  }
}

module.exports = MCPSQLNode;
```

## 📋 **Paso 5: Usar en n8n**

### **Ejemplo de uso en Function Node:**

```javascript
// En un Function Node de n8n
const MCPSQLNode = require('./mcp-sql-node');

async function main() {
  const mcpClient = new MCPSQLNode();
  
  try {
    // Ejemplo: Obtener todas las tablas
    const tables = await mcpClient.getTables();
    
    // Ejemplo: Ejecutar consulta
    const query = "SELECT TOP 10 * FROM temporal_cliente";
    const result = await mcpClient.executeQuery(query);
    
    return {
      tables: tables,
      queryResult: result
    };
  } catch (error) {
    return { error: error.message };
  }
}

return await main();
```

## 📋 **Paso 6: Configurar Variables de Entorno en n8n**

En la configuración de n8n, agrega estas variables:

```env
MCP_SERVER_PATH=C:\desk\mcp-server\src\server.js
MCP_SERVER_CWD=C:\desk\mcp-server
DB_HOST=SURDBP04
DB_PORT=1433
DB_NAME=PRUEBA_MCP
DB_USER=MCP
DB_PASSWORD=m_25_9e_pe1_
```

## 🔄 **Ejemplos de Workflows**

### **Workflow 1: Consulta automática diaria**
1. **Schedule Trigger**: Cada día a las 9:00 AM
2. **MCP Node**: Ejecutar consulta SQL
3. **Email Node**: Enviar resultados por email

### **Workflow 2: API para consultas**
1. **Webhook Trigger**: Recibir consultas via HTTP
2. **MCP Node**: Ejecutar consulta dinámica
3. **Response Node**: Devolver resultados JSON

### **Workflow 3: Monitoreo de datos**
1. **Schedule Trigger**: Cada hora
2. **MCP Node**: Verificar conteo de registros
3. **Condition Node**: Si hay cambios, enviar alerta

## 🚨 **Consideraciones de Seguridad**

- ✅ Solo consultas SELECT permitidas
- ✅ Validación de entrada en n8n
- ✅ Logs de todas las operaciones
- ✅ Límites de tiempo de ejecución

## 🔧 **Troubleshooting**

### **Error de conexión**
- Verificar que el MCP Server esté ejecutándose
- Confirmar rutas en la configuración
- Revisar permisos de archivos

### **Error de permisos**
- Ejecutar n8n con permisos adecuados
- Verificar acceso a la base de datos
- Confirmar configuración de firewall
