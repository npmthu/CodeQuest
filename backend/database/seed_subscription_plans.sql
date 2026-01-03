-- Sample data for subscription plans and features
-- Run this to populate your database with example subscription plans

INSERT INTO public.subscription_plans (id, name, slug, description, price_monthly, price_yearly, features, is_active, created_at) VALUES
-- Free Plan
(
  gen_random_uuid(),
  'Free Plan',
  'free',
  'Perfect for getting started with basic features',
  0,
  0,
  '{
    "maxNotes": 10,
    "aiGeneration": false,
    "aiMindmap": false,
    "maxSubmissions": 5,
    "advancedAnalytics": false,
    "prioritySupport": false,
    "customThemes": false,
    "exportFormats": ["txt"],
    "collaborationLimit": 0
  }'::jsonb,
  true,
  now()
),
-- Pro Plan
(
  gen_random_uuid(),
  'Pro Plan',
  'pro',
  'For serious learners who need more power',
  9.99,
  99.99,
  '{
    "maxNotes": 100,
    "aiGeneration": true,
    "aiMindmap": true,
    "maxSubmissions": 50,
    "advancedAnalytics": true,
    "prioritySupport": false,
    "customThemes": false,
    "exportFormats": ["txt", "pdf", "markdown"],
    "collaborationLimit": 3
  }'::jsonb,
  true,
  now()
),
-- Business Plan
(
  gen_random_uuid(),
  'Business Plan',
  'business',
  'For teams and organizations',
  29.99,
  299.99,
  '{
    "maxNotes": -1,
    "aiGeneration": true,
    "aiMindmap": true,
    "maxSubmissions": -1,
    "advancedAnalytics": true,
    "prioritySupport": true,
    "customThemes": true,
    "exportFormats": ["txt", "pdf", "markdown", "html", "json"],
    "collaborationLimit": -1
  }'::jsonb,
  true,
  now()
);

-- Example: Create a sample subscription for a test user
-- Replace 'your-user-id-here' with an actual user UUID from your users table

-- INSERT INTO public.subscriptions (
--   id, user_id, plan_id, status, current_period_start, current_period_end,
--   cancel_at_period_end, provider, provider_subscription_id, provider_metadata,
--   created_at, updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'your-user-id-here', -- Replace with actual user ID
--   (SELECT id FROM public.subscription_plans WHERE slug = 'pro'),
--   'active',
--   now(),
--   now() + interval '1 month',
--   false,
--   'mock',
--   'mock_sub_' || gen_random_uuid(),
--   '{"simulated": true}'::jsonb,
--   now(),
--   now()
-- );
