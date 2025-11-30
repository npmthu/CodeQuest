export interface TestCase {
  id: string;
  problem_id: string;
  name?: string;
  input_encrypted: string;
  expected_output_encrypted: string;
  is_sample?: boolean;
  points?: number;
  display_order?: number;
  created_at?: string;
}
