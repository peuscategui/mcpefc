# 🚀 MCP SQL Server

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019-red.svg)](https://www.microsoft.com/en-us/sql-server)

Servidor MCP (Model Context Protocol) para conectividad con Microsoft SQL Server, optimizado para Claude Desktop y despliegue en Portainer.

## 🚀 Características

- **Conexión segura** a Microsoft SQL Server externo
- **Tres herramientas MCP** disponibles:
  - `execute_query`: Ejecuta consultas SELECT con validación de seguridad
  - `get_tables`: Lista todas las tablas de la base de datos
  - `describe_table`: Describe la estructura de una tabla específica
- **Contenedor Docker** optimizado con Node.js 18 Alpine
- **Health checks** integrados para monitoreo
- **Configuración flexible** mediante variables de entorno

## 📋 Requisitos previos

- Docker y Docker Compose instalados
- Portainer configurado y funcionando
- Acceso a un Microsoft SQL Server externo
- Credenciales válidas para el SQL Server
- Puerto 1433 accesible desde el host Docker

## 🔧 Instalación y configuración

### 1. Clonar o descargar el proyecto

```bash
git clone <tu-repositorio>
cd mcp-server
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Microsoft SQL Server Configuration
DB_HOST=192.168.1.100
DB_PORT=1433
DB_NAME=mi_base_datos
DB_USER=mi_usuario
DB_PASSWORD=mi_password_segura

# MCP Server Configuration
MCP_PORT=3000
MCP_HOST=0.0.0.0

# Logging
LOG_LEVEL=info

# SQL Server Options
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true
```

## 🐳 Despliegue en Portainer

### Paso 1: Preparación

1. **Verificar conectividad**: Asegúrate de que tu servidor Docker puede alcanzar el SQL Server:
   ```bash
   telnet <IP_SQL_SERVER> 1433
   ```

2. **Obtener credenciales**: Confirma que tienes las credenciales correctas del SQL Server

3. **Verificar firewall**: Asegúrate de que el puerto 1433 esté abierto

### Paso 2: Crear Stack en Portainer

1. Accede a **Portainer** → **Stacks** → **Add Stack**
2. Nombre del stack: `mcp-sql-server`
3. Método de build: **Repository** o **Upload**
4. Copia y pega el contenido del archivo `docker-compose.yml`

### Paso 3: Configurar variables de entorno

En la sección **"Environment variables"** de Portainer, agrega:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DB_HOST` | `192.168.1.100` | IP o hostname de tu SQL Server |
| `DB_PORT` | `1433` | Puerto del SQL Server |
| `DB_NAME` | `mi_base_datos` | Nombre de la base de datos |
| `DB_USER` | `mi_usuario` | Usuario de SQL Server |
| `DB_PASSWORD` | `mi_password_segura` | Contraseña |
| `DB_ENCRYPT` | `true` | Encriptar conexión |
| `DB_TRUST_SERVER_CERTIFICATE` | `true` | Confiar en certificado |

### Paso 4: Desplegar

1. Haz clic en **"Deploy the stack"**
2. Espera a que se construya la imagen
3. Verifica los logs del contenedor

### Paso 5: Verificación

1. **Revisar logs**: Debe mostrar "Conectado a Microsoft SQL Server"
2. **Verificar health status**: En Portainer debe aparecer como "Healthy"
3. **Probar conectividad**: Verifica que el contenedor puede resolver el hostname del SQL Server

## 🧪 Pruebas de conectividad

### Desde el host Docker:

```bash
# Verificar conectividad de red
docker exec mcp-sql-server ping <IP_SQL_SERVER>

# Verificar logs del contenedor
docker logs mcp-sql-server

# Verificar health check
docker inspect mcp-sql-server | grep Health -A 10
```

### Desde Portainer:

1. Ve a **Containers** → `mcp-sql-server`
2. Revisa la pestaña **Logs**
3. Verifica el estado en **Inspect** → **Health**

## 🔧 Variables de entorno completas

| Variable | Descripción | Default | Requerido |
|----------|-------------|---------|-----------|
| `DB_HOST` | IP/hostname del SQL Server | - | ✅ |
| `DB_PORT` | Puerto de SQL Server | `1433` | ❌ |
| `DB_NAME` | Nombre de la base de datos | - | ✅ |
| `DB_USER` | Usuario de SQL Server | - | ✅ |
| `DB_PASSWORD` | Contraseña | - | ✅ |
| `DB_ENCRYPT` | Encriptar conexión | `true` | ❌ |
| `DB_TRUST_SERVER_CERTIFICATE` | Confiar en certificado | `true` | ❌ |
| `LOG_LEVEL` | Nivel de logging | `info` | ❌ |

## 🛠️ Desarrollo local

### Instalar dependencias:

```bash
npm install
```

### Ejecutar en modo desarrollo:

```bash
npm run dev
```

### Ejecutar en producción:

```bash
npm start
```

## 🔍 Troubleshooting

### Problema: "Error conectando a la base de datos"

**Soluciones:**
1. Verificar que `DB_HOST` sea accesible desde el contenedor
2. Confirmar que el puerto 1433 esté abierto
3. Validar credenciales de SQL Server
4. Verificar configuración de firewall

### Problema: "Health check failed"

**Soluciones:**
1. Revisar logs del contenedor
2. Verificar que el proceso Node.js esté ejecutándose
3. Comprobar recursos disponibles (memoria/CPU)

### Problema: "Solo se permiten consultas SELECT"

**Explicación:** Por seguridad, el servidor solo permite consultas SELECT. Esto es intencional.

### Problema: "Certificado SSL no confiable"

**Soluciones:**
1. Configurar `DB_TRUST_SERVER_CERTIFICATE=true`
2. O configurar `DB_ENCRYPT=false` si no necesitas encriptación

## 📊 Monitoreo

### Health Checks

El contenedor incluye health checks automáticos cada 30 segundos:

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "console.log('Health check passed')"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Logs importantes

- `"Conectado a Microsoft SQL Server"` - Conexión exitosa
- `"Servidor MCP SQL iniciado correctamente"` - Servidor listo
- Errores de conexión o consultas SQL

## 🔐 Consideraciones de seguridad

1. **Solo consultas SELECT**: El servidor valida que solo se ejecuten consultas SELECT
2. **Conexión encriptada**: Por defecto usa SSL/TLS
3. **Usuario no-root**: El contenedor ejecuta con usuario `mcp:1001`
4. **Variables de entorno**: Las credenciales nunca están hardcodeadas
5. **Límites de recursos**: Configurados para prevenir abuso

## 📝 Ejemplos de uso

Una vez desplegado, el servidor MCP expone estas herramientas:

### 1. Listar tablas
```json
{
  "name": "get_tables",
  "arguments": {}
}
```

### 2. Describir tabla
```json
{
  "name": "describe_table",
  "arguments": {
    "table_name": "usuarios"
  }
}
```

### 3. Ejecutar consulta
```json
{
  "name": "execute_query",
  "arguments": {
    "query": "SELECT TOP 10 * FROM usuarios WHERE activo = 1",
    "params": {}
  }
}
```

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de [Troubleshooting](#-troubleshooting)
2. Verifica los logs del contenedor
3. Asegúrate de que tu SQL Server sea accesible
4. Abre un issue en el repositorio

---

**Nota**: Este servidor MCP está diseñado específicamente para consultas de solo lectura (SELECT). Para operaciones de escritura, considera implementar una API REST separada con las debidas validaciones y permisos.
