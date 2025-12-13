// Frontend Problem Interfaces - Mirror của backend DTOs

export interface Problem {
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

export interface ProblemDetail extends Problem {
  editorialMarkdown?: string;
  sampleTestCases?: TestCase[];
}

export interface ProblemListItem {
  id: string;
  slug: string;
  title: string;
  difficulty: number;
  isPremium: boolean;
  acceptanceRate?: number;
  userSolved?: boolean;
}

export interface TestCase {
  id: string;
  name?: string;
  input?: string;
  expectedOutput?: string;
  isSample: boolean;
}
