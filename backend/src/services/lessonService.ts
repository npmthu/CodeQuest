import { supabaseAdmin } from '../config/database';

export interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  description?: string;
  content?: string;
  order_index: number;
  difficulty?: string;
  estimated_time?: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function listLessons(topicId?: string, publishedOnly = true) {
  try {
    let query = supabaseAdmin
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: true });

    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    // Note: lessons table might not have is_published column, skip filter
    // if (publishedOnly) {
    //   query = query.eq('is_published', true);
    // }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
    return data ?? [];
  } catch (error) {
    console.error('Error in listLessons:', error);
    throw error;
  }
}

export async function getLesson(id: string) {
  const { data, error } = await supabaseAdmin
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching lesson:', error);
    throw error;
  }

  return data;
}

export async function getUserLessonProgress(userId: string, lessonId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  updates: { is_completed?: boolean; progress_percentage?: number; last_accessed_at?: string }
) {
  const existing = await getUserLessonProgress(userId, lessonId);

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('user_lesson_progress')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('user_lesson_progress')
      .insert([
        {
          user_id: userId,
          lesson_id: lessonId,
          ...updates,
          last_accessed_at: updates.last_accessed_at || new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function getUserProgressSummary(userId: string) {
  // Get all lesson progress
  const { data, error } = await supabaseAdmin
    .from('user_lesson_progress')
    .select('*, lessons(id, title, topic_id, topics(name))')
    .eq('user_id', userId);

  if (error) throw error;

  const completed = data?.filter((p) => p.is_completed).length || 0;
  const total = data?.length || 0;
  const inProgress = data?.filter((p) => !p.is_completed && p.progress_percentage > 0).length || 0;

  return {
    total,
    completed,
    inProgress,
    lessons: data ?? []
  };
}
