// Course Mappers - Convert DB models sang DTOs

import { Course } from '../models/Course';
import { Topic } from '../models/Topic';
import { CourseDTO, CourseWithTopicsDTO } from '../dtos/course.dto';
import { mapTopicToDTO } from './topic.mapper';

export function mapCourseToDTO(course: Course): CourseDTO {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    thumbnailUrl: course.thumbnail_url,
    difficulty: course.difficulty,
    isPublished: course.is_published || false,
    createdAt: course.created_at
  };
}

export function mapCourseWithTopicsToDTO(course: Course, topics: Topic[]): CourseWithTopicsDTO {
  return {
    ...mapCourseToDTO(course),
    topics: topics.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      displayOrder: t.display_order || 0
    })),
    topicCount: topics.length
  };
}
