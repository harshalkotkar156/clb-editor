// code-executor/server.js
import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import './worker.js';   // ← starts the worker automatically

const app = express();
app.use(express.json());

// Health check — main backend pings this
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'code-executor',
    timestamp: new Date()
  });
});

await connectDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Code executor service running on port ${PORT}`);
  console.log('Worker is listening for jobs...');
});