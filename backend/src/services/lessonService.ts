import { supabaseAdmin } from '../config/database';
import type { Lesson } from '../models/Lesson'

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
    .from('lesson_completions')
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
  updates: { time_spent_sec?: number; completed_at?: string }
) {
  const existing = await getUserLessonProgress(userId, lessonId);

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('lesson_completions')
      .update(updates)
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('lesson_completions')
      .insert([
        {
          user_id: userId,
          lesson_id: lessonId,
          ...updates,
          completed_at: updates.completed_at || new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function getUserProgressSummary(userId: string) {
  // Get all lesson completions
  const { data, error } = await supabaseAdmin
    .from('lesson_completions')
    .select('*, lessons(id, title, topic_id, topics(name))')
    .eq('user_id', userId);

  if (error) throw error;

  const completed = data?.length || 0;
  const total = completed; // Total tracked is the same as completed in this table

  return {
    total,
    completed,
    inProgress: 0, // lesson_completions only tracks completed lessons
    lessons: data ?? []
  };
}
