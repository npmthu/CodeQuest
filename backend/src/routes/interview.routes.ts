import { Router } from 'express';
import { supabaseAuth } from '../middleware/auth';
import {
  listInterviewSessions,
  getInterviewSession,
  createInterviewSession,
  updateInterviewSession,
  submitInterviewFeedback,
  getAvailableInterviewers
} from '../controllers/interviewController';

const router = Router();

router.get('/sessions', supabaseAuth, listInterviewSessions);
router.get('/sessions/:id', supabaseAuth, getInterviewSession);
router.post('/sessions', supabaseAuth, createInterviewSession);
router.patch('/sessions/:id', supabaseAuth, updateInterviewSession);
router.post('/sessions/:id/feedback', supabaseAuth, submitInterviewFeedback);
router.get('/available-interviewers', supabaseAuth, getAvailableInterviewers);

export default router;
