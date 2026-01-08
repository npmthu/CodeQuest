// Analytics and Audit model - system tracking

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: string;
  event_data?: any; // jsonb
  created_at?: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>; // jsonb
  created_at?: string;
}
