import { Router } from 'express';
import { supabaseAuth } from '../middleware/auth';
import {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/notesController';

const router = Router();

// All notes routes require authentication
router.get('/', supabaseAuth, listNotes);
router.get('/:id', supabaseAuth, getNote);
router.post('/', supabaseAuth, createNote);
router.patch('/:id', supabaseAuth, updateNote);
router.delete('/:id', supabaseAuth, deleteNote);

export default router;
