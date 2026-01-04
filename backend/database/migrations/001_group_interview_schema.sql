-- ============================================================
-- MIGRATION: Group Interview Support (1:N Session Architecture)
-- Version: 001
-- Date: 2026-01-04
-- Description: Adds support for group interview sessions with
--              multiple learners per instructor
-- ============================================================

-- ============================================================
-- STEP 1: Add new columns to mock_interview_sessions
-- ============================================================

-- Add session_type to distinguish individual vs group sessions
ALTER TABLE mock_interview_sessions 
  ADD COLUMN IF NOT EXISTS session_type VARCHAR(20) 
    DEFAULT 'individual' 
    CHECK (session_type IN ('individual', 'group'));

-- Add maximum participants limit
ALTER TABLE mock_interview_sessions 
  ADD COLUMN IF NOT EXISTS max_participants INTEGER 
    DEFAULT 5 
    CHECK (max_participants >= 1 AND max_participants <= 20);

-- Add communication mode for the session
ALTER TABLE mock_interview_sessions 
  ADD COLUMN IF NOT EXISTS communication_mode VARCHAR(20)
    DEFAULT 'video'
    CHECK (communication_mode IN ('video', 'audio', 'text'));

-- Add room configuration (stores SFU/Mesh topology choice, recording settings)
ALTER TABLE mock_interview_sessions
  ADD COLUMN IF NOT EXISTS room_config JSONB 
    DEFAULT '{"topology": "mesh", "recordingEnabled": false}'::jsonb;

-- ============================================================
-- STEP 2: Create session_participants junction table
-- ============================================================

CREATE TABLE IF NOT EXISTS session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    session_id UUID NOT NULL 
      REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL 
      REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participant Info
    participant_role VARCHAR(50) NOT NULL 
      CHECK (participant_role IN ('instructor', 'learner', 'observer', 'co_instructor')),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'registered'
      CHECK (status IN ('registered', 'waiting', 'joined', 'left', 'kicked', 'no_show', 'reconnecting')),
    
    -- Timestamps
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- Connection & Media State
    connection_quality VARCHAR(20) DEFAULT 'unknown'
      CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor', 'unknown')),
    media_state JSONB DEFAULT '{"audioEnabled": true, "videoEnabled": true, "screenShareEnabled": false}'::jsonb,
    device_info JSONB, -- Browser, OS, device info
    
    -- Metadata
    notes TEXT,
    
    -- Prevent duplicate registrations
    UNIQUE(session_id, user_id)
);

-- ============================================================
-- STEP 3: Create indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_session_participants_session 
  ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user 
  ON session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_status 
  ON session_participants(status);
CREATE INDEX IF NOT EXISTS idx_session_participants_role 
  ON session_participants(participant_role);
CREATE INDEX IF NOT EXISTS idx_mock_sessions_type 
  ON mock_interview_sessions(session_type);

-- ============================================================
-- STEP 4: Create helpful views
-- ============================================================

-- View for session with participant counts
CREATE OR REPLACE VIEW v_session_with_participants AS
SELECT 
    s.id AS session_id,
    s.title,
    s.session_type,
    s.max_participants,
    s.max_slots,
    s.slots_available,
    s.status AS session_status,
    s.session_date,
    s.instructor_id,
    s.communication_mode,
    s.room_config,
    COUNT(sp.id) FILTER (WHERE sp.participant_role = 'learner') AS learner_count,
    COUNT(sp.id) FILTER (WHERE sp.status = 'joined') AS active_participants,
    COUNT(sp.id) FILTER (WHERE sp.status = 'waiting') AS waiting_participants,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'user_id', sp.user_id,
                'role', sp.participant_role,
                'status', sp.status,
                'joined_at', sp.joined_at,
                'media_state', sp.media_state
            )
        ) FILTER (WHERE sp.id IS NOT NULL),
        '[]'::json
    ) AS participants
