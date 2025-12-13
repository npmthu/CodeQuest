// Frontend Problem Interfaces - Mirror của backend DTOs

import { Hint, TestCase } from "./testcase.interface";

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
  // Additional fields for CodeEditor
  starterCode?: { [key: string]: string }; // { "python": "...", "javascript": "..." }
  sampleTestCases?: TestCase[];
  hints?: Hint[];
  tags?: string[];
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
