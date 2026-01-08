// Lesson model - theory lessons and content
export interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  content_markdown: string;
  difficulty?: string;
  estimated_time_min?: number;
  display_order?: number;
  created_by?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  course_id?: string;
}

export interface LessonWithProgress extends Lesson {
  is_completed?: boolean;
}

export interface LessonCompletion {
  user_id: string;
  lesson_id: string;
  time_spent_sec?: number;
  completed_at?: string;
}
