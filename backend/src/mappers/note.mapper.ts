// Note mappers - Convert DB models to DTOs and vice versa

import type { Note } from '../models/Note';
import type { NoteDTO, CreateNoteDTO, UpdateNoteDTO } from '../dtos/note.dto';

// ============= Response Mappers (DB → DTO) =============

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

// ============= Request Mappers (DTO → DB) =============

export function mapCreateNoteDTOToEntity(dto: CreateNoteDTO, userId: string): Partial<Note> {
  return {
    user_id: userId,
    title: dto.title,
    content_markdown: dto.contentMarkdown,
    is_private: dto.isPrivate ?? true, // Default to private
    tags: dto.tags
  };
}

export function mapUpdateNoteDTOToEntity(dto: UpdateNoteDTO): Partial<Note> {
  const entity: Partial<Note> = {};
  
  if (dto.title !== undefined) entity.title = dto.title;
  if (dto.contentMarkdown !== undefined) entity.content_markdown = dto.contentMarkdown;
  if (dto.isPrivate !== undefined) entity.is_private = dto.isPrivate;
  if (dto.tags !== undefined) entity.tags = dto.tags;
  
  return entity;
}
