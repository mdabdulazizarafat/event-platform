import { Redis } from 'ioredis';
import { createChildLogger } from './logger';
import dotenv from 'dotenv';

dotenv.config();

const logger = createChildLogger('redis');
const redisOptions: import('ioredis').RedisOptions = {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
};

if (!process.env.REDIS_URL) {
  redisOptions.host = process.env.REDIS_HOST || '127.0.0.1';
  redisOptions.port = parseInt(process.env.REDIS_PORT || '6379', 10);
  if (process.env.REDIS_PASSWORD) {
    redisOptions.password = process.env.REDIS_PASSWORD;
  }
}

const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, redisOptions) 
  : new Redis(redisOptions);

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

// We only try connecting when used to avoid failing the app if Redis isn't immediately available
let connected = false;

export const getRedisClient = async (): Promise<Redis> => {
  if (!connected) {
    try {
      await redis.connect();
      connected = true;
    } catch (e) {
      logger.warn('Redis lazy connect failed, will retry on next command.');
    }
  }
  return redis;
};

export default redis;
