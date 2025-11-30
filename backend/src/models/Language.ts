export interface Language {
  id: string;                 // UUID
  name: string;
  version?: string;
  file_extension: string;
  compile_command?: string;
  run_command: string;
  is_active?: boolean;
  created_at?: string;
}
