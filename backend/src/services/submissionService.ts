import { supabaseAdmin } from '../config/database';
import type { Submission } from '../models/Submission';

export async function createSubmission(payload: Partial<Submission>) {
  const { data, error } = await supabaseAdmin.from('submissions').insert([payload]).select().single();
  if (error) throw error;
  return data as Submission;
}

export async function updateSubmission(id: string, patch: Partial<Submission>) {
  const { data, error } = await supabaseAdmin.from('submissions').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Submission;
}

export async function getSubmission(id: string) {
  const { data, error } = await supabaseAdmin.from('submissions').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}