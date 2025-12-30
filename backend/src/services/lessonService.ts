import { supabaseAdmin } from "../config/database";
import type { Lesson } from "../models/Lesson";

export async function listLessons(topicId?: string, publishedOnly = true) {
  try {
    let query = supabaseAdmin
      .from("lessons")
      .select("*")
      .order("created_at", { ascending: true });

    if (topicId) {
      query = query.eq("topic_id", topicId);
    }

    // Note: lessons table might not have is_published column, skip filter
    // if (publishedOnly) {
    //   query = query.eq('is_published', true);
    // }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching lessons:", error);
      throw error;
    }
    return data ?? [];
  } catch (error) {
    console.error("Error in listLessons:", error);
    throw error;
  }
}

export async function getLesson(id: string) {
  const { data, error } = await supabaseAdmin
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching lesson:", error);
    throw error;
  }

  return data;
}

export async function getUserLessonProgress(userId: string, lessonId: string) {
  const { data, error } = await supabaseAdmin
    .from("lesson_completions")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
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
      .from("lesson_completions")
      .update(updates)
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabaseAdmin
      .from("lesson_completions")
      .insert([
        {
          user_id: userId,
          lesson_id: lessonId,
          ...updates,
          completed_at: updates.completed_at || new Date().toISOString(),
        },
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
    .from("lesson_completions")
    .select("*, lessons(id, title, topic_id, topics(name))")
    .eq("user_id", userId);

  if (error) throw error;

  const completed = data?.length || 0;
  const total = completed; // Total tracked is the same as completed in this table

  return {
    total,
    completed,
    inProgress: 0, // lesson_completions only tracks completed lessons
    lessons: data ?? [],
  };
}

/**
 * Get completion status for multiple lessons for a user
 */
export async function getUserLessonsProgress(
  userId: string,
  lessonIds: string[]
) {
  if (!lessonIds.length) return new Map<string, any>();

  const { data, error } = await supabaseAdmin
    .from("lesson_completions")
    .select("*")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  if (error) throw error;

  // Return a map of lessonId -> completion record
  const progressMap = new Map<string, any>();
  (data || []).forEach((completion) => {
    progressMap.set(completion.lesson_id, completion);
  });

  return progressMap;
}

/**
 * Get completion stats for a course (aggregate by topics)
 */
export async function getCourseCompletionStats(
  userId: string,
  courseId: string
) {
  // Get all published lessons for this course with their topic_id
  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from("lessons")
    .select("id, topic_id")
    .eq("course_id", courseId)
    .eq("is_published", true);

  if (lessonsError) throw lessonsError;

  const lessonIds = (lessons || []).map((l) => l.id);
  if (!lessonIds.length) {
    return {
      totalLessons: 0,
      completedLessons: 0,
      progressPercent: 0,
      topicStats: {},
    };
  }

  // Get completions for these lessons
  const { data: completions, error: completionsError } = await supabaseAdmin
    .from("lesson_completions")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  if (completionsError) throw completionsError;

  const completedSet = new Set((completions || []).map((c) => c.lesson_id));

  // Aggregate by topic
  const topicStats: Record<string, { total: number; completed: number }> = {};
  (lessons || []).forEach((lesson) => {
    if (!topicStats[lesson.topic_id]) {
      topicStats[lesson.topic_id] = { total: 0, completed: 0 };
    }
    topicStats[lesson.topic_id].total++;
    if (completedSet.has(lesson.id)) {
      topicStats[lesson.topic_id].completed++;
    }
  });

  const totalLessons = lessonIds.length;
  const completedLessons = completedSet.size;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    totalLessons,
    completedLessons,
    progressPercent,
    topicStats,
  };
}
