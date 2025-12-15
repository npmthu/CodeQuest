// Frontend Lesson Interfaces - Mirror của backend DTOs

export interface LessonMetadata {
  type?: "video" | "theory" | "interactive";
  video_url?: string;
  thumbnail?: string;
  [key: string]: any;
}

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
  metadata?: LessonMetadata;
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
