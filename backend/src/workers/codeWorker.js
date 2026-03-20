import 'dotenv/config';
import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import connectDB from '../config/db.js';
import Execution from '../models/Execution.js';
import { runCode } from '../sandbox/runner.js';

await connectDB();

console.log('Worker started, waiting for jobs...');

const worker = new Worker('code-execution', async (job) => {
  const { jobId, language, code, stdin } = job.data;

  console.log(`[Worker] Picked up job ${jobId} — ${language}`);

  // mark as running in MongoDB
  await Execution.findOneAndUpdate(
    { jobId },
    { status: 'running' }
  );

  // run the code in docker sandbox
  const result = await runCode({ language, code, stdin });

  // save result to MongoDB
  await Execution.findOneAndUpdate(
    { jobId },
    {
      status: result.exitCode === 0 ? 'completed' : 'failed',
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      executionTime: result.executionTime,
      completedAt: new Date()
    }
  );

  console.log(`[Worker] Job ${jobId} done in ${result.executionTime}ms`);

  return result;

}, {
  connection: redis,
  concurrency: 5  // process 5 jobs simultaneously — handles 25-30 users easily
});

// event listeners
worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed:`, err.message);

  // mark as failed in MongoDB even if worker itself crashed
  Execution.findOneAndUpdate(
    { jobId: job.data.jobId },
    { 
      status: 'failed',
      stderr: err.message,
      completedAt: new Date()
    }
  ).catch(console.error);
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});