import { supabaseAdmin } from '../config/database';
import type { Note } from '../models/Note';

/**
 * List notes for a user
 */
export async function listNotes(userId: string, limit = 100): Promise<Note[]> {
  const { data: notes, error } = await supabaseAdmin
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error listing notes:', error);
    throw error;
  }

  return (notes || []) as Note[];
}

/**
 * Get single note
 */
export async function getNote(noteId: string, userId: string): Promise<Note | null> {
  const { data: note, error } = await supabaseAdmin
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error getting note:', error);
    throw error;
  }

  return note as Note;
}

/**
 * Create a new note
 */
export async function createNote(payload: Partial<Note>): Promise<Note> {
  const { data: note, error } = await supabaseAdmin
    .from('notes')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }

  return note as Note;
}

/**
 * Update a note
 */
export async function updateNote(noteId: string, userId: string, updates: Partial<Note>): Promise<Note | null> {
  const updateData: any = { 
    ...updates,
    updated_at: new Date().toISOString() 
  };

  const { data: note, error } = await supabaseAdmin
    .from('notes')
    .update(updateData)
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error updating note:', error);
    throw error;
  }

  return note as Note;
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string, userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}
