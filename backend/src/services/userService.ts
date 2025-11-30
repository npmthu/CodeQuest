import { supabaseAdmin } from '../config/database';
import type { User } from '../models/User';

export async function listUsers(limit = 100) {
  const { data, error } = await supabaseAdmin.from('users').select('*').limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getUser(id: string) {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createUser(payload: Partial<User>) {
  const { data, error } = await supabaseAdmin.from('users').insert([payload]).select().single();
  if (error) throw error;
  return data as User;
}

export async function updateUser(id: string, patch: Partial<User>) {
  const { data, error } = await supabaseAdmin.from('users').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as User;
}

export async function getUserStats(userId: string) {
  // Get user profile
  const user = await getUser(userId);
  if (!user) throw new Error('User not found');

  // Get submission count
  const { count: submissionCount } = await supabaseAdmin
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get problems solved (accepted submissions)
  const { data: solvedProblems } = await supabaseAdmin
    .from('submissions')
    .select('problem_id')
    .eq('user_id', userId)
    .eq('status', 'accepted');

  const uniqueProblemsSolved = new Set(solvedProblems?.map(s => s.problem_id) || []).size;

  // Get lessons completed
  const { count: lessonsCompleted } = await supabaseAdmin
    .from('user_lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_completed', true);

  return {
    submissions: submissionCount || 0,
    problemsSolved: uniqueProblemsSolved,
    lessonsCompleted: lessonsCompleted || 0,
    xp: 0,
    level: user.level || 'Beginner',
    reputation: user.reputation || 0
  };
}