# Instrucciones para Compañero - Cluster Redis

## Información para el Equipo de Redis

### Contexto
Necesitamos un cluster Redis para el sistema de catálogo de pagos. Las funciones Lambda ya están desplegadas y esperando conexión.

## Requisitos Técnicos

### 1. Configuración Básica
- **Región AWS**: us-east-1
- **Tipo**: Redis Cluster Mode Enabled
- **Versión**: Redis 6.x o superior
- **Motor**: Redis

### 2. Configuración de Red
- **VPC**: Usar la misma VPC donde están las Lambda functions
- **Subnets**: Al menos 2 subnets en diferentes Availability Zones
- **Security Group**: Permitir tráfico en puerto 6379 desde las Lambda functions

### 3. Configuración de Seguridad
- **Autenticación**: Habilitar auth token (contraseña)
- **Encriptación**: Habilitar encriptación en tránsito y en reposo
- **Grupos de seguridad**: Restringir acceso solo a componentes necesarios

## Información Requerida

Una vez configurado el cluster, por favor proporcionar:

### 1. Endpoint del Cluster
```
Formato: xxxxxxx.cluster.xxx.cache.amazonaws.com
Ejemplo: my-redis-cluster.abcdefg.clustercfg.use1.cache.amazonaws.com
```

### 2. Puerto
```
Por defecto: 6379
```

### 3. Contraseña
```
Password de autenticación configurada
```

## Integración con Sistema

### Parámetros SSM a Actualizar
El sistema ya tiene los parámetros SSM creados, solo necesitan actualización:

- `/catalogo/redis/host` - Endpoint del cluster
- `/catalogo/redis/port` - Puerto (6379)
- `/catalogo/redis/password` - Contraseña

### Comandos para Actualizar
```bash
# Actualizar endpoint
aws ssm put-parameter \
  --name "/catalogo/redis/host" \
  --value "TU-REDIS-ENDPOINT" \
  --type String \
  --overwrite

# Actualizar contraseña
aws ssm put-parameter \
  --name "/catalogo/redis/password" \
  --value "TU-REDIS-PASSWORD" \
  --type SecureString \
  --overwrite
```

## Consideraciones Importantes

### 1. Conectividad
- Asegurar que las Lambda functions puedan conectar al cluster
- Verificar configuración de Security Groups
- Validar resolución DNS del endpoint

### 2. Rendimiento
- Configurar apropiadamente según carga esperada
- Monitorear métricas de CPU y memoria
- Considerar replicación para alta disponibilidad

### 3. Costos
- El cluster Redis genera costos por hora
- Considerar instance type apropiado para MVP
- Evaluar necesidad de Multi-AZ

## Tiempos Estimados

- **Configuración inicial**: 30-45 minutos
- **Validación conectividad**: 10-15 minutos
- **Pruebas de integración**: 15 minutos

## Contacto

Para cualquier duda sobre la integración, contactar al equipo del catálogo de pagos.

---

**Nota**: El sistema está desplegado y listo para conectarse al cluster Redis una vez esté disponible.
