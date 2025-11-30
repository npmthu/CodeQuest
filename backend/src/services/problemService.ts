import { supabaseAdmin } from '../config/database';
import type { Problem } from '../models/Problem';

export async function listProblems(limit = 50, publishedOnly = true) {
  let q = supabaseAdmin.from('problems').select('*').limit(limit);
  if (publishedOnly) q = q.eq('is_published', true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getProblem(id: string) {
  const { data, error } = await supabaseAdmin.from('problems').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createProblem(payload: Partial<Problem>) {
  const { data, error } = await supabaseAdmin.from('problems').insert([payload]).select().single();
  if (error) throw error;
  return data as Problem;
}

export async function updateProblem(id: string, patch: Partial<Problem>) {
  const { data, error } = await supabaseAdmin.from('problems').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Problem;
}