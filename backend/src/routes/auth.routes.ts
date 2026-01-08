import express from 'express';
import { registerHandler, loginHandler, meHandler, logoutHandler } from '../controllers/authController';
import { supabaseAuth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', registerHandler);
router.post('/login', loginHandler);

// Protected routes
router.get('/me', supabaseAuth, meHandler);
router.post('/logout', supabaseAuth, logoutHandler);

export default router;
