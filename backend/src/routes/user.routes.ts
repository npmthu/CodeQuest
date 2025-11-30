import express from 'express';
import { listUsers, getUserHandler, getUserStatsHandler } from '../controllers/userController';
import { supabaseAuth } from '../middleware/auth';

const router = express.Router();

router.get('/', listUsers);
router.get('/:id', getUserHandler);
router.get('/me/stats', supabaseAuth, getUserStatsHandler);

export default router;