FROM mock_interview_sessions s
LEFT JOIN session_participants sp ON s.id = sp.session_id
GROUP BY s.id;

-- View for active sessions (in_progress with participants)
CREATE OR REPLACE VIEW v_active_sessions AS
SELECT 
    s.*,
    COUNT(sp.id) as current_participant_count
FROM mock_interview_sessions s
LEFT JOIN session_participants sp ON s.id = sp.session_id AND sp.status = 'joined'
WHERE s.status = 'in_progress'
GROUP BY s.id;

-- ============================================================
-- STEP 5: Create trigger for auto-updating slots
-- ============================================================

CREATE OR REPLACE FUNCTION update_session_slots()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.participant_role = 'learner' AND NEW.status IN ('registered', 'waiting', 'joined') THEN
        UPDATE mock_interview_sessions 
        SET slots_available = GREATEST(0, slots_available - 1),
            updated_at = NOW()
        WHERE id = NEW.session_id;
    ELSIF TG_OP = 'DELETE' AND OLD.participant_role = 'learner' THEN
        UPDATE mock_interview_sessions 
        SET slots_available = LEAST(max_slots, slots_available + 1),
            updated_at = NOW()
        WHERE id = OLD.session_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes (e.g., cancelled booking)
        IF OLD.status IN ('registered', 'waiting', 'joined') AND NEW.status IN ('kicked', 'left') THEN
            UPDATE mock_interview_sessions 
            SET slots_available = LEAST(max_slots, slots_available + 1),
                updated_at = NOW()
            WHERE id = NEW.session_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trg_update_session_slots ON session_participants;
CREATE TRIGGER trg_update_session_slots
AFTER INSERT OR UPDATE OR DELETE ON session_participants
FOR EACH ROW EXECUTE FUNCTION update_session_slots();

-- ============================================================
-- STEP 6: Create function for joining a session
-- ============================================================

CREATE OR REPLACE FUNCTION join_interview_session(
    p_session_id UUID,
    p_user_id UUID,
    p_role VARCHAR(50) DEFAULT 'learner'
) RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    participant_id UUID
) AS $$
DECLARE
    v_session RECORD;
    v_existing_participant RECORD;
    v_new_participant_id UUID;
BEGIN
    -- Get session info
    SELECT * INTO v_session 
    FROM mock_interview_sessions 
    WHERE id = p_session_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Session not found'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Check session status
    IF v_session.status NOT IN ('scheduled', 'in_progress') THEN
        RETURN QUERY SELECT FALSE, 'Session is not available for joining'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if user already registered
    SELECT * INTO v_existing_participant
    FROM session_participants
    WHERE session_id = p_session_id AND user_id = p_user_id;
    
    IF FOUND THEN
        -- Update existing participant status
        UPDATE session_participants
        SET status = CASE 
            WHEN v_session.status = 'in_progress' THEN 'joined'
            ELSE 'waiting'
        END,
        joined_at = CASE 
            WHEN v_session.status = 'in_progress' THEN NOW()
            ELSE joined_at
        END
        WHERE id = v_existing_participant.id
        RETURNING id INTO v_new_participant_id;
        
        RETURN QUERY SELECT TRUE, 'Rejoined session'::TEXT, v_new_participant_id;
        RETURN;
    END IF;
    
    -- Check slot availability for learners
    IF p_role = 'learner' AND v_session.slots_available <= 0 THEN
        RETURN QUERY SELECT FALSE, 'Session is full'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Insert new participant
    INSERT INTO session_participants (
        session_id, user_id, participant_role, status, joined_at
    ) VALUES (
        p_session_id,
        p_user_id,
        p_role,
        CASE WHEN v_session.status = 'in_progress' THEN 'joined' ELSE 'waiting' END,
        CASE WHEN v_session.status = 'in_progress' THEN NOW() ELSE NULL END
    )
    RETURNING id INTO v_new_participant_id;
    
    RETURN QUERY SELECT TRUE, 'Successfully joined session'::TEXT, v_new_participant_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STEP 7: Update RLS Policies
