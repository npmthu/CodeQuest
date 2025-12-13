// Note model - personal notes for users

export interface Note {
  id: string;
  user_id: string;
  title?: string; // Optional in DB
  content_markdown?: string;
  is_private: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

