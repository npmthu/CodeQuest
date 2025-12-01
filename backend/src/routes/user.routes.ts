import express from 'express';
import { 
  listUsers, 
  getUserHandler, 
  updateUserHandler,
  getUserStatsHandler,
  getLearningProfileHandler
} from '../controllers/userController';
import { supabaseAuth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', listUsers);
router.get('/:id', getUserHandler);

// Protected routes
router.patch('/me', supabaseAuth, updateUserHandler);
router.get('/me/stats', supabaseAuth, getUserStatsHandler);
router.get('/me/learning-profile', supabaseAuth, getLearningProfileHandler);

export default router;