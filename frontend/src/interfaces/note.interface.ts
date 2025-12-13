// Note interfaces

export interface Note {
  id: string;
  userId: string;
  title: string;
  contentMarkdown?: string;
  contentHtml?: string;
  isPrivate: boolean;
  tags?: string[];
  problemId?: string;
  lessonId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  contentMarkdown?: string;
  isPrivate: boolean;
  tags?: string[];
  problemId?: string;
  lessonId?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  contentMarkdown?: string;
  isPrivate?: boolean;
  tags?: string[];
}
