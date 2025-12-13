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

// DTOs
export interface CreateNoteDTO {
  user_id: string;
  title?: string;
  content_markdown?: string;
  is_private?: boolean;
  tags?: string[];
}

export interface UpdateNoteDTO {
  title?: string;
  content_markdown?: string;
  is_private?: boolean;
  tags?: string[];
}
