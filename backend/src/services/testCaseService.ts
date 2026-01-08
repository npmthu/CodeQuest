import { supabaseAdmin } from '../config/database';
import type { TestCase } from '../models/TestCase';

export async function listTestCasesByProblem(problemId: string) {
  const { data, error } = await supabaseAdmin.from('test_cases').select('*').eq('problem_id', problemId);
  if (error) throw error;
  return data ?? [];
}

export async function createTestCase(tc: Partial<TestCase>) {
  const { data, error } = await supabaseAdmin.from('test_cases').insert([tc]).select().single();
  if (error) throw error;
  return data as TestCase;
}