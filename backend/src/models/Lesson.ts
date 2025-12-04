// Lesson model - theory lessons and content
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

export interface LessonWithProgress extends Lesson {
  is_completed?: boolean;
}
