// Organization model - business partner organizations

export interface Partner {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  settings?: Record<string, any>; // jsonb
  created_at?: string;
  updated_at?: string;
}

export interface Instructor {
  partner_id: string;
  user_id: string;
  role: string;
  joined_at?: string;
}
