// Topic model - programming topics and categories

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  parent_topic_id?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  course_id?: string;
}
