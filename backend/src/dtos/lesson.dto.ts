// Lesson DTOs - Contract giữa backend và frontend

export interface LessonDTO {
  id: string;
  topicId: string;
  title: string;
  slug: string;
  contentMarkdown: string;
  difficulty?: string;
  estimatedTimeMin?: number;
  displayOrder: number;
  isPublished: boolean;
  createdAt?: string;
}

export interface LessonSummaryDTO {
  id: string;
  title: string;
  slug: string;
  difficulty?: string;
  estimatedTimeMin?: number;
  displayOrder: number;
}

export interface LessonWithProgressDTO extends LessonDTO {
  isCompleted?: boolean;
  timeSpentSec?: number;
  completedAt?: string;
}

export interface LessonCompletionDTO {
  userId: string;
  lessonId: string;
  timeSpentSec: number;
  completedAt: string;
}

export interface UpdateLessonProgressDTO {
  timeSpentSec?: number;
  completed?: boolean;
}
