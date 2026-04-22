"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const s3_1 = require("../utils/s3");
const redis_1 = require("../utils/redis");
const csvParser_1 = require("../utils/csvParser");
const handler = async (event) => {
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
        let fileContent;
        if (event.isBase64Encoded) {
            fileContent = Buffer.from(event.body, 'base64').toString('utf-8');
        }
        else {
            fileContent = event.body;
        }
        // Parsear el contenido CSV
        const catalogItems = (0, csvParser_1.parseCSVContent)(fileContent);
        console.log(`Parsed ${catalogItems.length} items from CSV`);
        // Guardar en Redis
        await (0, redis_1.saveCatalogToRedis)(catalogItems);
        // Subir archivo a S3
        const bucketName = process.env.S3_BUCKET_NAME || 'catalogo-pagos-csv';
        const fileName = `catalog-${Date.now()}.csv`;
        const buffer = Buffer.from(fileContent, 'utf-8');
        await (0, s3_1.uploadFileToS3)(bucketName, buffer, fileName, 'text/csv');
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
    }
    catch (error) {
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
exports.handler = handler;
//# sourceMappingURL=uploadCatalog.js.map