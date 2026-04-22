import { RedisClientType } from 'redis';
import { CatalogItem } from '../types';
export declare const getRedisClient: () => Promise<RedisClientType>;
export declare const saveCatalogToRedis: (items: CatalogItem[]) => Promise<void>;
export declare const getCatalogFromRedis: () => Promise<CatalogItem[]>;
//# sourceMappingURL=redis.d.ts.map