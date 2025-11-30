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