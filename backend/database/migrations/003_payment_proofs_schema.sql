-- Payment Proofs Schema
-- Table to store payment proof uploads for subscription upgrades

CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount DECIMAL(10, 2) NOT NULL,
  proof_image_url TEXT NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_proofs_user ON payment_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_plan ON payment_proofs(plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_created ON payment_proofs(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_payment_proofs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_proofs_updated_at
  BEFORE UPDATE ON payment_proofs
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_proofs_updated_at();

-- Comments
COMMENT ON TABLE payment_proofs IS 'Payment proof uploads for subscription upgrades';
COMMENT ON COLUMN payment_proofs.billing_cycle IS 'monthly or yearly subscription billing cycle';
COMMENT ON COLUMN payment_proofs.status IS 'pending: waiting for admin review, approved: payment confirmed, rejected: payment invalid';
COMMENT ON COLUMN payment_proofs.proof_image_url IS 'URL to uploaded payment proof image (screenshot, photo of receipt, etc.)';
