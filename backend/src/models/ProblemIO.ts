// ProblemIO model - matches database schema

export interface ProblemIO {
  problem_id: string;
  input: any; // JSONB - structure defined in input_output_jsonb.md
  output: any; // JSONB - structure defined in input_output_jsonb.md
}

// Input parameter definition
export interface IOParameter {
  name: string;
  type: 'int' | 'float' | 'string' | 'bool' | 'null' | 'array' | 'object' | 'tree' | 'graph' | 'linked_list';
  element_type?: string;
  constraints?: {
    min_length?: number;
    max_length?: number;
    length?: number;
    value_range?: [number, number];
    [key: string]: any;
  };
}

// Input structure
export interface IOInput {
  style: 'function';
  params: IOParameter[];
}

// Output structure
export interface IOOutput {
  type: string;
  element_type?: string;
  constraints?: {
    length?: number;
    [key: string]: any;
  };
  comparator?: 'exact' | 'unordered' | 'custom';
}
