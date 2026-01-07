// Frontend Problem Interfaces - Mirror của backend DTOs

import { Hint, TestCase } from "./testcase.interface";

// Problem IO structures
export interface IOParameter {
  name: string;
  type: string;
  element_type?: string;
  constraints?: Record<string, any>;
}

export interface IOInput {
  style: 'function';
  params: IOParameter[];
}

export interface IOOutput {
  type: string;
  element_type?: string;
  constraints?: Record<string, any>;
  comparator?: string;
}

export interface ProblemIO {
  input: IOInput;
  output: IOOutput;
}

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
  topicId?: string;
  createdAt?: string;
  // Additional fields for CodeEditor
  problemIO?: ProblemIO;
  starterCode?: { [key: string]: string }; // { "python": "...", "javascript": "..." }
  sampleTestCases?: TestCase[];
  hints?: Hint[];
  tags?: string[];
  hint?: string;
}


export interface ProblemDetail extends Problem {
  editorialMarkdown?: string;
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

export interface ProblemSummary {
  id: string;
  slug: string;
  title: string;
  difficulty: number;
}
