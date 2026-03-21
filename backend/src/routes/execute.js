import express from 'express';
const router = express.Router();

import { executeCode,getStatus,getHistory } from '../controller/execute.js';

// POST /api/execute — submit code for execution
router.post('/execute',executeCode);
router.get('/status/:jobId',getStatus);
router.get('/history',getHistory);



export default router;
