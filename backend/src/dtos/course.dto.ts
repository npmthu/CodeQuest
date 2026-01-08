// Course DTOs - Contract giữa backend và frontend

export interface CourseDTO {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  difficulty?: string;
  isPublished: boolean;
  createdAt?: string;
}

export interface CourseWithTopicsDTO extends CourseDTO {
  topics: TopicSummaryDTO[];
  topicCount: number;
}

export interface TopicSummaryDTO {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}
