/**
 * AI routes - /api/ai/*
 */
import { Router } from 'express';
import aiController from '../controllers/aiController';
import { supabaseAuth } from '../middleware/auth';

const router = Router();

// All AI routes require authentication
router.use(supabaseAuth);

// Code review endpoints
router.post('/code-review', aiController.reviewCode);
router.get('/code-review/:submissionId', aiController.getCodeReview);

// Notebook assistant endpoint
router.post('/notebook-assist', aiController.notebookAssist);

// Notebook AI features
router.post('/summary', aiController.generateSummary);
router.post('/mindmap', aiController.generateMindmap);

export default router;
