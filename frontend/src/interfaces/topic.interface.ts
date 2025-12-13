// Frontend Topic Interfaces - Mirror của backend DTOs

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  displayOrder: number;
  parentTopicId?: string;
  courseId?: string;
}

export interface TopicWithLessons extends Topic {
  lessons: LessonSummary[];
  lessonCount: number;
}

export interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  difficulty?: string;
  estimatedTimeMin?: number;
  displayOrder: number;
}
