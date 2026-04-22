"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const redis_1 = require("../utils/redis");
const handler = async (event) => {
    try {
        console.log('Received get catalog request:', event);
        // Obtener catálogo desde Redis
        const catalogItems = await (0, redis_1.getCatalogFromRedis)();
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
    }
    catch (error) {
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
exports.handler = handler;
//# sourceMappingURL=getCatalog.js.map