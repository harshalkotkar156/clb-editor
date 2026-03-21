import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getAllFiles,
  createFile,
  getFileById,
  updateFile,
  deleteFile,
  getFileExecutions
} from '../controller/fileController.js';

const router = express.Router();

// apply auth middleware to all routes
router.use(authMiddleware);

// routes
router.get('/', getAllFiles);
router.post('/', createFile);
router.get('/:id', getFileById);
router.put('/:id', updateFile);
router.delete('/:id', deleteFile);
router.get('/:id/executions', getFileExecutions);

export default router;