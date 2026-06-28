import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new IORedis(process.env.REDIS_URL,{
  maxRetriesPerRequest: null, // required by BullMQ
});


redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

export default redis;