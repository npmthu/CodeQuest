import express from 'express';
import { meHandler, logoutHandler } from '../controllers/authController';
import { supabaseAuth } from '../middleware/auth';

const router = express.Router();

// public routes (if you want register/login handled via Supabase client, keep these server-light)
// server-side we usually expose /auth/me to validate token
router.get('/me', supabaseAuth, meHandler);
router.post('/logout', supabaseAuth, logoutHandler);

export default router;
