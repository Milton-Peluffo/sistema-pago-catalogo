import { createClient, RedisClientType } from 'redis';
import { CatalogItem } from '../types';

let redisClient: RedisClientType;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await redisClient.connect();
  }

  return redisClient;
};

export const saveCatalogToRedis = async (items: CatalogItem[]): Promise<void> => {
  const client = await getRedisClient();
  
  // Limpiar catálogo existente
  await client.del('catalog:items');
  
  // Guardar cada item como un hash
  for (const item of items) {
    await client.hSet(`catalog:item:${item.id}`, {
      id: item.id.toString(),
      categoria: item.categoria,
      proveedor: item.proveedor,
      servicio: item.servicio,
      plan: item.plan,
      precio_mensual: item.precio_mensual.toString(),
      detalles: item.detalles,
      estado: item.estado
    });
  }
  
  // Guardar lista de IDs para consulta rápida
  const ids = items.map(item => item.id.toString());
  await client.sAdd('catalog:ids', ids);
  
  console.log(`Saved ${items.length} items to Redis`);
};

export const getCatalogFromRedis = async (): Promise<CatalogItem[]> => {
  const client = await getRedisClient();
  
  // Obtener todos los IDs del catálogo
  const ids = await client.sMembers('catalog:ids');
  
  if (ids.length === 0) {
    return [];
  }
  
  // Obtener todos los items
  const catalog: CatalogItem[] = [];
  for (const id of ids) {
    const item = await client.hGetAll(`catalog:item:${id}`);
    if (item && item.id) {
      catalog.push({
        id: parseInt(item.id),
        categoria: item.categoria,
        proveedor: item.proveedor,
        servicio: item.servicio,
        plan: item.plan,
        precio_mensual: parseInt(item.precio_mensual),
        detalles: item.detalles,
        estado: item.estado
      });
    }
  }
  
  return catalog.sort((a, b) => a.id - b.id);
};
