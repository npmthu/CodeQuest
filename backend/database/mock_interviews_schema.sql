-- Mock Interviews & AI Learning Module Schema
-- Add these tables to your existing database

-- Mock Interview Sessions created by instructors
CREATE TABLE IF NOT EXISTS mock_interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(255) NOT NULL,
    difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_slots INTEGER NOT NULL CHECK (max_slots > 0),
    slots_available INTEGER NOT NULL CHECK (slots_available >= 0),
    session_link VARCHAR(500), -- Zoom/Meet link
    requirements TEXT, -- Prerequisites or materials needed
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings for mock interview sessions
CREATE TABLE IF NOT EXISTS interview_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_status VARCHAR(50) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_amount DECIMAL(10,2),
    payment_id VARCHAR(255), -- Mock payment gateway ID
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT, -- Learner notes or special requirements
    no_show_reported BOOLEAN DEFAULT FALSE,
    UNIQUE(session_id, learner_id) -- Prevent double booking
);

-- Interview Feedback from instructors
CREATE TABLE IF NOT EXISTS interview_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES interview_bookings(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    technical_rating INTEGER CHECK (technical_rating >= 1 AND technical_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    problem_solving_rating INTEGER CHECK (problem_solving_rating >= 1 AND problem_solving_rating <= 5),
    strengths TEXT,
    areas_for_improvement TEXT,
    recommendations TEXT,
    detailed_feedback JSONB, -- Structured feedback data
    feedback_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT FALSE, -- Whether feedback can be shared
    UNIQUE(booking_id) -- One feedback per booking
);

-- AI Suggestions and Learning Assistance Logs
CREATE TABLE IF NOT EXISTS ai_suggestion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(100) NOT NULL CHECK (suggestion_type IN ('topic_suggestion', 'summary', 'mindmap', 'hint', 'code_review')),
    input_content TEXT,
    output_content JSONB, -- Store structured AI responses
    context_metadata JSONB, -- Additional context (problem_id, topic, etc.)
    tokens_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Join Logs for tracking attendance
CREATE TABLE IF NOT EXISTS session_join_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_role VARCHAR(50) CHECK (user_role IN ('instructor', 'learner')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    session_duration_minutes INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mock_interview_sessions_instructor ON mock_interview_sessions(instructor_id);
CREATE INDEX IF NOT EXISTS idx_mock_interview_sessions_date ON mock_interview_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_mock_interview_sessions_status ON mock_interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_bookings_session ON interview_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_bookings_learner ON interview_bookings(learner_id);
CREATE INDEX IF NOT EXISTS idx_interview_bookings_status ON interview_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_booking ON interview_feedback(booking_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_instructor ON interview_feedback(instructor_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_learner ON interview_feedback(learner_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestion_logs_user ON ai_suggestion_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestion_logs_type ON ai_suggestion_logs(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_session_join_logs_session ON session_join_logs(session_id);

-- RLS Policies (if using Supabase)
ALTER TABLE mock_interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_join_logs ENABLE ROW LEVEL SECURITY;

-- Sample data for testing (optional)
INSERT INTO mock_interview_sessions (
    instructor_id, title, description, topic, difficulty_level, 
    session_date, duration_minutes, price, max_slots, slots_available
) VALUES 
(
    gen_random_uuid(), -- Replace with actual instructor ID
    'JavaScript Fundamentals Interview',
    'Practice basic JavaScript concepts and problem-solving',
    'JavaScript Basics',
    'beginner',
    NOW() + interval '2 days',
    60,
    29.99,
    5,
    5
),
(
    gen_random_uuid(), -- Replace with actual instructor ID
    'Advanced React & System Design',
    'Deep dive into React patterns and system architecture',
    'React & System Design',
    'advanced',
    NOW() + interval '3 days',
    90,
    49.99,
    3,
    3
);
