-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  badge_url text,
  xp_reward integer DEFAULT 0,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_code_reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  submission_id uuid NOT NULL,
  status character varying NOT NULL DEFAULT 'PROCESSING'::character varying,
  overall_score integer,
  dimensions jsonb,
  summary text,
  strengths jsonb,
  improvements jsonb,
  code_suggestions jsonb,
  complexity_analysis jsonb,
  generated_at timestamp without time zone,
  processing_time_ms integer,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_code_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT ai_code_reviews_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id)
);
CREATE TABLE public.ai_generated_content (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  content_type character varying NOT NULL,
  source_type character varying,
  source_id uuid,
  generated_data jsonb NOT NULL,
  export_urls jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_generated_content_pkey PRIMARY KEY (id),
  CONSTRAINT ai_generated_content_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.ai_suggestion_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  suggestion_type character varying NOT NULL CHECK (suggestion_type::text = ANY (ARRAY['topic_suggestion'::character varying, 'summary'::character varying, 'mindmap'::character varying, 'hint'::character varying, 'code_review'::character varying]::text[])),
  input_content text,
  output_content jsonb,
  context_metadata jsonb,
  tokens_used integer DEFAULT 0,
  processing_time_ms integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_suggestion_logs_pkey PRIMARY KEY (id),
  CONSTRAINT ai_suggestion_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  event_type character varying NOT NULL,
  event_data jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT analytics_events_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  actor_id uuid,
  action character varying NOT NULL,
  entity_type character varying,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id)
);
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  serial_number character varying NOT NULL UNIQUE,
  certificate_url text,
  issued_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT certificates_pkey PRIMARY KEY (id),
  CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.code_drafts (
  user_id uuid NOT NULL,
  problem_id uuid NOT NULL,
  code text NOT NULL,
  language_id uuid,
  last_updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT code_drafts_pkey PRIMARY KEY (user_id, problem_id),
  CONSTRAINT code_drafts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT code_drafts_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id),
  CONSTRAINT code_drafts_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.code_runs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  submission_id uuid NOT NULL,
  test_case_id uuid,
  worker_id character varying,
  status character varying,
  stdout text,
  stderr text,
  exit_code integer,
  execution_time_ms integer,
  memory_kb integer,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT code_runs_pkey PRIMARY KEY (id),
  CONSTRAINT code_runs_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id),
  CONSTRAINT code_runs_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  thumbnail_url text,
  difficulty character varying DEFAULT 'Beginner'::character varying,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  partner_id uuid,
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'enrolled'::enrollment_status,
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  progress jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.forum_posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  author_id uuid NOT NULL,
  title character varying NOT NULL,
  content_markdown text NOT NULL,
  related_problem_id uuid,
  upvotes integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  has_accepted_answer boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  tags jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT forum_posts_pkey PRIMARY KEY (id),
  CONSTRAINT forum_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id),
  CONSTRAINT forum_posts_related_problem_id_fkey FOREIGN KEY (related_problem_id) REFERENCES public.problems(id)
);
CREATE TABLE public.forum_replies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  parent_reply_id uuid,
  content_markdown text NOT NULL,
  code_snippet jsonb,
  upvotes integer DEFAULT 0,
  is_accepted_answer boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT forum_replies_pkey PRIMARY KEY (id),
  CONSTRAINT forum_replies_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.forum_posts(id),
  CONSTRAINT forum_replies_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id),
  CONSTRAINT forum_replies_parent_reply_id_fkey FOREIGN KEY (parent_reply_id) REFERENCES public.forum_replies(id)
);
CREATE TABLE public.forum_votes (
  user_id uuid NOT NULL,
  votable_type character varying NOT NULL,
  votable_id uuid NOT NULL,
  vote_type character varying NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT forum_votes_pkey PRIMARY KEY (user_id, votable_type, votable_id),
  CONSTRAINT forum_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.instructors (
  partner_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role character varying NOT NULL,
  joined_at timestamp without time zone DEFAULT now(),
  CONSTRAINT instructors_pkey PRIMARY KEY (partner_id, user_id),
  CONSTRAINT instructors_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id),
  CONSTRAINT instructors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.interview_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  learner_id uuid NOT NULL,
  booking_status character varying DEFAULT 'pending'::character varying CHECK (booking_status::text = ANY (ARRAY['pending'::character varying, 'confirmed'::character varying, 'cancelled'::character varying, 'completed'::character varying, 'no_show'::character varying]::text[])),
  payment_status character varying DEFAULT 'pending'::character varying CHECK (payment_status::text = ANY (ARRAY['pending'::character varying, 'paid'::character varying, 'refunded'::character varying, 'failed'::character varying]::text[])),
  payment_amount numeric,
  payment_id character varying,
  booked_at timestamp with time zone DEFAULT now(),
  confirmed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  notes text,
  no_show_reported boolean DEFAULT false,
  payment_method character varying CHECK (payment_method::text = ANY (ARRAY['credit_card'::character varying, 'bank_transfer'::character varying, 'free'::character varying]::text[])),
  payment_proof_url text,
  payment_verified_at timestamp with time zone,
  payment_verified_by uuid,
  CONSTRAINT interview_bookings_pkey PRIMARY KEY (id),
  CONSTRAINT interview_bookings_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mock_interview_sessions(id),
  CONSTRAINT interview_bookings_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES public.users(id),
  CONSTRAINT interview_bookings_payment_verified_by_fkey FOREIGN KEY (payment_verified_by) REFERENCES public.users(id)
);
CREATE TABLE public.interview_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid UNIQUE,
  instructor_id uuid NOT NULL,
  learner_id uuid,
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
  technical_rating integer CHECK (technical_rating >= 1 AND technical_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  problem_solving_rating integer CHECK (problem_solving_rating >= 1 AND problem_solving_rating <= 5),
  strengths text,
  areas_for_improvement text,
  recommendations text,
  detailed_feedback jsonb,
  feedback_date timestamp with time zone DEFAULT now(),
  is_public boolean DEFAULT false,
  session_id uuid,
  comments text,
  feedback_type character varying DEFAULT 'learner_feedback'::character varying CHECK (feedback_type::text = ANY (ARRAY['learner_feedback'::character varying, 'instructor_system'::character varying, 'peer_review'::character varying]::text[])),
  CONSTRAINT interview_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT interview_feedback_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.interview_bookings(id),
  CONSTRAINT interview_feedback_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id),
  CONSTRAINT interview_feedback_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES public.users(id),
  CONSTRAINT interview_feedback_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mock_interview_sessions(id)
);
CREATE TABLE public.interview_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  interviewee_id uuid,
  interviewer_id uuid,
  interview_type character varying,
  difficulty character varying,
  status character varying NOT NULL DEFAULT 'scheduled'::character varying,
  scheduled_at timestamp without time zone,
  started_at timestamp without time zone,
  ended_at timestamp without time zone,
  duration_min integer,
  communication_mode character varying,
  recording_enabled boolean DEFAULT false,
  recording_url text,
  workspace_data jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT interview_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT interview_sessions_interviewee_id_fkey FOREIGN KEY (interviewee_id) REFERENCES public.users(id),
  CONSTRAINT interview_sessions_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.users(id)
);
CREATE TABLE public.languages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  version character varying,
  file_extension character varying NOT NULL,
  compile_command text,
  run_command text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT languages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lesson_completions (
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  time_spent_sec integer DEFAULT 0,
  completed_at timestamp without time zone DEFAULT now(),
  CONSTRAINT lesson_completions_pkey PRIMARY KEY (user_id, lesson_id),
  CONSTRAINT lesson_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT lesson_completions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  topic_id uuid NOT NULL,
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  content_markdown text NOT NULL,
  difficulty character varying,
  estimated_time_min integer,
  display_order integer DEFAULT 0,
  created_by uuid,
  is_published boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  course_id uuid,
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id),
  CONSTRAINT lessons_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.mock_interview_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  topic character varying NOT NULL,
  difficulty_level character varying CHECK (difficulty_level::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying]::text[])),
  session_date timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  price numeric NOT NULL DEFAULT 0.00,
  max_slots integer NOT NULL CHECK (max_slots > 0),
  slots_available integer NOT NULL CHECK (slots_available >= 0),
  session_link character varying,
  requirements text,
  status character varying DEFAULT 'scheduled'::character varying CHECK (status::text = ANY (ARRAY['scheduled'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  session_type character varying DEFAULT 'individual'::character varying CHECK (session_type::text = ANY (ARRAY['individual'::character varying, 'group'::character varying]::text[])),
  max_participants integer DEFAULT 5 CHECK (max_participants >= 1 AND max_participants <= 20),
  communication_mode character varying DEFAULT 'video'::character varying CHECK (communication_mode::text = ANY (ARRAY['video'::character varying, 'audio'::character varying, 'text'::character varying]::text[])),
  room_config jsonb DEFAULT '{"topology": "mesh", "recordingEnabled": false}'::jsonb,
  CONSTRAINT mock_interview_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT mock_interview_sessions_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id)
);
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title character varying,
  content_markdown text,
  is_private boolean DEFAULT true,
  tags jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  message text NOT NULL,
  target_plan_id uuid,
  scheduled_for timestamp with time zone,
  status character varying NOT NULL DEFAULT 'draft'::character varying CHECK (status::text = ANY (ARRAY['draft'::character varying, 'sent'::character varying, 'scheduled'::character varying]::text[])),
  sent_at timestamp with time zone,
  recipients_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_target_plan_id_fkey FOREIGN KEY (target_plan_id) REFERENCES public.subscription_plans(id)
);
CREATE TABLE public.partners (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  domain character varying,
  logo_url text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT partners_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_proofs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  billing_cycle character varying NOT NULL CHECK (billing_cycle::text = ANY (ARRAY['monthly'::character varying, 'yearly'::character varying]::text[])),
  amount numeric NOT NULL,
  proof_image_url text NOT NULL,
  payment_method character varying,
  transaction_id character varying,
  notes text,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_proofs_pkey PRIMARY KEY (id),
  CONSTRAINT payment_proofs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT payment_proofs_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id),
  CONSTRAINT payment_proofs_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id)
);
CREATE TABLE public.problem_io (
  problem_id uuid NOT NULL DEFAULT gen_random_uuid(),
  input jsonb,
  output jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT problem_io_pkey PRIMARY KEY (problem_id),
  CONSTRAINT problem_io_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id)
);
CREATE TABLE public.problems (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  description_markdown text NOT NULL,
  difficulty smallint NOT NULL DEFAULT 1,
  time_limit_ms integer NOT NULL DEFAULT 2000,
  memory_limit_kb integer NOT NULL DEFAULT 65536,
  input_format text,
  output_format text,
  constraints text,
  created_by uuid,
  is_published boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  acceptance_rate numeric,
  total_submissions integer DEFAULT 0,
  total_accepted integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  editorial_markdown text,
  topic_id uuid,
  hint text,
  CONSTRAINT problems_pkey PRIMARY KEY (id),
  CONSTRAINT problems_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT problems_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id)
);
CREATE TABLE public.quiz_attempts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  quiz_id uuid NOT NULL,
  score integer,
  total_points integer,
  passed boolean,
  started_at timestamp without time zone DEFAULT now(),
  submitted_at timestamp without time zone,
  answers jsonb,
  CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);
