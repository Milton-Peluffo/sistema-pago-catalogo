# Sistema de Catálogo de Pagos

Proyecto para la gestión de catálogo de servicios de pago utilizando AWS Lambda, Redis y S3.

## Arquitectura

El sistema consiste en dos endpoints principales:

### 1. POST /catalog/update
- **Función**: `uploadCatalog`
- **Descripción**: Recibe un archivo CSV, lo procesa y actualiza el catálogo en Redis
- **Almacenamiento**: Sube el archivo a S3 y actualiza los datos en Redis
- **Método HTTP**: POST

### 2. GET /catalog
- **Función**: `getCatalog`
- **Descripción**: Consulta el catálogo de servicios desde Redis
- **Respuesta**: Retorna el listado completo de servicios en formato JSON
- **Método HTTP**: GET

## Estructura del Proyecto

```
sistema-pago-catalogo/
├── src/
│   ├── lambdas/
│   │   ├── uploadCatalog.ts    # Lambda para actualizar catálogo
│   │   └── getCatalog.ts       # Lambda para obtener catálogo
│   ├── types/
│   │   └── index.ts            # Definiciones de tipos
│   ├── utils/
│   │   ├── redis.ts            # Utilidades de Redis
│   │   ├── s3.ts               # Utilidades de S3
│   │   └── csvParser.ts        # Parser de CSV
│   └── index.ts                # Export principal
├── terraform/
│   ├── main.tf                 # Configuración de infraestructura
│   └── outputs.tf              # Outputs de Terraform
├── package.json
├── tsconfig.json
├── serverless.yml              # Configuración de Serverless Framework
├── webpack.config.js
└── README.md
```

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- AWS CLI configurado
- Terraform instalado
- Serverless Framework instalado

### Pasos de Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar infraestructura con Terraform**
   ```bash
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

3. **Actualizar configuración de Redis**
   - Actualizar los parámetros SSM con la configuración real del cluster Redis
   - Host del cluster Redis
   - Puerto (usualmente 6379)
   - Contraseña

4. **Desplegar las funciones Lambda**
   ```bash
   npm run deploy
   ```

## Formato del CSV

El archivo CSV debe tener el siguiente formato:

```csv
ID,Categoría,Proveedor,Servicio,Plan,Precio Mensual,Velocidad/Detalles,Estado
1,Energía,Empresa Eléctrica Nacional,Luz Residencial,Básico,"45,00 US$",150 kWh incluidos,Activo
2,Energía,Empresa Eléctrica Nacional,Luz Residencial,Premium,"75,00 US$",300 kWh incluidos,Activo
...
```

## Ejemplos de Uso

### Actualizar Catálogo (POST)

```bash
curl -X POST https://your-api-gateway-url/catalog/update \
  -H "Content-Type: text/csv" \
  --data-binary @catalogo.csv
```

### Obtener Catálogo (GET)

```bash
curl https://your-api-gateway-url/catalog
```

Respuesta esperada:
```json
[
  {
    "id": 1,
    "categoria": "Energía",
    "proveedor": "Empresa Eléctrica Nacional",
    "servicio": "Luz Residencial",
    "plan": "Básico",
    "precio_mensual": 45000,
    "detalles": "150 kWh incluidos",
    "estado": "Activo"
  }
]
```

## Variables de Entorno

Las siguientes variables de entorno son configuradas automáticamente:

- `REDIS_HOST`: Host del cluster Redis (desde SSM)
- `REDIS_PORT`: Puerto del cluster Redis (desde SSM)
- `REDIS_PASSWORD`: Contraseña del cluster Redis (desde SSM)
- `S3_BUCKET_NAME`: Nombre del bucket S3 para archivos CSV

## Notas Importantes

1. **Redis**: Se asume que el cluster Redis será configurado por otro equipo
2. **Frontend**: El frontend será desarrollado en otro repositorio
3. **Seguridad**: Los archivos en S3 están encriptados con KMS
4. **Logs**: Las funciones Lambda generan logs en CloudWatch
5. **CORS**: Los endpoints están configurados para permitir CORS

## Testing

Para probar localmente:

```bash
# Compilar TypeScript
npm run build

# Probar funciones localmente (requiere configuración local de Redis y AWS)
serverless invoke local -f uploadCatalog
serverless invoke local -f getCatalog
```

## Despliegue

El despliegue se realiza mediante Serverless Framework:

```bash
npm run deploy
```

Esto creará:
- Funciones Lambda en AWS
- API Gateway con los endpoints configurados
- Roles y permisos IAM necesarios
- Integración con los recursos existentes (S3, Redis)
