// Topic DTOs - Contract giữa backend và frontend

export interface TopicDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  displayOrder: number;
  parentTopicId?: string;
  courseId?: string;
}

export interface TopicWithLessonsDTO extends TopicDTO {
  lessons: LessonSummaryDTO[];
  lessonCount: number;
}

export interface LessonSummaryDTO {
  id: string;
  title: string;
  slug: string;
  difficulty?: string;
  estimatedTimeMin?: number;
  displayOrder: number;
}

export interface CreateTopicDTO {
  name: string;
  slug: string;
  description?: string;
  parentTopicId?: string;
  courseId?: string;
}
