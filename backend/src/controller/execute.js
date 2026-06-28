// import { v4 as uuidv4 } from 'uuid';
// import codeQueue from '../queues/codeQueue.js';
// import Execution from '../models/Execution.js';

// const SUPPORTED_LANGUAGES = ['python', 'javascript', 'c', 'cpp', 'java'];
// const MAX_CODE_LENGTH = 50000;

// // POST /api/execute
// export const executeCode = async (req, res) => {
//   try {
//     const { language, code, stdin = '' } = req.body;
  
//     if (!language || !code) {
//       return res.status(400).json({ error: 'language and code are required' });
//     }
//     const userId = req.user._id;
//     if(!userId){
//       return res.status(400).json({
//           success:false,
//           message : "User is not added"
//       });
//     }


//     if (!SUPPORTED_LANGUAGES.includes(language)) {
//       return res.status(400).json({
//         error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`
//       });
//     }

//     if (code.length > MAX_CODE_LENGTH) {
//       return res.status(400).json({ error: 'Code too long (max 50KB)' });
//     }

//     const jobId = uuidv4();
    

//     await Execution.create({ jobId, language, code, stdin,user:userId });
    
//     await codeQueue.add('run-code', { jobId, language, code, stdin });

//     // console.log(`[API] Job ${jobId} queued — ${language}`);
    
//     return res.status(202).json({
//       jobId,
//       status: 'queued',
//       message: 'Code submitted. Poll /api/status/:jobId for result.'
//     });

//   } catch (err) {
//     console.error('[API] Execute error:', err.message);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // GET /api/status/:jobId
// export const getStatus = async (req, res) => {
//   try {
//     const { jobId } = req.params;

//     const execution = await Execution.findOne({ jobId });

//     if (!execution) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     if (execution.status === 'queued' || execution.status === 'running') {
//       return res.json({ jobId, status: execution.status });
//     }

//     return res.json({
//       jobId,
//       status: execution.status,
//       stdout: execution.stdout,
//       stderr: execution.stderr,
//       exitCode: execution.exitCode,
//       executionTime: execution.executionTime,
//       language: execution.language
//     });

//   } catch (err) {
//     console.error('[API] Status error:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // GET /api/history
// export const getHistory = async (req, res) => {
//   try {
//     const history = await Execution.find()
//       .sort({ createdAt: -1 })
//       .limit(20)
//       .select('-code');

//     return res.json(history);
//   } catch (err) {
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };


import { v4 as uuidv4 } from 'uuid';
import codeQueue from '../queues/codeQueue.js';
import Execution from '../models/Execution.js';

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'c', 'cpp', 'java'];
const MAX_CODE_LENGTH = 50000;
const EXECUTOR_URL = process.env.EXECUTOR_URL;

// Check if executor VM is online
async function isExecutorOnline() {
  try {
    const response = await fetch(`${EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(3000)  // 3 second timeout
    });
    return response.ok;
  } catch {
    return false;  // VM is off or unreachable
  }
}

// POST /api/execute
export const executeCode = async (req, res) => {
  try {
    const { language, code, stdin = '' } = req.body;

    if (!language || !code) {
      return res.status(400).json({ 
        error: 'language and code are required' 
      });
    }

    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User is not added'
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

    // ← NEW: Check if executor is online before queuing
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
    await Execution.create({ jobId, language, code, stdin, user: userId });
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

// GET /api/status/:jobId  — no changes needed here
export const getStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const execution = await Execution.findOne({ jobId });

    if (!execution) {
      return res.status(404).json({ error: 'Job not found' });
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

// GET /api/history — no changes needed
export const getHistory = async (req, res) => {
  try {
    const history = await Execution.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-code');
    return res.json(history);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ← NEW: GET /api/executor/health
// Frontend can check if executor is online
export const getExecutorHealth = async (req, res) => {
  const online = await isExecutorOnline();
  return res.json({
    executorOnline: online,
    message: online 
      ? 'Code execution available' 
      : 'Code execution unavailable'
  });
};