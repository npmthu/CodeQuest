import { supabaseAdmin } from '../config/database';
import type { Language } from '../models/Language';

export async function listLanguages() {
  const { data, error } = await supabaseAdmin.from<'languages', Language>('languages').select('*');
  if (error) throw error;
  return data ?? [];
}