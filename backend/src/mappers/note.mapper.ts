// Note mappers - Convert DB models to DTOs

import type { Note } from '../models/Note';
import type { NoteDTO } from '../dtos/note.dto';

export function mapNoteToDTO(note: Note): NoteDTO {
  return {
    id: note.id,
    userId: note.user_id,
    title: note.title,
    contentMarkdown: note.content_markdown,
    isPrivate: note.is_private,
    tags: note.tags,
    createdAt: note.created_at,
    updatedAt: note.updated_at
  };
}
