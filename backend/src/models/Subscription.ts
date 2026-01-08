// Subscription model - subscription plans and user subscriptions

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  features?: any; // jsonb
  is_active?: boolean;
  created_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  provider?: string;
  provider_subscription_id?: string;
  provider_metadata?: any; // jsonb
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency?: string;
  status: string;
  payment_method?: string;
  provider_transaction_id?: string;
  reference_type: string;
  reference_id: string;
  invoice_url?: string;
  created_at?: string;
}
