-- Add billing_cycle column to subscriptions table
-- This is needed for payment proof approval to track monthly/yearly billing

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

-- Add comment
COMMENT ON COLUMN subscriptions.billing_cycle IS 'Billing cycle: monthly or yearly subscription';

-- Update existing subscriptions to have default billing cycle
UPDATE subscriptions 
SET billing_cycle = 'monthly' 
WHERE billing_cycle IS NULL;
