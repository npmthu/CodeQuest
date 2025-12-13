// Lesson Mappers - Convert DB models sang DTOs

import { Lesson, LessonCompletion } from '../models/Lesson';
import { 
  LessonDTO, 
  LessonSummaryDTO,
  LessonWithProgressDTO,
  LessonCompletionDTO
} from '../dtos/lesson.dto';

export function mapLessonToDTO(lesson: Lesson): LessonDTO {
  return {
    id: lesson.id,
    topicId: lesson.topic_id,
    title: lesson.title,
    slug: lesson.slug,
    contentMarkdown: lesson.content_markdown,
    difficulty: lesson.difficulty,
    estimatedTimeMin: lesson.estimated_time_min,
    displayOrder: lesson.display_order || 0,
    isPublished: lesson.is_published || false,
    createdAt: lesson.created_at
  };
}

export function mapLessonToSummaryDTO(lesson: Lesson): LessonSummaryDTO {
  return {
    id: lesson.id,
    title: lesson.title,
    slug: lesson.slug,
    difficulty: lesson.difficulty,
    estimatedTimeMin: lesson.estimated_time_min,
    displayOrder: lesson.display_order || 0
  };
}

export function mapLessonWithProgressToDTO(
  lesson: Lesson, 
  completion?: LessonCompletion
): LessonWithProgressDTO {
  return {
    ...mapLessonToDTO(lesson),
    isCompleted: !!completion,
    timeSpentSec: completion?.time_spent_sec,
    completedAt: completion?.completed_at
  };
}

export function mapCompletionToDTO(completion: LessonCompletion): LessonCompletionDTO {
  return {
    userId: completion.user_id,
    lessonId: completion.lesson_id,
    timeSpentSec: completion.time_spent_sec || 0,
    completedAt: completion.completed_at || new Date().toISOString()
  };
}
