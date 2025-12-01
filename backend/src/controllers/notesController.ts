import { Response } from 'express';
import { supabaseAdmin } from '../config/database';
import { AuthRequest } from '../middleware/auth';

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

    const { data: notes, error } = await supabaseAdmin
      .from('notes')
      .select('id, title, content_markdown, is_private, tags, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return res.json({ success: true, data: notes || [] });
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

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Note not found' });
      }
      throw error;
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

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .insert({
        user_id: userId,
        title: title || 'Untitled Note',
        content_markdown: content_markdown || '',
        is_private: is_private !== undefined ? is_private : true,
        tags: tags || []
      })
      .select()
      .single();

    if (error) throw error;

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

    // Build update object
    const updates: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (content_markdown !== undefined) updates.content_markdown = content_markdown;
    if (is_private !== undefined) updates.is_private = is_private;
    if (tags !== undefined) updates.tags = tags;

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Note not found' });
      }
      throw error;
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

    const { error } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return res.json({ success: true, message: 'Note deleted' });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
