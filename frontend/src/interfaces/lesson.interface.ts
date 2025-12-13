// Frontend Lesson Interfaces - Mirror của backend DTOs

export interface Lesson {
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

export interface LessonWithProgress extends Lesson {
  isCompleted?: boolean;
  timeSpentSec?: number;
  completedAt?: string;
}

export interface UpdateLessonProgressRequest {
  timeSpentSec?: number;
  completed?: boolean;
}
