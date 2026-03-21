import express from 'express';
const router = express.Router();

import { executeCode,getStatus,getHistory } from '../controller/execute.js';
import authMiddleware from '../middleware/authMiddleware.js';
// POST /api/execute — submit code for execution
router.post('/execute',authMiddleware,executeCode);
router.get('/status/:jobId',authMiddleware,getStatus);
router.get('/history',authMiddleware,getHistory);



export default router;
