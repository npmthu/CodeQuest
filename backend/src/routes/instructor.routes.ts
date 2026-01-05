import { Router } from 'express';
import { supabaseAuth } from '../middleware/auth';
import {
  getInstructorStats,
  getInstructorCourses,
  getInstructorAnalytics,
  getInstructorActivities,
  getInstructorProblems,
  getInstructorProblemDetail
} from '../controllers/instructorController';

const router = Router();

// All instructor routes require authentication
router.use(supabaseAuth);

// Instructor dashboard endpoints
router.get('/stats', getInstructorStats);
router.get('/courses', getInstructorCourses);
router.get('/analytics', getInstructorAnalytics);
router.get('/activities', getInstructorActivities);

// Instructor problem management
router.get('/problems', getInstructorProblems);
router.get('/problems/:id', getInstructorProblemDetail);

export default router;
