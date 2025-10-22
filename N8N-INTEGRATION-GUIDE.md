# 🔗 Guía de Integración MCP con n8n

## ✅ **Estado Actual**

- ✅ **MCP Server funcionando** localmente
- ✅ **Cliente MCP para n8n** creado y probado
- ✅ **Ejemplos de workflows** preparados
- ✅ **Documentación completa** disponible

## 🚀 **Pasos para conectar con n8n**

### **Paso 1: Instalar dependencias en n8n**

```bash
# En tu entorno n8n
npm install @modelcontextprotocol/sdk
```

### **Paso 2: Copiar archivos necesarios**

Copia estos archivos a tu entorno n8n:
- `n8n-mcp-client.js` - Cliente MCP para n8n
- `n8n-workflow-examples.json` - Ejemplos de workflows

### **Paso 3: Configurar n8n**

#### **Opción A: Usar Function Node**

1. **Crear nuevo workflow** en n8n
2. **Agregar Manual Trigger**
3. **Agregar Function Node** con este código:

```javascript
// Código para Function Node en n8n
const { processMCPRequest } = require('/ruta/a/n8n-mcp-client.js');

async function main() {
  try {
    const config = {
      env: {
        DB_HOST: 'SURDBP04',
        DB_PORT: '1433',
        DB_NAME: 'PRUEBA_MCP',
        DB_USER: 'MCP',
        DB_PASSWORD: 'm_25_9e_pe1_'
      }
    };
    
    // Ejecutar consulta
    const result = await processMCPRequest('execute_query', {
      query: 'SELECT TOP 10 * FROM temporal_cliente',
      params: {}
    }, config);
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

return await main();
```

#### **Opción B: Crear Custom Node**

1. **Crear carpeta** `custom-nodes` en n8n
2. **Copiar** `n8n-mcp-client.js`
3. **Crear node personalizado** usando el cliente

### **Paso 4: Ejemplos de uso**

#### **Ejemplo 1: Consulta simple**
```javascript
const result = await processMCPRequest('execute_query', {
  query: 'SELECT COUNT(*) as total FROM temporal_cliente',
  params: {}
}, config);
```

#### **Ejemplo 2: Obtener tablas**
```javascript
const result = await processMCPRequest('get_tables', {}, config);
```

#### **Ejemplo 3: Describir tabla**
```javascript
const result = await processMCPRequest('describe_table', {
  tableName: 'temporal_cliente'
}, config);
```

## 🔄 **Workflows disponibles**

### **1. Consulta Manual**
- **Trigger**: Manual
- **Acción**: Ejecutar consulta SQL
- **Output**: Resultados en formato JSON

### **2. API Webhook**
- **Trigger**: Webhook POST
- **Acción**: Ejecutar consulta dinámica
- **Output**: Respuesta HTTP JSON

### **3. Consulta Programada**
- **Trigger**: Schedule (cada hora)
- **Acción**: Ejecutar consulta de monitoreo
- **Output**: Email con resultados

## 🔧 **Configuración avanzada**

### **Variables de entorno en n8n**
```env
MCP_SERVER_PATH=C:\desk\mcp-server\src\server.js
MCP_SERVER_CWD=C:\desk\mcp-server
DB_HOST=SURDBP04
DB_PORT=1433
DB_NAME=PRUEBA_MCP
DB_USER=MCP
DB_PASSWORD=m_25_9e_pe1_
```

### **Configuración de seguridad**
- ✅ Solo consultas SELECT permitidas
- ✅ Validación de entrada
- ✅ Logs de todas las operaciones
- ✅ Timeouts configurables

## 📊 **Ejemplos de consultas**

### **Consultas de análisis**
```sql
-- Conteo de registros por tabla
SELECT COUNT(*) as total_registros FROM temporal_cliente

-- Top 10 clientes
SELECT TOP 10 * FROM temporal_cliente ORDER BY [Codigo Cliente]

-- Análisis por segmento
SELECT Segmento, COUNT(*) as cantidad 
FROM temporal_cliente 
GROUP BY Segmento
```

### **Consultas de monitoreo**
```sql
-- Verificar integridad de datos
SELECT 
  COUNT(*) as total_registros,
  COUNT(DISTINCT [Codigo Cliente]) as clientes_unicos
FROM temporal_cliente

-- Verificar registros nulos
SELECT COUNT(*) as registros_nulos
FROM temporal_cliente 
WHERE [Codigo Cliente] IS NULL
```

## 🚨 **Troubleshooting**

### **Error de conexión**
- Verificar que el MCP Server esté ejecutándose
- Confirmar rutas en la configuración
- Revisar permisos de archivos

### **Error de permisos**
- Ejecutar n8n con permisos adecuados
- Verificar acceso a la base de datos
- Confirmar configuración de firewall

### **Error de dependencias**
- Instalar `@modelcontextprotocol/sdk`
- Verificar versiones de Node.js
- Revisar logs de n8n

## 🎯 **Casos de uso**

### **1. Automatización de reportes**
- Generar reportes diarios automáticamente
- Enviar por email a stakeholders
- Almacenar en sistemas externos

### **2. Monitoreo de datos**
- Verificar integridad de datos
- Alertas por cambios significativos
- Dashboards en tiempo real

### **3. API para aplicaciones**
- Exponer datos via REST API
- Integración con otros sistemas
- Consultas dinámicas desde frontend

### **4. Análisis de datos**
- Consultas complejas automatizadas
- Procesamiento de grandes volúmenes
- Integración con herramientas de BI

## 📞 **Soporte**

Si tienes problemas:
1. Revisa los logs de n8n
2. Verifica la configuración del MCP Server
3. Confirma la conectividad a la base de datos
4. Consulta la documentación del proyecto

## 🔗 **Enlaces útiles**

- **Repositorio GitHub**: https://github.com/peuscategui/mcpefc
- **Documentación MCP**: https://modelcontextprotocol.io/
- **Documentación n8n**: https://docs.n8n.io/
