import { Redis } from 'ioredis';
import { createChildLogger } from './logger';
import dotenv from 'dotenv';

dotenv.config();

const logger = createChildLogger('redis');
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
});

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
