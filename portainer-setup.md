# 🐳 Implementación MCP Server en Portainer

## 📋 **Pasos para implementar en Portainer**

### **Paso 1: Verificar conectividad**
Antes de desplegar, verifica que tu servidor Portainer puede alcanzar el SQL Server:

```bash
# Desde el servidor donde está Portainer
telnet SURDBP04 1433
# o
nc -zv SURDBP04 1433
```

### **Paso 2: Crear Stack en Portainer**

1. **Acceder a Portainer**
   - Ve a tu interfaz web de Portainer
   - Navega a **Stacks** → **Add Stack**

2. **Configurar el Stack**
   - **Nombre del stack**: `mcp-sql-server`
   - **Método de build**: **Repository** o **Upload**
   - **Upload del docker-compose.yml**

3. **Subir archivos**
   - Sube el archivo `docker-compose-portainer.yml`
   - O copia el contenido en el editor

### **Paso 3: Configurar Variables de Entorno**

En Portainer, configura estas variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DB_HOST` | `SURDBP04` | IP/hostname de tu SQL Server |
| `DB_PORT` | `1433` | Puerto de SQL Server |
| `DB_NAME` | `PRUEBA_MCP` | Nombre de la base de datos |
| `DB_USER` | `MCP` | Usuario de SQL Server |
| `DB_PASSWORD` | `m_25_9e_pe1_` | Contraseña |
| `DB_ENCRYPT` | `true` | Encriptar conexión |
| `DB_TRUST_SERVER_CERTIFICATE` | `true` | Confiar en certificado |

### **Paso 4: Desplegar**

1. **Hacer clic en "Deploy the stack"**
2. **Esperar a que se construya la imagen**
3. **Verificar los logs del contenedor**

### **Paso 5: Verificación**

1. **Revisar logs**: Debe mostrar conexión exitosa
2. **Verificar health status**: Debe aparecer como "Healthy"
3. **Probar conectividad**: Verificar que el contenedor puede resolver SURDBP04

## 🔧 **Configuración de Claude Desktop para Portainer**

Una vez desplegado, actualiza la configuración de Claude Desktop:

```json
{
  "mcpServers": {
    "sql-server-remote": {
      "command": "ssh",
      "args": [
        "usuario@servidor-portainer",
        "docker exec -i mcp-sql-server node src/server.js"
      ]
    }
  }
}
```

## 🚨 **Troubleshooting**

### **Error de conectividad a SQL Server**
- Verificar que SURDBP04 sea accesible desde el contenedor
- Confirmar que el puerto 1433 esté abierto
- Revisar configuración de firewall

### **Error de autenticación**
- Verificar credenciales de SQL Server
- Confirmar que el usuario MCP tenga permisos

### **Error de build**
- Verificar que todos los archivos estén presentes
- Revisar logs de build en Portainer

## 📊 **Monitoreo**

- **Health checks**: Cada 30 segundos
- **Logs**: Disponibles en Portainer → Containers → Logs
- **Recursos**: Límite de 512MB de memoria

## 🔐 **Consideraciones de Seguridad**

- Credenciales configuradas como variables de entorno
- Usuario no-root en el contenedor
- Límites de recursos configurados
- Solo consultas SELECT permitidas
