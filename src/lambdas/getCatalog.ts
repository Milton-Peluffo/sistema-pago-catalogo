import { APIGatewayProxyEvent, APIGatewayProxyResult } from '../types';
import { getCatalogFromRedis } from '../utils/redis';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Received get catalog request:', event);

    // Obtener catálogo desde Redis
    const catalogItems = await getCatalogFromRedis();
    console.log(`Retrieved ${catalogItems.length} items from Redis`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(catalogItems),
      isBase64Encoded: false
    };

  } catch (error) {
    console.error('Error in getCatalog handler:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      isBase64Encoded: false
    };
  }
};