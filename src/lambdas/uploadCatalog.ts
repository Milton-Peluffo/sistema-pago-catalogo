import { APIGatewayProxyEvent, APIGatewayProxyResult } from '../types';
import { uploadFileToS3 } from '../utils/s3';
import { saveCatalogToRedis } from '../utils/redis';
import { parseCSVContent } from '../utils/csvParser';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Received upload catalog request:', event);

    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ error: 'No file content provided' }),
        isBase64Encoded: false
      };
    }

    // Decodificar el contenido base64 si viene codificado
    let fileContent: string;
    if (event.isBase64Encoded) {
      fileContent = Buffer.from(event.body, 'base64').toString('utf-8');
    } else {
      fileContent = event.body;
    }

    // Parsear el contenido CSV
    const catalogItems = parseCSVContent(fileContent);
    console.log(`Parsed ${catalogItems.length} items from CSV`);

    // Guardar en Redis
    await saveCatalogToRedis(catalogItems);

    // Subir archivo a S3
    const bucketName = process.env.S3_BUCKET_NAME || 'catalogo-pagos-csv';
    const fileName = `catalog-${Date.now()}.csv`;
    const buffer = Buffer.from(fileContent, 'utf-8');
    
    await uploadFileToS3(bucketName, buffer, fileName, 'text/csv');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        message: 'Catalog updated successfully',
        itemsProcessed: catalogItems.length,
        fileName: fileName
      }),
      isBase64Encoded: false
    };

  } catch (error) {
    console.error('Error in uploadCatalog handler:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      isBase64Encoded: false
    };
  }
};
