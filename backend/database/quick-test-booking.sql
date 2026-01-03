-- ============================================
-- QUICK TEST: Create Booking for Student
-- ============================================

-- Step 1: Check if sessions exist
SELECT 
    id,
    title,
    status,
    instructor_id,
    session_date,
    slots_available
FROM mock_interview_sessions
WHERE status IN ('scheduled', 'in_progress')
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Check available students
SELECT id, email, role
FROM users
WHERE role = 'student'
LIMIT 5;

-- Step 3: Create booking (adjust session_id and learner_id from above results)
-- Replace the UUIDs below with actual values from Steps 1 and 2

/*
INSERT INTO interview_bookings (
    session_id,
    learner_id,
    booking_status,
    payment_status,
    payment_amount,
    booked_at,
    confirmed_at
)
VALUES (
    'YOUR_SESSION_ID_HERE'::uuid,      -- From Step 1
    'YOUR_STUDENT_ID_HERE'::uuid,      -- From Step 2
    'confirmed',
    'paid',
    0.00,
    NOW(),
    NOW()
)
ON CONFLICT (session_id, learner_id) DO UPDATE
SET booking_status = 'confirmed',
    payment_status = 'paid',
    confirmed_at = NOW();
*/

-- Step 4: Auto-create booking (finds first available session and student)
INSERT INTO interview_bookings (
    session_id,
    learner_id,
    booking_status,
    payment_status,
    payment_amount,
    booked_at,
    confirmed_at
)
SELECT
    (SELECT id FROM mock_interview_sessions 
     WHERE status = 'in_progress' 
     ORDER BY created_at DESC 
     LIMIT 1),
    (SELECT id FROM users 
     WHERE role = 'student' 
     LIMIT 1),
    'confirmed',
    'paid',
    0.00,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM mock_interview_sessions WHERE status = 'in_progress')
  AND EXISTS (SELECT 1 FROM users WHERE role = 'student')
ON CONFLICT (session_id, learner_id) DO UPDATE
SET booking_status = 'confirmed',
    payment_status = 'paid',
    confirmed_at = NOW();

-- Step 5: Verify booking created
SELECT 
    ib.id,
    ib.booking_status,
    ib.payment_status,
    mis.title AS session_title,
    mis.status AS session_status,
    u.email AS student_email,
    ib.booked_at
FROM interview_bookings ib
JOIN mock_interview_sessions mis ON ib.session_id = mis.id
JOIN users u ON ib.learner_id = u.id
ORDER BY ib.booked_at DESC
LIMIT 10;

-- Step 6: If no bookings created, check why
SELECT 
    'Sessions in_progress' AS check_type,
    COUNT(*) AS count
FROM mock_interview_sessions
WHERE status = 'in_progress'
UNION ALL
SELECT 
    'Students available' AS check_type,
    COUNT(*) AS count
FROM users
WHERE role = 'student';
