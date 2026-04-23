export interface CatalogItem {
  id: number;
  categoria: string;
  proveedor: string;
  servicio: string;
  plan: string;
  precio_mensual: number;
  detalles: string;
  estado: string;
}

export interface CSVRow {
  ID: string;
  Categoría: string;
  Proveedor: string;
  Servicio: string;
  Plan: string;
  'Precio Mensual': string;
  'Velocidad/Detalles': string;
  Estado: string;
}

export interface APIGatewayProxyEvent {
  body: string | null;
  headers: { [key: string]: string };
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  pathParameters: { [key: string]: string } | null;
  queryStringParameters: { [key: string]: string } | null;
  requestContext: {
    accountId: string;
    apiId: string;
    domainName: string;
    domainPrefix: string;
    httpMethod: string;
    path: string;
    protocol: string;
    requestId: string;
    requestTime: string;
    requestTimeEpoch: number;
    resourceId: string;
    resourcePath: string;
    stage: string;
  };
  resource: string;
  stageVariables: { [key: string]: string } | null;
}

export interface APIGatewayProxyResult {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
  isBase64Encoded: boolean;
}