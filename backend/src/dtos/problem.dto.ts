// Problem DTOs - Contract giữa backend và frontend

// Problem IO structures
export interface IOParameterDTO {
  name: string;
  type: string;
  element_type?: string;
  constraints?: Record<string, any>;
}

export interface IOInputDTO {
  style: 'function';
  params: IOParameterDTO[];
}

export interface IOOutputDTO {
  type: string;
  element_type?: string;
  constraints?: Record<string, any>;
  comparator?: string;
}

export interface ProblemIODTO {
  input: IOInputDTO;
  output: IOOutputDTO;
}

export interface ProblemDTO {
  id: string;
  slug: string;
  title: string;
  descriptionMarkdown: string;
  difficulty: number;
  timeLimitMs: number;
  memoryLimitKb: number;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  isPublished: boolean;
  isPremium: boolean;
  acceptanceRate?: number;
  totalSubmissions: number;
  totalAccepted: number;
  topicId?: string;
  createdAt?: string;
  hint?: string;
}

export interface ProblemDetailDTO extends ProblemDTO {
  editorialMarkdown?: string;
  sampleTestCases?: TestCaseDTO[];
  problemIO?: ProblemIODTO;
}

export interface ProblemSummaryDTO {
  id: string;
  slug: string;
  title: string;
  difficulty: number;
  acceptanceRate?: number;
}

export interface ProblemListItemDTO {
  id: string;
  slug: string;
  title: string;
  difficulty: number;
  isPremium: boolean;
  acceptanceRate?: number;
  topicId?: string;
  userSolved?: boolean;
}

export interface TestCaseDTO {
  id: string;
  name?: string;
  input?: any; // JSONB object for sample cases
  expectedOutput?: any; // JSONB object for sample cases
  isSample: boolean;
}

export interface CreateProblemDTO {
  slug: string;
  title: string;
  descriptionMarkdown: string;
  difficulty: number;
  timeLimitMs?: number;
  memoryLimitKb?: number;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
}

export interface UpdateProblemDTO {
  title?: string;
  descriptionMarkdown?: string;
  difficulty?: number;
  editorialMarkdown?: string;
  isPublished?: boolean;
}
