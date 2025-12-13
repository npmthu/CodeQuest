// Problem DTOs - Contract giữa backend và frontend

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
  createdAt?: string;
}

export interface ProblemDetailDTO extends ProblemDTO {
  editorialMarkdown?: string;
  sampleTestCases?: TestCaseDTO[];
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
  userSolved?: boolean;
}

export interface TestCaseDTO {
  id: string;
  name?: string;
  input?: string; // Decrypted for sample cases
  expectedOutput?: string; // Decrypted for sample cases
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
