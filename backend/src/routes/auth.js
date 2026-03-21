import express from 'express';
import {
  googleAuth,
  googleAuthCallback,
  getCurrentUser,
  logoutUser
} from '../controller/auth.js';

const router = express.Router();

router.get('/google', googleAuth);

router.get('/google/callback', googleAuthCallback);

router.get('/me', getCurrentUser);

router.post('/logout', logoutUser);

export default router;