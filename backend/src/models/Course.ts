// Course model - online courses

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  difficulty?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  partner_id?: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  serial_number: string;
  certificate_url?: string;
  issued_at?: string;
}