CREATE TABLE public.quiz_questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quiz_id uuid NOT NULL,
  question_text text NOT NULL,
  question_type character varying,
  options jsonb,
  correct_answer jsonb NOT NULL,
  explanation text,
  points integer DEFAULT 10,
  display_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  topic_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  difficulty character varying,
  time_limit_min integer,
  passing_score integer DEFAULT 70,
  created_by uuid,
  is_published boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT quizzes_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id),
  CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.session_join_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_role character varying CHECK (user_role::text = ANY (ARRAY['instructor'::character varying, 'learner'::character varying]::text[])),
  joined_at timestamp with time zone DEFAULT now(),
  left_at timestamp with time zone,
  session_duration_minutes integer,
  CONSTRAINT session_join_logs_pkey PRIMARY KEY (id),
  CONSTRAINT session_join_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mock_interview_sessions(id),
  CONSTRAINT session_join_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.session_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  participant_role character varying NOT NULL CHECK (participant_role::text = ANY (ARRAY['instructor'::character varying, 'learner'::character varying, 'observer'::character varying, 'co_instructor'::character varying]::text[])),
  status character varying DEFAULT 'registered'::character varying CHECK (status::text = ANY (ARRAY['registered'::character varying, 'waiting'::character varying, 'joined'::character varying, 'left'::character varying, 'kicked'::character varying, 'no_show'::character varying, 'reconnecting'::character varying]::text[])),
  registered_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone,
  left_at timestamp with time zone,
  connection_quality character varying DEFAULT 'unknown'::character varying CHECK (connection_quality::text = ANY (ARRAY['excellent'::character varying, 'good'::character varying, 'fair'::character varying, 'poor'::character varying, 'unknown'::character varying]::text[])),
  media_state jsonb DEFAULT '{"audioEnabled": true, "videoEnabled": true, "screenShareEnabled": false}'::jsonb,
  device_info jsonb,
  notes text,
  CONSTRAINT session_participants_pkey PRIMARY KEY (id),
  CONSTRAINT session_participants_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mock_interview_sessions(id),
  CONSTRAINT session_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  problem_id uuid NOT NULL,
  language_id uuid,
  code text NOT NULL,
  code_url text,
  status character varying NOT NULL DEFAULT 'PENDING'::character varying,
  points integer DEFAULT 0,
  passed boolean DEFAULT false,
  submitted_at timestamp without time zone DEFAULT now(),
  started_execution_at timestamp without time zone,
  completed_at timestamp without time zone,
  execution_summary jsonb,
  compilation_output text,
  metadata jsonb DEFAULT '{}'::jsonb,
  suspicion_score real CHECK (suspicion_score >= 0.0::double precision AND suspicion_score <= 1::double precision),
  suspicion_breakdown jsonb,
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT submissions_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id),
  CONSTRAINT submissions_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id)
);
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  price_monthly numeric,
  price_yearly numeric,
  features jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  status character varying NOT NULL DEFAULT 'active'::character varying,
  current_period_start timestamp without time zone,
  current_period_end timestamp without time zone,
  cancel_at_period_end boolean DEFAULT false,
  provider character varying,
  provider_subscription_id character varying,
  provider_metadata jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id)
);
CREATE TABLE public.test_cases (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  problem_id uuid NOT NULL,
  name character varying,
  input jsonb NOT NULL,
  expected_output jsonb NOT NULL,
  is_sample boolean DEFAULT false,
  points integer DEFAULT 10,
  display_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT test_cases_pkey PRIMARY KEY (id),
  CONSTRAINT test_cases_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id)
);
CREATE TABLE public.topics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  icon_url text,
  parent_topic_id uuid,
  display_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  course_id uuid,
  CONSTRAINT topics_pkey PRIMARY KEY (id),
  CONSTRAINT topics_parent_topic_id_fkey FOREIGN KEY (parent_topic_id) REFERENCES public.topics(id),
  CONSTRAINT topics_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency character varying DEFAULT 'USD'::character varying,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  payment_method character varying,
  provider_transaction_id character varying,
  reference_type character varying NOT NULL,
  reference_id uuid NOT NULL,
  invoice_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_achievements (
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL,
  earned_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT user_achievements_pkey PRIMARY KEY (user_id, achievement_id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id)
);
CREATE TABLE public.user_learning_profiles (
  user_id uuid NOT NULL,
  current_level character varying DEFAULT 'beginner'::character varying,
  weak_topics jsonb,
  strong_topics jsonb,
  learning_preferences jsonb,
  current_streak_days integer DEFAULT 0,
  longest_streak_days integer DEFAULT 0,
  last_activity_date date,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_learning_profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_learning_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_notifications_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email character varying,
  display_name character varying,
  avatar_url text,
  bio text,
  role character varying NOT NULL DEFAULT 'learner'::character varying,
  is_active boolean DEFAULT true,
  level character varying DEFAULT 'Beginner'::character varying,
  reputation integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  last_login_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);