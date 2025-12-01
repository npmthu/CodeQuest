import { Router } from 'express';
import { supabaseAuth } from '../middleware/auth';
import {
  getBusinessStats,
  getBusinessLeaderboard,
  getBusinessAnalytics,
  getBusinessCohorts,
  getBusinessActivities
} from '../controllers/businessController';

const router = Router();

// All business routes require authentication
router.use(supabaseAuth);

// Business partner dashboard endpoints
router.get('/stats', getBusinessStats);
router.get('/leaderboard', getBusinessLeaderboard);
router.get('/analytics', getBusinessAnalytics);
router.get('/cohorts', getBusinessCohorts);
router.get('/activities', getBusinessActivities);

export default router;
