// Submission Mappers - Convert DB models sang DTOs

import { Submission } from '../models/Submission';
import { 
  SubmissionDTO,
  SubmissionListItemDTO,
  SubmissionResultDTO,
  ExecutionSummaryDTO
} from '../dtos/submission.dto';

export function mapSubmissionToDTO(submission: Submission): SubmissionDTO {
  return {
    id: submission.id,
    problemId: submission.problem_id,
    userId: submission.user_id || '',
    languageId: submission.language_id || '',
    code: submission.code,
    status: submission.status,
    points: submission.points || 0,
    passed: submission.passed || false,
    submittedAt: submission.submitted_at || new Date().toISOString(),
    completedAt: submission.completed_at,
    executionSummary: submission.execution_summary as ExecutionSummaryDTO
  };
}

export function mapSubmissionToListItemDTO(
  submission: Submission,
  problemTitle?: string,
  languageName?: string
): SubmissionListItemDTO {
  return {
    id: submission.id,
    problemId: submission.problem_id,
    problemTitle,
    languageId: submission.language_id || '',
    languageName,
    status: submission.status,
    passed: submission.passed || false,
    submittedAt: submission.submitted_at || new Date().toISOString()
  };
}

export function mapSubmissionToResultDTO(submission: Submission): SubmissionResultDTO {
  return {
    id: submission.id,
    status: submission.status,
    passed: submission.passed || false,
    points: submission.points || 0,
    testResults: submission.execution_summary?.testResults,
    compilationOutput: submission.compilation_output
  };
}
