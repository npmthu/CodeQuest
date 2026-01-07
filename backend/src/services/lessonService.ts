import { supabaseAdmin } from "../config/database";
import type { Lesson } from "../models/Lesson";

const slugifyLocal = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export async function listLessons(topicId?: string, publishedOnly = true) {
  try {
    let query = supabaseAdmin
      .from("lessons")
      .select("*")
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }); // Secondary sort for lessons without display_order

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

export async function createLesson(payload: {
  topic_id: string;
  title: string;
  content_markdown: string;
  difficulty?: string;
  estimated_time_min?: number;
  course_id?: string;
}) {
  if (!payload.title || !payload.topic_id || !payload.content_markdown) {
    throw new Error("title, topic_id, and content_markdown are required");
  }

  const slug = slugifyLocal(payload.title);
  const { data, error } = await supabaseAdmin
    .from("lessons")
    .insert({
      ...payload,
      slug,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLesson(lessonId: string, patch: Partial<Lesson>) {
  const updatedPatch = { ...patch } as any;
  if ((patch as any).title) {
    updatedPatch.slug = slugifyLocal((patch as any).title);
  }
  const { data, error } = await supabaseAdmin
    .from("lessons")
    .update(updatedPatch)
    .eq("id", lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLesson(lessonId: string) {
  const { error } = await supabaseAdmin
    .from("lessons")
    .delete()
    .eq("id", lessonId);
  if (error) throw error;
  return true;
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

export async function getCurrentLessonForUser(
  userId: string,
  topicId?: string
) {
  const lessons = await listLessons(topicId, false);
  if (!lessons.length) return null;

  const lessonIds = lessons.map((l) => l.id);
  const progressMap = await getUserLessonsProgress(userId, lessonIds);

  // Prefer first incomplete lesson; fallback to first lesson
  const firstIncomplete = lessons.find((lesson) => {
    const progress = progressMap.get(lesson.id);
    return !progress || !progress.completed_at;
  });

  return firstIncomplete || lessons[0];
}

/**
 * Get completion stats for a course (aggregate by topics)
 */
export async function getCourseCompletionStats(
  userId: string,
  courseId: string
) {
  // First, get all topics for this course
  const { data: topics, error: topicsError } = await supabaseAdmin
    .from("topics")
    .select("id")
    .eq("course_id", courseId);

  if (topicsError) throw topicsError;

  const topicIds = (topics || []).map((t) => t.id);

  // If no topics, return empty stats
  if (!topicIds.length) {
    return {
      totalLessons: 0,
      completedLessons: 0,
      progressPercent: 0,
      topicStats: {},
    };
  }

  // Get all published lessons for these topics
  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from("lessons")
    .select("id, topic_id")
    .in("topic_id", topicIds)
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
