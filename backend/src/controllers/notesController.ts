import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as notesService from '../services/notesService';

/**
 * List user's notes
 * GET /api/notes
 */
export const listNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const notes = await notesService.listNotes(userId);
    return res.json({ success: true, data: notes });
  } catch (error: any) {
    console.error('Error listing notes:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single note
 * GET /api/notes/:id
 */
export const getNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    const note = await notesService.getNote(id, userId);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    return res.json({ success: true, data: note });
  } catch (error: any) {
    console.error('Error getting note:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create note
 * POST /api/notes
 */
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { title, content_markdown, is_private, tags } = req.body;

    const note = await notesService.createNote({
      user_id: userId,
      title,
      content_markdown,
      is_private,
      tags
    });

    return res.status(201).json({ success: true, data: note });
  } catch (error: any) {
    console.error('Error creating note:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update note
 * PATCH /api/notes/:id
 */
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { title, content_markdown, is_private, tags } = req.body;

    const note = await notesService.updateNote(id, userId, {
      title,
      content_markdown,
      is_private,
      tags
    });

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    return res.json({ success: true, data: note });
  } catch (error: any) {
    console.error('Error updating note:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete note
 * DELETE /api/notes/:id
 */
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    await notesService.deleteNote(id, userId);

    return res.json({ success: true, message: 'Note deleted' });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
