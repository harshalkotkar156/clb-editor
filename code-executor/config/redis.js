import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null, // required by BullMQ
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

export default redis;