import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import codeQueue from '../queues/codeQueue.js';
import Execution from '../models/Execution.js';

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'c', 'cpp', 'java'];
const MAX_CODE_LENGTH = 50000;
const EXECUTOR_URL = process.env.EXECUTOR_URL;

// Cached executor health check (cache for 5 seconds)
let cachedHealth = { online: true, checkedAt: 0 };
const HEALTH_CACHE_TTL_MS = 5000;

async function isExecutorOnline() {
  if (!EXECUTOR_URL) {
    // If no remote executor URL is specified, assume local worker is handling queue
    return true;
  }

  const now = Date.now();
  if (now - cachedHealth.checkedAt < HEALTH_CACHE_TTL_MS) {
    return cachedHealth.online;
  }

  try {
    const response = await fetch(`${EXECUTOR_URL.replace(/\/+$/, '')}/health`, {
      signal: AbortSignal.timeout(4000)
    });
    cachedHealth = { online: response.ok, checkedAt: now };
    return cachedHealth.online;
  } catch (err) {
    cachedHealth = { online: false, checkedAt: now };
    return false;
  }
}

// POST /api/execute
export const executeCode = async (req, res) => {
  try {
    const { language, code, stdin = '', fileId } = req.body;

    if (!language || typeof code !== 'string') {
      return res.status(400).json({ 
        error: 'language and code are required' 
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User is not authenticated'
      });
    }

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`
      });
    }

    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({ 
        error: 'Code too long (max 50KB)' 
      });
    }

    // Check if executor is online before queuing
    const executorOnline = await isExecutorOnline();
    if (!executorOnline) {
      return res.status(503).json({
        success: false,
        error: 'Code execution service is currently unavailable.',
        message: 'The execution engine is offline',
        executorOnline: false
      });
    }

    const jobId = uuidv4();
    const validFileId = fileId && mongoose.Types.ObjectId.isValid(fileId) ? fileId : null;

    await Execution.create({
      jobId,
      language,
      code,
      stdin,
      user: userId,
      file: validFileId
    });

    await codeQueue.add('run-code', { jobId, language, code, stdin });

    return res.status(202).json({
      jobId,
      status: 'queued',
      executorOnline: true,
      message: 'Code submitted. Poll /api/status/:jobId for result.'
    });

  } catch (err) {
    console.error('[API] Execute error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/status/:jobId
export const getStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const execution = await Execution.findOne({ jobId });

    if (!execution) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Ensure the user requesting status owns this execution
    if (req.user && execution.user && !execution.user.equals(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized access to execution' });
    }

    if (execution.status === 'queued' || execution.status === 'running') {
      return res.json({ jobId, status: execution.status });
    }

    return res.json({
      jobId,
      status: execution.status,
      stdout: execution.stdout,
      stderr: execution.stderr,
      exitCode: execution.exitCode,
      executionTime: execution.executionTime,
      language: execution.language
    });

  } catch (err) {
    console.error('[API] Status error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/history (scoped to current authenticated user)
export const getHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const history = await Execution.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-code');
    return res.json(history);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/executor/health
export const getExecutorHealth = async (req, res) => {
  const online = await isExecutorOnline();
  return res.json({
    executorOnline: online,
    message: online 
      ? 'Code execution available' 
      : 'Code execution unavailable'
  });
};