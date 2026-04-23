# Sistema de Catálogo de Pagos

Proyecto para la gestión de catálogo de servicios de pago utilizando AWS Lambda, Redis y S3.

## Arquitectura y Funcionamiento

El sistema consiste en dos endpoints principales que operan en una arquitectura serverless:

### 1. POST /catalog/update - Proceso de Actualización del Catálogo

**Función**: `uploadCatalog`  
**Descripción**: Recibe un archivo CSV, lo procesa y actualiza el catálogo en Redis y S3  
**Método HTTP**: POST  

#### Flujo de Procesamiento:

1. **Recepción del Request**: 
   - El endpoint recibe un archivo CSV en formato raw con encoding UTF-8
   - Soporta caracteres especiales como tildes (á, é, í, ó, ú, ñ)

2. **Procesamiento del CSV**:
   - Parsea el contenido CSV línea por línea
   - Extrae los campos: ID, Categoría, Proveedor, Servicio, Plan, Precio Mensual, Velocidad/Detalles, Estado
   - Convierte los datos a objetos estructurados

3. **Almacenamiento en Redis**:
   - Conecta al cluster Redis usando TLS para comunicación segura
   - Limpia el catálogo existente con `flushDb()`
   - Guarda cada item como un hash Redis con la estructura: `catalogo:{id}`
   - Almacena los campos: id, categoria, proveedor, servicio, plan, precio_mensual, detalles, estado

4. **Almacenamiento en S3**:
   - Genera un nombre único para el archivo: `catalog-{timestamp}.csv`
   - Añade BOM (Byte Order Mark) para compatibilidad con Excel
   - Sube el archivo original al bucket S3 con encoding UTF-8
   - El archivo sirve como backup y referencia del catálogo cargado

5. **Response**:
   - Retorna confirmación de éxito con número de items procesados
   - Incluye información sobre el archivo subido a S3

### 2. GET /catalog - Consulta del Catálogo

**Función**: `getCatalog`  
**Descripción**: Consulta el catálogo de servicios desde Redis  
**Método HTTP**: GET  

#### Flujo de Consulta:

1. **Conexión a Redis**:
   - Establece conexión segura con el cluster Redis usando TLS
   - Autentica con las credenciales configuradas

2. **Recuperación de Datos**:
   - Busca todas las keys con patrón `catalogo:*`
   - Recupera cada hash individualmente
   - Construye el array de items del catálogo

3. **Formateo de Response**:
   - Convierte los datos a formato JSON
   - Mantiene la estructura original con todos los campos
   - Preserva encoding UTF-8 para caracteres especiales

4. **Response**:
   - Retorna el catálogo completo como array JSON
   - Incluye headers CORS para acceso desde frontend

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