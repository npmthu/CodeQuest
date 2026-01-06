-- Add payment proof support for interview bookings
-- Migration: 005_interview_payment_proofs.sql

-- Add payment proof columns to interview_bookings table
ALTER TABLE interview_bookings 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) CHECK (payment_method IN ('credit_card', 'bank_transfer', 'free')),
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_verified_by UUID REFERENCES users(id);

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_interview_bookings_payment_status 
ON interview_bookings(payment_status);

-- Create index for payment verification queries
CREATE INDEX IF NOT EXISTS idx_interview_bookings_payment_verified 
ON interview_bookings(payment_verified_by);

-- Add comment
COMMENT ON COLUMN interview_bookings.payment_method IS 'Payment method: credit_card, bank_transfer, or free';
COMMENT ON COLUMN interview_bookings.payment_proof_url IS 'URL to payment proof image (for bank transfer)';
COMMENT ON COLUMN interview_bookings.payment_verified_at IS 'Timestamp when admin verified payment';
COMMENT ON COLUMN interview_bookings.payment_verified_by IS 'Admin user ID who verified payment';

-- Update existing bookings with default payment method
UPDATE interview_bookings 
SET payment_method = 'credit_card' 
WHERE payment_method IS NULL AND payment_status = 'paid';

UPDATE interview_bookings 
SET payment_method = 'free' 
WHERE payment_method IS NULL AND (payment_amount = 0 OR payment_amount IS NULL);
