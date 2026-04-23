import { createClient, RedisClientType } from 'redis';
import { CatalogItem } from '../types';

let redisClient: RedisClientType;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'master.sistema-pagos-cluster.oofk4z.use1.cache.amazonaws.com',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        tls: true, // Requerido para encriptación en tránsito
      },
      password: process.env.REDIS_PASSWORD,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    await redisClient.connect();
  }

  return redisClient;
};

export const saveCatalogToRedis = async (items: CatalogItem[]): Promise<void> => {
  const client = await getRedisClient();
  
  // Limpiar catálogo existente
  await client.flushDb();
  
  // Guardar cada item como hash según la estructura del compañero
  for (const item of items) {
    await client.hSet(`catalogo:${item.id}`, {
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
  
  console.log(`Saved ${items.length} items to Redis`);
};

export const getCatalogFromRedis = async (): Promise<CatalogItem[]> => {
  const client = await getRedisClient();
  
  // Obtener todas las keys del catálogo según la estructura del compañero
  const keys = await client.keys('catalogo:*');
  
  if (keys.length === 0) {
    return [];
  }
  
  // Obtener todos los items
  const catalog: CatalogItem[] = [];
  for (const key of keys) {
    const item = await client.hGetAll(key);
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
