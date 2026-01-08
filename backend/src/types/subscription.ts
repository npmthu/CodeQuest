export interface PlanFeature {
  maxNotes?: number;
  aiGeneration?: boolean;
  aiMindmap?: boolean;
  maxSubmissions?: number;
  advancedAnalytics?: boolean;
  prioritySupport?: boolean;
  customThemes?: boolean;
  exportFormats?: string[];
  collaborationLimit?: number;
  [key: string]: any;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  features: PlanFeature;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  provider?: 'stripe' | 'paypal' | 'mock';
  provider_subscription_id?: string;
  provider_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithPlan extends Subscription {
  plan: SubscriptionPlan;
}

export interface FeatureCheckResult {
  canAccess: boolean;
  reason?: string;
  plan?: SubscriptionPlan;
  subscription?: Subscription;
}

export interface CheckoutRequest {
  planSlug: string;
  paymentMethod?: 'stripe' | 'paypal';
}

export interface CheckoutResponse {
  success: boolean;
  subscription?: SubscriptionWithPlan;
  message?: string;
  clientSecret?: string;
}
