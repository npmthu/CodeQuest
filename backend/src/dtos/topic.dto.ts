// Topic DTOs - Contract giữa backend và frontend

import { LessonSummaryDTO } from './lesson.dto';
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

export interface CreateTopicDTO {
  name: string;
  slug: string;
  description?: string;
  parentTopicId?: string;
  courseId?: string;
}
