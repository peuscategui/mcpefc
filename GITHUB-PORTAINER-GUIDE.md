# 🚀 Guía: GitHub → Portainer

## 📋 **Paso 1: Subir a GitHub**

### **1.1 Crear repositorio en GitHub**
1. Ve a https://github.com/new
2. **Nombre del repositorio**: `mcp-sql-server`
3. **Descripción**: `MCP Server for Microsoft SQL Server connectivity with Claude Desktop`
4. **Visibilidad**: Private (recomendado para credenciales)
5. **NO marques** "Add a README file" (ya tenemos uno)
6. Haz clic en **"Create repository"**

### **1.2 Conectar repositorio local con GitHub**
```bash
# En tu terminal, desde c:\desk\mcp-server
git remote add origin https://github.com/TU_USUARIO/mcp-sql-server.git
git push -u origin main
```

**Reemplaza `TU_USUARIO`** con tu nombre de usuario de GitHub.

## 📋 **Paso 2: Implementar en Portainer**

### **2.1 Acceder a Portainer**
1. Ve a tu interfaz web de Portainer
2. Navega a **Stacks** → **Add Stack**

### **2.2 Crear Stack desde GitHub**
1. **Nombre del stack**: `mcp-sql-server`
2. **Método de build**: **Repository**
3. **Repository URL**: `https://github.com/TU_USUARIO/mcp-sql-server`
4. **Repository reference**: `main`
5. **Compose path**: `portainer-github.yml`

### **2.3 Configurar Variables de Entorno**
En la sección **Environment variables**, configura:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DB_HOST` | `SURDBP04` | Tu servidor SQL Server |
| `DB_PORT` | `1433` | Puerto de SQL Server |
| `DB_NAME` | `PRUEBA_MCP` | Nombre de la base de datos |
| `DB_USER` | `MCP` | Usuario de SQL Server |
| `DB_PASSWORD` | `m_25_9e_pe1_` | Contraseña |
| `DB_ENCRYPT` | `true` | Encriptar conexión |
| `DB_TRUST_SERVER_CERTIFICATE` | `true` | Confiar en certificado |

### **2.4 Desplegar**
1. Haz clic en **"Deploy the stack"**
2. Espera a que se construya (primera vez tomará 2-3 minutos)
3. Verifica los logs del contenedor

## 📋 **Paso 3: Verificar Implementación**

### **3.1 Verificar en Portainer**
1. **Containers** → Busca `mcp-sql-server`
2. **Status** debe ser "Running"
3. **Health** debe ser "Healthy"

### **3.2 Verificar Logs**
1. **Containers** → `mcp-sql-server` → **Logs**
2. Debe mostrar conexión exitosa sin errores

### **3.3 Verificar Conectividad**
```bash
# Desde el servidor Portainer
docker exec mcp-sql-server node test-connection.js
```

## 📋 **Paso 4: Configurar Claude Desktop**

### **4.1 Actualizar configuración de Claude Desktop**
Edita `claude_desktop_config.json`:

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

### **4.2 Alternativa: Usar conexión directa**
Si tienes acceso directo al servidor Portainer:

```json
{
  "mcpServers": {
    "sql-server-remote": {
      "command": "node",
      "args": ["/ruta/al/servidor/src/server.js"],
      "cwd": "/ruta/al/servidor",
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

## 🔧 **Comandos Útiles**

### **Actualizar desde GitHub**
```bash
# En Portainer, puedes actualizar el stack
# O manualmente:
git pull origin main
docker-compose down
docker-compose up -d --build
```

### **Ver logs en tiempo real**
```bash
docker logs -f mcp-sql-server
```

### **Entrar al contenedor**
```bash
docker exec -it mcp-sql-server sh
```

## 🚨 **Troubleshooting**

### **Error de conectividad a GitHub**
- Verificar que Portainer tenga acceso a internet
- Confirmar que la URL del repositorio sea correcta

### **Error de build**
- Verificar que `portainer-github.yml` esté en la raíz del repositorio
- Revisar logs de build en Portainer

### **Error de conexión a SQL Server**
- Verificar que SURDBP04 sea accesible desde el contenedor
- Confirmar credenciales y configuración de firewall

## 🎯 **Ventajas de esta implementación**

✅ **Versionado**: Código versionado en GitHub
✅ **Escalabilidad**: Fácil replicar en múltiples servidores
✅ **Mantenimiento**: Actualizaciones desde GitHub
✅ **Colaboración**: Múltiples desarrolladores pueden contribuir
✅ **Backup**: Código respaldado en GitHub
✅ **CI/CD**: Preparado para integración continua

## 📞 **Soporte**

Si tienes problemas:
1. Revisa los logs del contenedor
2. Verifica la conectividad de red
3. Confirma la configuración de variables de entorno
4. Consulta la documentación en el repositorio GitHub
