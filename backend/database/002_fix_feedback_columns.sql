-- ============================================================
-- HOTFIX: Add missing columns to interview_feedback
-- ============================================================
-- This file adds the missing columns that the backend service
-- now requires for supporting both learner and instructor feedback

-- Add session_id column if it doesn't exist
ALTER TABLE interview_feedback 
  ADD COLUMN IF NOT EXISTS session_id UUID 
  REFERENCES mock_interview_sessions(id) ON DELETE CASCADE;

-- Make booking_id nullable (instructors don't have bookings)
-- Only drop NOT NULL if the column was NOT NULL
DO $$ 
BEGIN
  ALTER TABLE interview_feedback 
    ALTER COLUMN booking_id DROP NOT NULL;
EXCEPTION WHEN others THEN
  NULL; -- Column already nullable, ignore error
END $$;

-- Make learner_id nullable (instructor feedback has no learner)
DO $$ 
BEGIN
  ALTER TABLE interview_feedback 
    ALTER COLUMN learner_id DROP NOT NULL;
EXCEPTION WHEN others THEN
  NULL; -- Column already nullable, ignore error
END $$;

-- Add comments field for general feedback comments
ALTER TABLE interview_feedback 
  ADD COLUMN IF NOT EXISTS comments TEXT;

-- Add feedback_type to categorize feedback
ALTER TABLE interview_feedback 
  ADD COLUMN IF NOT EXISTS feedback_type VARCHAR(50) 
  DEFAULT 'learner_feedback'
  CHECK (feedback_type IN ('learner_feedback', 'instructor_system', 'peer_review'));

-- Update any existing feedback to have the new columns populated
UPDATE interview_feedback 
SET feedback_type = 'learner_feedback'
WHERE feedback_type IS NULL AND learner_id IS NOT NULL;

UPDATE interview_feedback 
SET feedback_type = 'instructor_system'
WHERE feedback_type IS NULL AND learner_id IS NULL;

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON COLUMN interview_feedback.session_id IS 'Reference to interview session (1:N support)';
COMMENT ON COLUMN interview_feedback.comments IS 'General feedback comments field';
COMMENT ON COLUMN interview_feedback.feedback_type IS 'Type of feedback: learner_feedback (from learner), instructor_system (from instructor), peer_review (peer)';
