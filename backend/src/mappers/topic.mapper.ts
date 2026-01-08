// Topic Mappers - Convert DB models sang DTOs

import { Topic } from '../models/Topic';
import { Lesson } from '../models/Lesson';
import { TopicDTO, TopicWithLessonsDTO } from '../dtos/topic.dto';
import { mapLessonToSummaryDTO } from './lesson.mapper';

export function mapTopicToDTO(topic: Topic): TopicDTO {
  return {
    id: topic.id,
    name: topic.name,
    slug: topic.slug,
    description: topic.description,
    iconUrl: topic.icon_url,
    displayOrder: topic.display_order || 0,
    parentTopicId: topic.parent_topic_id,
    courseId: topic.course_id
  };
}

export function mapTopicWithLessonsToDTO(topic: Topic, lessons: Lesson[]): TopicWithLessonsDTO {
  return {
    ...mapTopicToDTO(topic),
    lessons: lessons.map(mapLessonToSummaryDTO),
    lessonCount: lessons.length
  };
}