-- ============================================================

ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own participation records
DROP POLICY IF EXISTS "Users can view own participation" ON session_participants;
CREATE POLICY "Users can view own participation"
    ON session_participants FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Instructors can view all participants in their sessions
DROP POLICY IF EXISTS "Instructors can view session participants" ON session_participants;
CREATE POLICY "Instructors can view session participants"
    ON session_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM mock_interview_sessions s
            WHERE s.id = session_participants.session_id
            AND s.instructor_id = auth.uid()
        )
    );

-- Policy: Users can update their own status
DROP POLICY IF EXISTS "Users can update own status" ON session_participants;
CREATE POLICY "Users can update own status"
    ON session_participants FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================
-- STEP 8: Migration for existing bookings to participants
-- ============================================================

-- Migrate existing interview_bookings to session_participants
INSERT INTO session_participants (
    session_id,
    user_id,
    participant_role,
    status,
    registered_at,
    joined_at
)
SELECT 
    ib.session_id,
    ib.learner_id,
    'learner',
    CASE 
        WHEN ib.booking_status = 'completed' THEN 'left'
        WHEN ib.booking_status = 'cancelled' THEN 'left'
        WHEN ib.booking_status = 'no_show' THEN 'no_show'
        WHEN ib.booking_status = 'confirmed' THEN 'registered'
        ELSE 'registered'
    END,
    ib.booked_at,
    ib.confirmed_at
FROM interview_bookings ib
ON CONFLICT (session_id, user_id) DO NOTHING;

-- Add instructor as participant for each session
INSERT INTO session_participants (
    session_id,
    user_id,
    participant_role,
    status,
    registered_at
)
SELECT 
    s.id,
    s.instructor_id,
    'instructor',
    'registered',
    s.created_at
FROM mock_interview_sessions s
ON CONFLICT (session_id, user_id) DO NOTHING;

-- ============================================================
-- STEP 9: Add missing columns to interview_feedback table
-- ============================================================

-- Add session_id to feedback (required for 1:N support)
ALTER TABLE interview_feedback 
  ADD COLUMN IF NOT EXISTS session_id UUID 
  REFERENCES mock_interview_sessions(id) ON DELETE CASCADE;

-- Make booking_id nullable (instructors don't have bookings)
ALTER TABLE interview_feedback 
  ALTER COLUMN booking_id DROP NOT NULL;

-- Make learner_id nullable (instructor feedback has no learner)
ALTER TABLE interview_feedback 
  ALTER COLUMN learner_id DROP NOT NULL;

-- Add comments field for general feedback
ALTER TABLE interview_feedback 
  ADD COLUMN IF NOT EXISTS comments TEXT;

-- Add feedback_type to categorize feedback
ALTER TABLE interview_feedback 
  ADD COLUMN IF NOT EXISTS feedback_type VARCHAR(50) 
  DEFAULT 'learner_feedback'
  CHECK (feedback_type IN ('learner_feedback', 'instructor_system', 'peer_review'));

-- ============================================================
-- END OF MIGRATION
-- ============================================================

COMMENT ON TABLE session_participants IS 'Stores all participants (instructors, learners, observers) for interview sessions. Supports 1:N group sessions.';
COMMENT ON COLUMN session_participants.media_state IS 'JSON object tracking audio/video/screenshare state';
COMMENT ON COLUMN mock_interview_sessions.session_type IS 'individual = 1:1, group = 1:N participants';
COMMENT ON COLUMN mock_interview_sessions.room_config IS 'WebRTC room configuration including topology preference';
COMMENT ON COLUMN interview_feedback.session_id IS 'Reference to interview session (1:N support)';
COMMENT ON COLUMN interview_feedback.comments IS 'General feedback comments field';
COMMENT ON COLUMN interview_feedback.feedback_type IS 'Type of feedback: learner_feedback (from learner), instructor_system (from instructor), peer_review (peer)';
