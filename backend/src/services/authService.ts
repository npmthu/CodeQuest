import { supabaseAdmin } from '../config/database';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  const { email, password, fullName, role = 'learner' } = payload;

  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role
    }
  });

  if (authError) throw authError;

  // Create user profile in users table
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .insert([
      {
        id: authData.user.id,
        email,
        display_name: fullName || email.split('@')[0],
        role,
        level: 'Beginner',
        reputation: 0,
        is_active: true
      }
    ])
    .select()
    .single();

  if (userError) throw userError;

  return { user: authData.user, profile: userData };
}

export async function loginUser(payload: LoginPayload) {
  const { email, password } = payload;

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Fetch user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) throw profileError;

  return {
    session: data.session,
    user: data.user,
    profile
  };
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
