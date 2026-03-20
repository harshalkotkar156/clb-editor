import { Queue } from 'bullmq';
import redis from '../config/redis.js';

const codeQueue = new Queue('code-execution', {
  connection: redis,
  defaultJobOptions: {
    attempts: 1,          // don't retry failed code — it failed for a reason
    removeOnComplete: {
      age: 3600           // keep completed jobs in Redis for 1 hour
    },
    removeOnFail: {
      age: 3600
    }
  }
});

export default codeQueue;