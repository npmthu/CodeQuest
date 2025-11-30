import { supabaseAdmin } from '../config/database';

export async function listTopics(publishedOnly = true) {
  let query = supabaseAdmin
    .from('topics')
    .select('*, lessons(id)')
    .order('order_index', { ascending: true });

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Count lessons for each topic
  const topics = data?.map(topic => ({
    ...topic,
    lesson_count: topic.lessons?.length || 0
  })) ?? [];

  return topics;
}

export async function getTopic(id: string) {
  const { data, error } = await supabaseAdmin
    .from('topics')
    .select('*, lessons(id, title, description, difficulty, order_index)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}
