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

    // Asegurar encoding UTF-8 correcto para tildes
    fileContent = Buffer.from(fileContent, 'utf-8').toString('utf-8');

    // Parsear el contenido CSV
    const catalogItems = parseCSVContent(fileContent);
    console.log(`Parsed ${catalogItems.length} items from CSV`);

    // Guardar en Redis
    await saveCatalogToRedis(catalogItems);

    // Subir archivo a S3 (síncrono para depuración)
    let fileName = null;
    try {
      const bucketName = process.env.S3_BUCKET_NAME || 'catalogo-pagos-csv';
      fileName = `catalog-${Date.now()}.csv`;
      
      // Asegurar encoding UTF-8 con BOM para compatibilidad con Excel
      const BOM = '\uFEFF';
      const csvContent = BOM + fileContent;
      const buffer = Buffer.from(csvContent, 'utf-8');
      
      console.log(`Attempting S3 upload to bucket: ${bucketName}, file: ${fileName}`);
      await uploadFileToS3(bucketName, buffer, fileName, 'text/csv; charset=utf-8');
      console.log(`File uploaded to S3: ${fileName}`);
    } catch (s3Error) {
      console.error('S3 upload failed:', s3Error);
      fileName = null;
    }

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
        fileName: fileName,
        note: fileName ? 'File uploaded to S3' : 'S3 upload failed (check logs)'
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
