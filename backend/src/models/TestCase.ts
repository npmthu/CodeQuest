export interface TestCase {
  id: string;
  problem_id: string;
  name?: string;
  input: any; // JSONB - actual input data matching problem_io.input structure
  expected_output: any; // JSONB - expected output matching problem_io.output structure
  is_sample?: boolean;
  points?: number;
  display_order?: number;
  created_at?: string;
}
