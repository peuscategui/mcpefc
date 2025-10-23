# Servidor MCP TCP con Reconexión Automática

## Mejoras Implementadas

### ✅ Reconexión Automática
- **Verificación cada 30 segundos**: El servidor verifica la conexión a SQL Server automáticamente
- **Reconexión automática**: Si se pierde la conexión, se reconecta automáticamente
- **Verificación antes de cada operación**: Cada herramienta verifica la conexión antes de ejecutarse

### ✅ Manejo Robusto de Errores
- **Manejo de errores de conexión**: Captura y maneja errores de conexión a la base de datos
- **Logging mejorado**: Mensajes más claros sobre el estado de la conexión
- **Cierre limpio**: Manejo adecuado de señales de cierre del sistema

### ✅ Prevención de Cierres Inesperados
- **Pool de conexiones mejorado**: Configuración optimizada para conexiones de larga duración
- **Manejo de eventos de error**: Captura errores del pool de conexiones
- **Reinicio automático**: Opción de reinicio automático del servidor

## Archivos Modificados

### `mcp-tcp-fixed.js`
Servidor principal con reconexión automática implementada.

### `start-mcp-robust.js`
Script de inicio que reinicia automáticamente el servidor si se cierra inesperadamente.

### `test-reconnection.js`
Script de prueba para verificar la reconexión automática.

## Cómo Usar

### Opción 1: Servidor Directo
```bash
node mcp-tcp-fixed.js
```

### Opción 2: Servidor con Reinicio Automático
```bash
node start-mcp-robust.js
```

### Opción 3: Probar Reconexión
```bash
node test-reconnection.js
```

## Características de la Reconexión

### Verificación Automática
- **Intervalo**: Cada 30 segundos
- **Verificación**: Query simple `SELECT 1` para probar la conexión
- **Reconexión**: Automática si se detecta pérdida de conexión

### Logs de Reconexión
```
🔄 Reconectando a la base de datos...
✅ Conectado a Microsoft SQL Server
🔄 Reconectando antes de ejecutar get_tables...
```

### Manejo de Errores
- **Errores de conexión**: Se registran y se intenta reconexión
- **Errores de query**: Se manejan individualmente
- **Estado de conexión**: Se mantiene un flag `isConnected` para control

## Configuración

### Variables de Entorno
```bash
MCP_PORT=3000          # Puerto del servidor MCP
MCP_HOST=localhost     # Host del servidor MCP
```

### Configuración de Base de Datos
```javascript
{
  server: '192.168.2.18',
  port: 1433,
  database: 'PRUEBA_MCP',
  user: 'MCP',
  password: 'm_25_9e_pe1_',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}
```

## Monitoreo

### Logs Importantes
- `✅ Conectado a Microsoft SQL Server` - Conexión exitosa
- `🔄 Reconectando a la base de datos...` - Reconexión en proceso
- `❌ Error conectando a la base de datos` - Error de conexión
- `🔄 Reconexión automática activada cada 30 segundos` - Sistema activado

### Indicadores de Estado
- **Verde**: Conexión activa y funcionando
- **Amarillo**: Reconexión en proceso
- **Rojo**: Error de conexión

## Solución de Problemas

### Si el servidor se cierra inesperadamente:
1. Usar `start-mcp-robust.js` para reinicio automático
2. Verificar logs de reconexión
3. Comprobar conectividad a SQL Server

### Si hay errores de conexión:
1. Verificar que SQL Server esté funcionando
2. Comprobar credenciales y configuración de red
3. Revisar logs de reconexión automática

## Beneficios

- **Estabilidad**: El servidor no se cierra por pérdida de conexión
- **Confiabilidad**: Reconexión automática sin intervención manual
- **Monitoreo**: Logs claros del estado de la conexión
- **Robustez**: Manejo de errores y reinicio automático
