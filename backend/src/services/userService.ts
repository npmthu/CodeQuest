import { supabaseAdmin } from '../config/database';
import type { User, UserLearningProfile, UpdateUserPayload } from '../models/User';

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

export async function updateUser(id: string, patch: UpdateUserPayload) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      ...patch,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as User;
}

export async function getUserLearningProfile(userId: string): Promise<UserLearningProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('user_learning_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function getUserStats(userId: string) {
  // Get user profile
  const user = await getUser(userId);
  if (!user) throw new Error('User not found');

  // Get submission stats
  const { data: submissions } = await supabaseAdmin
    .from('submissions')
    .select('id, status, passed')
    .eq('user_id', userId);

  const totalSubmissions = submissions?.length || 0;
  const acceptedSubmissions = submissions?.filter(s => s.passed).length || 0;

  // Get unique problems solved
  const { data: solvedProblems } = await supabaseAdmin
    .from('submissions')
    .select('problem_id')
    .eq('user_id', userId)
    .eq('passed', true);

  const uniqueProblemsSolved = new Set(solvedProblems?.map(s => s.problem_id) || []).size;

  // Get lessons completed
  const { count: lessonsCompleted } = await supabaseAdmin
    .from('lesson_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get quiz attempts
  const { data: quizzes } = await supabaseAdmin
    .from('quiz_attempts')
    .select('id, passed')
    .eq('user_id', userId)
    .eq('passed', true);

  // Get learning profile for streaks
  const profile = await getUserLearningProfile(userId);

  // Recent activity (last 10 submissions)
  const { data: recentActivity } = await supabaseAdmin
    .from('submissions')
    .select(`
      id, 
      status, 
      submitted_at,
      problems (
        title,
        slug
      )
    `)
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(10);

  return {
    totalSubmissions,
    acceptedSubmissions,
    problemsSolved: uniqueProblemsSolved,
    lessonsCompleted: lessonsCompleted || 0,
    quizzesPassed: quizzes?.length || 0,
    currentStreak: profile?.current_streak_days || 0,
    longestStreak: profile?.longest_streak_days || 0,
    level: user.level || 'Beginner',
    reputation: user.reputation || 0,
    recentActivity: recentActivity || []
  };
}