# Configuración de Parámetros Redis

## Parámetros SSM Creados

Terraform ha creado los siguientes parámetros en AWS Systems Manager:

- `/catalogo/redis/host` - Host del cluster Redis
- `/catalogo/redis/port` - Puerto del cluster Redis (6379)
- `/catalogo/redis/password` - Contraseña del cluster Redis
- `/catalogo/kms/key` - ARN de la llave KMS

## Valores Actuales (Placeholder)

Los parámetros tienen valores temporales que deben ser actualizados:

### 1. Actualizar Host de Redis
```bash
aws ssm put-parameter \
  --name "/catalogo/redis/host" \
  --value "tu-redis-cluster-endpoint.ejemplo.cache.amazonaws.com" \
  --type String \
  --overwrite
```

### 2. Actualizar Contraseña de Redis
```bash
aws ssm put-parameter \
  --name "/catalogo/redis/password" \
  --value "tu-redis-password-real" \
  --type SecureString \
  --overwrite
```

## Importante

- **Redis Cluster**: Debe ser configurado por otro equipo
- **Endpoint**: Usualmente termina en `.cache.amazonaws.com`
- **Seguridad**: La contraseña está encriptada como SecureString
- **Conectividad**: Asegúrate que las Lambda functions puedan acceder al cluster

## Verificación

Para verificar los valores actuales:
```bash
aws ssm get-parameter --name "/catalogo/redis/host"
aws ssm get-parameter --name "/catalogo/redis/port" --with-decryption
aws ssm get-parameter --name "/catalogo/redis/password" --with-decryption
```
