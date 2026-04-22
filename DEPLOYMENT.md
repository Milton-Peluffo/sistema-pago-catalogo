# Guía de Despliegue Rápido

## Pasos para Desplegar el MVP

### 1. Configurar AWS CLI
```bash
aws configure
# Ingresa tus credenciales de AWS
```

### 2. Desplegar Infraestructura con Terraform
```bash
cd terraform
terraform init
terraform plan -var="aws_region=us-east-1"
terraform apply -var="aws_region=us-east-1" -auto-approve
```

### 3. Configurar Parámetros Redis (Importante)
Después del despliegue de Terraform, actualiza los siguientes parámetros SSM con la configuración real de tu cluster Redis:

```bash
# Actualizar host del cluster Redis
aws ssm put-parameter --name "/catalogo/redis/host" --value "tu-redis-cluster-endpoint" --type String --overwrite

# Actualizar contraseña de Redis
aws ssm put-parameter --name "/catalogo/redis/password" --value "tu-redis-password" --type SecureString --overwrite
```

### 4. Desplegar Funciones Lambda
```bash
# Regresar al directorio raíz
cd ..

# Instalar dependencias (si no lo has hecho)
npm install

# Desplegar con Serverless Framework
npm run deploy
```

### 5. Probar los Endpoints

#### POST /catalog/update
```bash
# Usar el archivo CSV de ejemplo
curl -X POST https://YOUR_API_GATEWAY_URL/catalog/update \
  -H "Content-Type: text/csv" \
  --data-binary @sample-catalog.csv
```

#### GET /catalog
```bash
curl https://YOUR_API_GATEWAY_URL/catalog
```

## Estructura de Archivos Creada

El proyecto ahora incluye:

- **Lambda Functions**: `uploadCatalog` y `getCatalog`
- **Infraestructura AWS**: S3 bucket, KMS key, parámetros SSM
- **API Gateway**: Endpoints `/catalog/update` y `/catalog`
- **Manejo de CSV**: Parser para procesar archivos CSV
- **Conexión Redis**: Cliente Redis con manejo de errores
- **Seguridad**: Encriptación KMS, CORS configurado

## Notas Finales

1. **Redis Cluster**: Asegúrate de tener el cluster Redis corriendo y actualiza los parámetros SSM
2. **Permisos**: Verifica que tu usuario AWS tenga los permisos necesarios
3. **Costos**: Revisa los costos estimados de los servicios AWS utilizados
4. **Monitoreo**: Los logs estarán disponibles en CloudWatch

El MVP está listo para ser desplegado y probado.
