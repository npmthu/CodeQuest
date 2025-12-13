// Note DTOs - Contract giữa backend và frontend

export interface NoteDTO {
  id: string;
  userId: string;
  title?: string;
  contentMarkdown?: string;
  isPrivate: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDTO {
  title?: string;
  contentMarkdown?: string;
  isPrivate?: boolean;
  tags?: string[];
}

export interface UpdateNoteDTO {
  title?: string;
  contentMarkdown?: string;
  isPrivate?: boolean;
  tags?: string[];
}
