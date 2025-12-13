// Problem Mappers - Convert DB models sang DTOs

import { Problem } from '../models/Problem';
import { TestCase } from '../models/TestCase';
import { 
  ProblemDTO, 
  ProblemDetailDTO, 
  ProblemSummaryDTO,
  ProblemListItemDTO,
  TestCaseDTO
} from '../dtos/problem.dto';

export function mapProblemToDTO(problem: Problem): ProblemDTO {
  return {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    descriptionMarkdown: problem.description_markdown,
    difficulty: problem.difficulty,
    timeLimitMs: problem.time_limit_ms || 2000,
    memoryLimitKb: problem.memory_limit_kb || 65536,
    inputFormat: problem.input_format,
    outputFormat: problem.output_format,
    constraints: problem.constraints,
    isPublished: problem.is_published || false,
    isPremium: problem.is_premium || false,
    acceptanceRate: problem.acceptance_rate,
    totalSubmissions: problem.total_submissions || 0,
    totalAccepted: problem.total_accepted || 0,
    createdAt: problem.created_at
  };
}

export function mapProblemToDetailDTO(problem: Problem, sampleTestCases?: TestCase[]): ProblemDetailDTO {
  return {
    ...mapProblemToDTO(problem),
    editorialMarkdown: problem.editorial_markdown,
    sampleTestCases: sampleTestCases?.map(mapTestCaseToDTO)
  };
}

export function mapProblemToSummaryDTO(problem: Problem): ProblemSummaryDTO {
  return {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    acceptanceRate: problem.acceptance_rate
  };
}

export function mapProblemToListItemDTO(problem: Problem, userSolved?: boolean): ProblemListItemDTO {
  return {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    isPremium: problem.is_premium || false,
    acceptanceRate: problem.acceptance_rate,
    userSolved
  };
}

export function mapTestCaseToDTO(testCase: TestCase): TestCaseDTO {
  return {
    id: testCase.id,
    name: testCase.name,
    // input and expectedOutput chỉ trả về nếu là sample (đã decrypt)
    input: testCase.is_sample ? testCase.input_encrypted : undefined,
    expectedOutput: testCase.is_sample ? testCase.expected_output_encrypted : undefined,
    isSample: testCase.is_sample || false
  };
}
