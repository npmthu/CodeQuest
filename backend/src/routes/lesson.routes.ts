import express from 'express';
import { 
  listLessonsHandler, 
  getLessonHandler, 
  updateProgressHandler,
  getUserProgressHandler 
} from '../controllers/lessonController';
import { supabaseAuth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', listLessonsHandler);
router.get('/:id', getLessonHandler);

// Protected routes
router.post('/:lessonId/progress', supabaseAuth, updateProgressHandler);
router.get('/user/progress', supabaseAuth, getUserProgressHandler);

export default router;
