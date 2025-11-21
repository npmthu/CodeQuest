# CodeQuest API & Database Design v0.2

## 1. Architecture Overview

Tech Stack

- API Server: Node.js/Express or Python/FastAPI
- Database: PostgreSQL 15+ with extensions (uuid-ossp, pgcrypto)
- Cache: Redis 7+ (cache, pub/sub, rate limiting)
- Message Queue: RabbitMQ/Redis Streams
- Code Execution: Docker sandboxes with cgroups/seccomp
- Real-time: WebSocket (Socket.io) or SSE
- Object Storage: AWS S3 or MinIO for code files, exports
- AI Services: External API (OpenAI GPT-4, custom models)

  Core Design Principles (CodeQuest-Specific)

1.  Learning-First, Not Contest-First: Primary flow is theory → practice → AI feedback → progress tracking
2.  AI-Powered Personalization: Every submission gets AI review; personalized recommendations based on weaknesses
3.  Multi-Tenancy: Support individual learners AND business partners with organizational hierarchies
4.  Performance SLAs: AI <5s, Dashboard <2s, CRUD <2s (per Vision requirements)
5.  Comprehensive Content: Theory lessons, coding problems, quizzes, interview practice

High-Level Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Learner   │────────>│  API Server  │────────>│  PostgreSQL │
│  (Browser)  │<────────│   (REST +    │<────────│             │
└─────────────┘         │   WebSocket) │         └─────────────┘
                        └──────┬───────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
           ┌────▼────┐    ┌───▼────┐   ┌────▼─────┐
           │  Redis  │    │ RabbitMQ│   │ AI Worker│
           │ (Cache) │    │ (Queue) │   │ (Python) │
           └─────────┘    └────┬────┘   └────┬─────┘
                               │             │
                          ┌────▼─────────────▼────┐
                          │ Execution Worker      │
                          │ (Docker Sandbox)      │
                          └───────────────────────┘
```

---

## 2. Authentication & Security

Auth Flow

- JWT Access Token: Short-lived (15-60 min), contains `{ user_id, role, email }`
- Refresh Token: Long-lived (30 days), stored hashed in DB, rotated on use
- Password: bcrypt hashed with salt rounds ≥ 12
- Email Verification: Required before login; verification tokens expire in 24h
- Password Reset: Secure token-based flow with 1-hour expiration

  Roles & Permissions

| Role               | Permissions                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `learner`          | Read lessons, submit code, take quizzes, participate in interviews, view own dashboard    |
| `instructor`       | All learner permissions + manage content (lessons, problems, quizzes) for assigned topics |
| `business_partner` | All instructor permissions + manage organization, view org-wide analytics                 |
| `admin`            | All permissions + system configuration, user management, global reports                   |
| `system_admin`     | Technical operations, database maintenance, deployment                                    |

Security Headers (All Responses)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

Rate Limiting (Redis-based)

- Submissions: 10 per minute per user (free tier), unlimited (premium)
- Auth: 5 login attempts per 15 minutes per IP
- AI Requests: 20 per hour per user (free tier), unlimited (premium)
- API Global: 100 requests per minute per IP

---

## 3. Complete REST API Design

Common Patterns

- Base URL: `https://api.codequest.com/v1`
- Authentication: `Authorization: Bearer <access_token>`
- Pagination: `?page=1&limit=20` or `?cursor={token}&limit=20`
- Filtering: `?topic=python&difficulty=medium`
- Sorting: `?sort_by=created_at&order=desc`
- Response Format: Always JSON with consistent structure

  Standard Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "cursor": "eyJpZCI6MTIzfQ=="
  },
  "error": null
}
```

Error Response Format

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

---

3.1 Authentication Endpoints

# POST /auth/register

Register new user account

```json
Request:
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "display_name": "John Doe",
  "role": "learner"  // default
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "display_name": "John Doe",
      "role": "learner",
      "email_verified": false
    },
    "message": "Registration successful. Please check your email to verify your account."
  }
}
```

# POST /auth/login

Authenticate user

```json
Request:
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "learner" },
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "expires_in": 3600
  }
}
```

# POST /auth/refresh

Refresh access token

```json
Request:
{
  "refresh_token": "eyJhbG..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",  // rotated
    "expires_in": 3600
  }
}
```

# POST /auth/logout

Invalidate refresh token

```json
Request:
{
  "refresh_token": "eyJhbG..."
}

Response: 204 No Content
```

# POST /auth/verify-email

Verify email with token

```json
Request:
{
  "token": "verification-token-from-email"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "message": "Email verified successfully. You can now log in."
  }
}
```

# POST /auth/forgot-password

Request password reset

```json
Request:
{
  "email": "student@example.com"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "message": "Password reset email sent. Check your inbox."
  }
}
```

# POST /auth/reset-password

Reset password with token

```json
Request:
{
  "token": "reset-token-from-email",
  "new_password": "NewSecurePass123!"
}

Response: 200 OK
```

---

3.2 Topics & Learning Paths

# GET /topics

List all programming topics (hierarchical)

```json
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Data Structures & Algorithms",
      "slug": "dsa",
      "description": "...",
      "icon_url": "https://cdn.../dsa.svg",
      "parent_id": null,
      "children": [
        { "id": "uuid", "name": "Arrays", "slug": "arrays", "parent_id": "uuid" },
        { "id": "uuid", "name": "Linked Lists", "slug": "linked-lists", "parent_id": "uuid" }
      ],
      "stats": {
        "total_lessons": 45,
        "total_problems": 120,
        "total_quizzes": 15
      }
    },
    {
      "id": "uuid",
      "name": "Python",
      "slug": "python",
      "description": "...",
      "parent_id": null
    }
  ]
}
```

# GET /topics/{topic_id}

Get specific topic with content summary

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Arrays",
    "slug": "arrays",
    "description": "Learn array data structures...",
    "lessons": [
      { "id": "uuid", "title": "Introduction to Arrays", "order": 1, "estimated_time_min": 15 }
    ],
    "problems": [
      { "id": "uuid", "title": "Two Sum", "difficulty": 1, "acceptance_rate": 0.45 }
    ],
    "quizzes": [
      { "id": "uuid", "title": "Arrays Fundamentals Quiz", "question_count": 10 }
    ]
  }
}
```

---

3.3 Theory Lessons

# GET /lessons

List lessons with filtering

```json
Query Params:
  ?topic_id=uuid
  &difficulty=beginner|intermediate|advanced
  &page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Introduction to Python Lists",
      "slug": "intro-python-lists",
      "topic_id": "uuid",
      "difficulty": "beginner",
      "estimated_time_min": 20,
      "order": 1,
      "has_completed": false,  // for authenticated user
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45 }
}
```

# GET /lessons/{lesson_id}

Get full lesson content

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Introduction to Python Lists",
    "content_markdown": "# Introduction to Lists\n\nLists are...",
    "examples": [
      {
        "title": "Creating a List",
        "code": "my_list = [1, 2, 3]",
        "language": "python",
        "explanation": "..."
      }
    ],
    "exercises": [
      { "id": "uuid", "title": "List Basics Practice" }
    ],
    "next_lesson_id": "uuid",
    "prev_lesson_id": "uuid",
    "progress": {
      "completed": false,
      "completed_at": null,
      "time_spent_sec": 0
    }
  }
}
```

# POST /lessons/{lesson_id}/complete

Mark lesson as completed

```json
Request:
{
  "time_spent_sec": 1200
}

Response: 200 OK
{
  "success": true,
  "data": {
    "completed": true,
    "xp_earned": 50
  }
}
```

---

3.4 Coding Problems

# GET /problems

List problems with filters

```json
Query Params:
  ?topic_id=uuid
  &difficulty=1|2|3  (1=Easy, 2=Medium, 3=Hard)
  &status=not_attempted|attempted|solved
  &tags=array,hash-table
  &page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "two-sum",
      "title": "Two Sum",
      "difficulty": 1,
      "acceptance_rate": 0.45,
      "total_submissions": 50000,
      "total_accepted": 22500,
      "tags": ["array", "hash-table"],
      "user_status": "solved",  // not_attempted | attempted | solved
      "is_premium": false
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 350 }
}
```

# GET /problems/{problem_id}

Get full problem details

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "two-sum",
    "title": "Two Sum",
    "description_markdown": "Given an array...",
    "difficulty": 1,
    "time_limit_ms": 2000,
    "memory_limit_kb": 65536,
    "input_format": "Line 1: n (array size)\nLine 2: n integers...",
    "output_format": "Two space-separated indices...",
    "constraints": "1 ≤ n ≤ 10^4\n-10^9 ≤ arr[i] ≤ 10^9",
    "sample_test_cases": [
      {
        "input": "4\n2 7 11 15\n9",
        "output": "0 1",
        "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
      }
    ],
    "hints": [
      { "level": 1, "text": "Consider using a hash table..." },
      { "level": 2, "text": "For each element, check if target - element exists..." }
    ],
    "related_problems": [
      { "id": "uuid", "title": "Three Sum", "difficulty": 2 }
    ],
    "starter_code": {
      "python": "def two_sum(nums, target):\n    # Write your code here\n    pass",
      "cpp": "vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code\n}",
      "java": "public int[] twoSum(int[] nums, int target) {\n    // Write your code\n}"
    },
    "user_progress": {
      "submission_count": 3,
      "best_submission_id": "uuid",
      "solved": true
    }
  }
}
```

# POST /problems (Instructor/Admin)

Create new problem

```json
Request:
{
  "slug": "custom-problem-1",
  "title": "Custom Problem",
  "description_markdown": "...",
  "difficulty": 2,
  "topic_ids": ["uuid1", "uuid2"],
  "tags": ["array", "sorting"],
  "time_limit_ms": 3000,
  "memory_limit_kb": 128000,
  "test_cases": [
    {
      "input": "...",
      "expected_output": "...",
      "is_sample": true,
      "points": 10
    }
  ],
  "starter_code": {
    "python": "...",
    "cpp": "..."
  },
  "is_premium": false
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "custom-problem-1",
    "created_at": "2025-11-07T10:00:00Z"
  }
}
```

---

3.5 Code Submissions & Execution

# POST /submissions

Submit code for evaluation

```json
Request:
{
  "problem_id": "uuid",
  "language": "python3.10",
  "code": "def two_sum(nums, target):\n    ...",
  "contest_id": "uuid"  // optional
}

Response: 202 Accepted
{
  "success": true,
  "data": {
    "submission_id": "uuid",
    "status": "PENDING",
    "message": "Submission queued for evaluation. You'll receive real-time updates via WebSocket."
  }
}
```

# GET /submissions/{submission_id}

Get submission details and results

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "problem_id": "uuid",
    "problem_title": "Two Sum",
    "user_id": "uuid",
    "language": "python3.10",
    "code": "def two_sum(nums, target):\n    ...",
    "status": "ACCEPTED",  // PENDING|RUNNING|ACCEPTED|FAILED|ERROR|TIMEOUT|COMPILATION_ERROR|REVIEW_PENDING|REVIEW_COMPLETE
    "points": 100,
    "passed": true,
    "submitted_at": "2025-11-07T10:15:00Z",
    "completed_at": "2025-11-07T10:15:05Z",
    "execution_summary": {
      "total_test_cases": 15,
      "passed_test_cases": 15,
      "failed_test_cases": 0,
      "max_execution_time_ms": 125,
      "max_memory_kb": 12800
    },
    "test_results": [
      {
        "test_case_id": "uuid",
        "name": "Sample Test 1",
        "status": "PASSED",
        "execution_time_ms": 45,
        "memory_kb": 8192,
        "is_sample": true,
        "input": "4\n2 7 11 15\n9",  // only for sample tests
        "expected_output": "0 1",
        "actual_output": "0 1"
      }
    ],
    "compilation_output": null,
    "ai_review": {
      "id": "uuid",
      "status": "COMPLETE",
      "overall_score": 85,
      "dimensions": {
        "correctness": 95,
        "efficiency": 80,
        "code_quality": 85,
        "best_practices": 80,
        "security": 90
      },
      "summary": "Good solution using hash table approach...",
      "strengths": [
        "Efficient O(n) time complexity",
        "Clean variable naming"
      ],
      "improvements": [
        "Consider edge case handling for empty arrays",
        "Add input validation"
      ],
      "code_suggestions": [
        {
          "line_start": 5,
          "line_end": 7,
          "current_code": "...",
          "suggested_code": "...",
          "explanation": "..."
        }
      ]
    }
  }
}
```

# GET /problems/{problem_id}/submissions

Get user's submissions for a problem

```json
Query Params:
  ?user_id=uuid  (admin/instructor can view any user)
  &status=ACCEPTED
  &page=1&limit=10

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "language": "python3.10",
      "status": "ACCEPTED",
      "points": 100,
      "submitted_at": "2025-11-07T10:15:00Z",
      "execution_time_ms": 125,
      "ai_review_score": 85
    }
  ]
}
```

# GET /submissions/{submission_id}/code

Get submission code (separate endpoint for security)

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "code": "def two_sum(nums, target):\n    ...",
    "language": "python3.10"
  }
}
```

---

3.6 AI Features

# POST /submissions/{submission_id}/ai-review

Request AI code review (auto-triggered after execution, manual re-review allowed)

```json
Request:
{
  "focus_areas": ["efficiency", "security"]  // optional
}

Response: 202 Accepted
{
  "success": true,
  "data": {
    "review_id": "uuid",
    "status": "PROCESSING",
    "estimated_time_sec": 3
  }
}
```

# GET /submissions/{submission_id}/ai-review

Get AI code review results

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "submission_id": "uuid",
    "status": "COMPLETE",
    "overall_score": 85,
    "dimensions": {
      "correctness": 95,
      "efficiency": 80,
      "code_quality": 85,
      "best_practices": 80,
      "security": 90
    },
    "summary": "Your solution correctly solves the problem using a hash table...",
    "strengths": [...],
    "improvements": [...],
    "code_suggestions": [...],
    "complexity_analysis": {
      "time_complexity": "O(n)",
      "space_complexity": "O(n)",
      "explanation": "..."
    },
    "generated_at": "2025-11-07T10:15:05Z"
  }
}
```

# POST /ai/notebook/mindmap

Generate mind map from learning content

```json
Request:
{
  "content_type": "lesson|problem|notes",
  "content_id": "uuid",  // lesson_id, problem_id, or note_id
  "custom_text": "...",  // optional: if not using existing content
  "style": "hierarchical|radial|tree"  // optional
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "mindmap",
    "structure": {
      "root": {
        "text": "Python Lists",
        "children": [
          {
            "text": "Creating Lists",
            "children": [
              { "text": "Using square brackets []" },
              { "text": "Using list() constructor" }
            ]
          },
          {
            "text": "List Methods",
            "children": [...]
          }
        ]
      }
    },
    "export_urls": {
      "png": "https://cdn.../mindmap-uuid.png",
      "pdf": "https://cdn.../mindmap-uuid.pdf",
      "json": "https://cdn.../mindmap-uuid.json"
    },
    "created_at": "2025-11-07T10:20:00Z"
  }
}
```

# POST /ai/notebook/summary

Generate summary from learning content

```json
Request:
{
  "content_type": "lesson|problem|notes",
  "content_id": "uuid",
  "custom_text": "...",  // optional
  "summary_length": "brief|standard|detailed",  // 200w | 500w | 1000w
  "format": "bullets|paragraphs|outline"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "summary",
    "summary_text": " Key Points: \n- Lists are mutable...\n- Common operations...",
    "word_count": 485,
    "created_at": "2025-11-07T10:22:00Z"
  }
}
```

# GET /users/me/learning-path

Get personalized learning recommendations

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "current_level": "intermediate",
    "weak_topics": [
      { "topic_id": "uuid", "name": "Dynamic Programming", "proficiency": 35 }
    ],
    "strong_topics": [
      { "topic_id": "uuid", "name": "Arrays", "proficiency": 85 }
    ],
    "recommended_next": [
      {
        "type": "lesson",
        "id": "uuid",
        "title": "Introduction to DP",
        "reason": "Improve weak area: Dynamic Programming"
      },
      {
        "type": "problem",
        "id": "uuid",
        "title": "Fibonacci Numbers",
        "reason": "Practice DP fundamentals"
      }
    ],
    "daily_goal": {
      "problems_to_solve": 3,
      "lessons_to_complete": 1,
      "estimated_time_min": 90
    }
  }
}
```

---

3.7 Quizzes

# GET /quizzes

List quizzes

```json
Query Params:
  ?topic_id=uuid
  &difficulty=beginner|intermediate|advanced
  &page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Python Basics Quiz",
      "topic_id": "uuid",
      "difficulty": "beginner",
      "question_count": 10,
      "time_limit_min": 15,
      "passing_score": 70,
      "attempts": 2,
      "best_score": 85
    }
  ]
}
```

# GET /quizzes/{quiz_id}

Get quiz details (without answers)

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Python Basics Quiz",
    "description": "...",
    "time_limit_min": 15,
    "passing_score": 70,
    "question_count": 10,
    "user_attempts": [
      { "attempt_id": "uuid", "score": 80, "completed_at": "2025-11-05T14:00:00Z" }
    ]
  }
}
```

# POST /quizzes/{quiz_id}/attempt

Start new quiz attempt

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "quiz_id": "uuid",
    "started_at": "2025-11-07T10:30:00Z",
    "expires_at": "2025-11-07T10:45:00Z",
    "questions": [
      {
        "id": "uuid",
        "question_text": "What is the output of print(type([]))?",
        "question_type": "multiple_choice",
        "options": [
          { "id": "a", "text": "<class 'list'>" },
          { "id": "b", "text": "<class 'array'>" },
          { "id": "c", "text": "list" },
          { "id": "d", "text": "array" }
        ],
        "points": 10
      }
    ]
  }
}
```

# POST /quizzes/attempts/{attempt_id}/submit

Submit quiz answers

```json
Request:
{
  "answers": [
    { "question_id": "uuid", "selected_option_id": "a" },
    { "question_id": "uuid", "answer_text": "O(n log n)" }
  ]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "score": 80,
    "total_points": 100,
    "correct_answers": 8,
    "total_questions": 10,
    "passed": true,
    "completed_at": "2025-11-07T10:42:00Z",
    "detailed_results": [
      {
        "question_id": "uuid",
        "is_correct": true,
        "points_earned": 10,
        "explanation": "..."
      }
    ]
  }
}
```

---

3.8 Interview Practice

# POST /interviews/quick-match

Match with available mentor

```json
Request:
{
  "interview_type": "coding|behavioral|system_design",
  "difficulty": "entry|mid|senior",
  "language": "python",
  "duration_min": 45,
  "communication_mode": "video|audio|text"
}

Response: 200 OK (match found immediately)
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "mentor": {
      "id": "uuid",
      "display_name": "Sarah Chen",
      "rating": 4.8,
      "expertise": ["Python", "Algorithms"]
    },
    "scheduled_at": "2025-11-07T11:00:00Z",
    "duration_min": 45,
    "join_url": "wss://api.codequest.com/v1/interviews/sessions/uuid"
  }
}

OR

Response: 202 Accepted (queued)
{
  "success": true,
  "data": {
    "queue_id": "uuid",
    "estimated_wait_min": 5,
    "message": "Searching for available mentor. You'll be notified when matched."
  }
}
```

# POST /interviews/schedule

Schedule interview with specific mentor/time

```json
Request:
{
  "mentor_id": "uuid",  // optional: if not specified, system assigns
  "interview_type": "coding",
  "scheduled_at": "2025-11-10T15:00:00Z",
  "duration_min": 60,
  "notes": "Want to practice tree algorithms"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "mentor": {...},
    "scheduled_at": "2025-11-10T15:00:00Z",
    "confirmation_sent": true
  }
}
```

# GET /interviews/sessions/{session_id}

Get interview session details

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "scheduled|in_progress|completed|cancelled",
    "interview_type": "coding",
    "scheduled_at": "2025-11-10T15:00:00Z",
    "started_at": null,
    "ended_at": null,
    "participants": [
      { "user_id": "uuid", "role": "interviewee", "display_name": "John Doe" },
      { "user_id": "uuid", "role": "interviewer", "display_name": "Sarah Chen" }
    ],
    "workspace_url": "wss://api.codequest.com/v1/interviews/sessions/uuid",
    "recording_enabled": false
  }
}
```

# POST /interviews/sessions/{session_id}/feedback

Submit interview feedback (by mentor)

```json
Request:
{
  "overall_rating": 4,
  "communication_rating": 5,
  "problem_solving_rating": 4,
  "technical_knowledge_rating": 3,
  "feedback_text": "Strong communication skills. Needs improvement on tree traversal algorithms.",
  "recommended_topics": ["uuid1", "uuid2"]
}

Response: 200 OK
```

# GET /users/me/interviews

Get user's interview history

```json
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "session_id": "uuid",
      "interview_type": "coding",
      "mentor_name": "Sarah Chen",
      "scheduled_at": "2025-11-07T15:00:00Z",
      "status": "completed",
      "feedback_summary": {
        "overall_rating": 4,
        "has_detailed_feedback": true
      }
    }
  ]
}
```

---

3.9 Forum & Community

# POST /forum/posts

Create forum post

```json
Request:
{
  "title": "How to optimize this solution?",
  "content_markdown": "I'm working on the Two Sum problem...",
  "topic_ids": ["uuid"],
  "tags": ["algorithms", "optimization"],
  "related_problem_id": "uuid"  // optional
}

Response: 201 Created
{
  "success": true,
  "data": {
    "post_id": "uuid",
    "created_at": "2025-11-07T11:00:00Z"
  }
}
```

# GET /forum/posts

List forum posts

```json
Query Params:
  ?topic_id=uuid
  &tags=algorithms,optimization
  &sort_by=recent|popular|unanswered
  &page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "How to optimize this solution?",
      "author": {
        "id": "uuid",
        "display_name": "John Doe",
        "reputation": 450
      },
      "created_at": "2025-11-07T11:00:00Z",
      "reply_count": 3,
      "upvotes": 12,
      "has_accepted_answer": false,
      "tags": ["algorithms", "optimization"]
    }
  ]
}
```

# POST /forum/posts/{post_id}/replies

Reply to post

```json
Request:
{
  "content_markdown": "You can optimize by using a hash table...",
  "code_snippet": {
    "language": "python",
    "code": "..."
  }
}

Response: 201 Created
```

# POST /forum/posts/{post_id}/upvote

Upvote post

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "upvotes": 13
  }
}
```

---

3.10 Dashboard & Analytics

# GET /users/me/dashboard

Get learner dashboard data

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "display_name": "John Doe",
      "level": "Intermediate",
      "xp": 2450,
      "xp_to_next_level": 550
    },
    "stats": {
      "total_submissions": 45,
      "problems_solved": 30,
      "problems_attempted": 38,
      "quiz_attempts": 12,
      "average_quiz_score": 82,
      "interview_sessions_completed": 3,
      "lessons_completed": 25,
      "current_streak_days": 7,
      "longest_streak_days": 14
    },
    "activity_chart": {
      "last_30_days": [
        { "date": "2025-10-08", "submissions": 2, "xp_earned": 150 },
        { "date": "2025-10-09", "submissions": 1, "xp_earned": 100 }
      ]
    },
    "achievements": [
      {
        "id": "uuid",
        "name": "First Blood",
        "description": "Solved your first problem",
        "icon_url": "...",
        "earned_at": "2025-10-01T10:00:00Z"
      }
    ],
    "recent_activity": [
      {
        "type": "submission",
        "problem_title": "Two Sum",
        "status": "ACCEPTED",
        "timestamp": "2025-11-07T10:15:00Z"
      }
    ],
    "recommended_next": [
      { "type": "problem", "id": "uuid", "title": "Three Sum" }
    ]
  }
}
```

# GET /users/{user_id}/profile

Get user public profile

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "display_name": "John Doe",
    "avatar_url": "...",
    "bio": "Passionate coder...",
    "level": "Intermediate",
    "reputation": 1250,
    "joined_at": "2025-08-15T00:00:00Z",
    "stats": {
      "problems_solved": 30,
      "total_submissions": 45,
      "acceptance_rate": 0.67
    },
    "badges": [
      { "name": "Quick Learner", "icon_url": "..." }
    ],
    "recent_submissions": [...]
  }
}
```

# GET /leaderboard

Global leaderboard

```json
Query Params:
  ?timeframe=weekly|monthly|all_time
  &topic_id=uuid  // optional: topic-specific leaderboard
  &limit=100

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": {
        "id": "uuid",
        "display_name": "Alice Smith",
        "avatar_url": "..."
      },
      "points": 5420,
      "problems_solved": 150
    }
  ]
}
```

---

3.11 Organizations (Business Partners)

# POST /organizations

Create organization (business partner)

```json
Request:
{
  "name": "Acme Tech University",
  "domain": "acme.edu",  // for auto-join via email
  "settings": {
    "allow_public_join": false,
    "require_approval": true
  }
}

Response: 201 Created
```

# GET /organizations/{org_id}/members

List organization members

```json
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "display_name": "Jane Instructor",
      "role": "instructor",
      "joined_at": "2025-09-01T00:00:00Z",
      "stats": {
        "assigned_learners": 25,
        "content_created": 15
      }
    }
  ]
}
```

# GET /organizations/{org_id}/analytics

Get organization-wide analytics (business partner view)

```json
Query Params:
  ?start_date=2025-10-01
  &end_date=2025-11-07

Response: 200 OK
{
  "success": true,
  "data": {
    "summary": {
      "total_learners": 150,
      "active_learners": 120,
      "total_submissions": 4500,
      "average_completion_rate": 0.72
    },
    "topic_performance": [
      {
        "topic_id": "uuid",
        "topic_name": "Python",
        "average_score": 78,
        "completion_rate": 0.85
      }
    ],
    "top_performers": [...],
    "struggling_learners": [...]
  }
}
```

---

3.12 Admin Endpoints

# GET /admin/stats

System-wide statistics

```json
Response: 200 OK
{
  "success": true,
  "data": {
    "total_users": 10000,
    "active_users_24h": 1200,
    "total_submissions_24h": 3500,
    "total_problems": 450,
    "total_lessons": 200,
    "avg_ai_review_time_sec": 3.2,
    "worker_queue_length": 12,
    "cache_hit_rate": 0.89
  }
}
```

# POST /admin/content/{content_type}/{id}/approve

Approve content for publication

```json
Request:
{
  "notes": "Approved with minor suggestions"
}

Response: 200 OK
```

# GET /admin/reports/user-activity

Generate user activity report

```json
Query Params:
  ?start_date=2025-10-01
  &end_date=2025-11-07
  &group_by=day|week|month
  &export=csv|pdf|xlsx

Response: 200 OK (or redirect to download URL)
```

---

## 4. Database Schema (PostgreSQL DDL)

4.1 Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

4.2 Core Tables

# users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'learner'
    CHECK (role IN ('learner', 'instructor', 'business_partner', 'admin', 'system_admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  xp INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Beginner',
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

# refresh_tokens

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

# email_verification_tokens

```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_verification_user ON email_verification_tokens(user_id);
```

# password_reset_tokens

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
```

---

4.3 Organizations (Multi-Tenancy)

# organizations

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,  -- for auto-join via email domain
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_domain ON organizations(domain);
```

# organization_members

```sql
CREATE TABLE organization_members (
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'instructor', 'learner')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(organization_id, role);
```

---

4.4 Content: Topics, Lessons, Problems, Quizzes

# topics

```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  parent_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_topics_parent ON topics(parent_topic_id);
CREATE INDEX idx_topics_slug ON topics(slug);
```

# lessons

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_markdown TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time_min INTEGER,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'  -- examples, resources, etc.
);

CREATE INDEX idx_lessons_topic ON lessons(topic_id, display_order);
CREATE INDEX idx_lessons_slug ON lessons(slug);
CREATE INDEX idx_lessons_published ON lessons(is_published);
```

# lesson_completions

```sql
CREATE TABLE lesson_completions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  time_spent_sec INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX idx_lesson_completions_user ON lesson_completions(user_id, completed_at DESC);
```

# languages

```sql
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  version TEXT,
  file_extension TEXT NOT NULL,
  compile_command TEXT,
  run_command TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO languages (name, version, file_extension, run_command) VALUES
  ('Python', '3.10', 'py', 'python3 {file}'),
  ('Java', '17', 'java', 'java {file}'),
  ('C++', '17', 'cpp', './a.out'),
  ('JavaScript', 'Node 18', 'js', 'node {file}');
```

# problems

```sql
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description_markdown TEXT NOT NULL,
  difficulty SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),  -- 1=Easy, 2=Medium, 3=Hard
  time_limit_ms INTEGER NOT NULL DEFAULT 2000,
  memory_limit_kb INTEGER NOT NULL DEFAULT 65536,
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  created_by UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  acceptance_rate DECIMAL(5,4),  -- calculated periodically
  total_submissions INTEGER DEFAULT 0,
  total_accepted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'  -- hints, tags, etc.
);

CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_slug ON problems(slug);
CREATE INDEX idx_problems_published ON problems(is_published);
CREATE INDEX idx_problems_acceptance_rate ON problems(acceptance_rate DESC);
```

# topic_problems (many-to-many)

```sql
CREATE TABLE topic_problems (
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  PRIMARY KEY (topic_id, problem_id)
);

CREATE INDEX idx_topic_problems_topic ON topic_problems(topic_id);
CREATE INDEX idx_topic_problems_problem ON topic_problems(problem_id);
```

# problem_starter_code

```sql
CREATE TABLE problem_starter_code (
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id),
  code TEXT NOT NULL,
  PRIMARY KEY (problem_id, language_id)
);
```

# test_cases

```sql
CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  name TEXT,
  input_encrypted TEXT NOT NULL,  -- encrypted with system key
  expected_output_encrypted TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT FALSE,
  points INTEGER DEFAULT 10,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_test_cases_problem ON test_cases(problem_id, display_order);
CREATE INDEX idx_test_cases_sample ON test_cases(problem_id, is_sample);
```

# quizzes

```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  time_limit_min INTEGER,
  passing_score INTEGER DEFAULT 70,
  created_by UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_topic ON quizzes(topic_id);
```

# quiz_questions

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'multiple_select', 'short_answer', 'code')),
  options JSONB,  -- for multiple choice: [{"id": "a", "text": "..."}]
  correct_answer JSONB NOT NULL,  -- {"option_id": "a"} or {"text": "expected answer"}
  explanation TEXT,
  points INTEGER DEFAULT 10,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id, display_order);
```

# quiz_attempts

```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  total_points INTEGER,
  passed BOOLEAN,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  answers JSONB  -- [{"question_id": "uuid", "answer": "..."}]
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id, submitted_at DESC);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
```

---

4.5 Submissions & Execution

# submissions

```sql
CREATE TYPE submission_status AS ENUM (
  'PENDING',
  'RUNNING',
  'ACCEPTED',
  'FAILED',
  'ERROR',
  'TIMEOUT',
  'COMPILATION_ERROR',
  'REVIEW_PENDING',
  'REVIEW_COMPLETE',
  'REVIEW_FAILED'
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES contests(id) ON DELETE SET NULL,
  language_id UUID NOT NULL REFERENCES languages(id),
  code TEXT NOT NULL,
  code_url TEXT,  -- S3 URL if code is large
  status submission_status DEFAULT 'PENDING',
  points INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  started_execution_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  execution_summary JSONB,  -- {total_tests, passed_tests, max_time_ms, max_memory_kb}
  compilation_output TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_submissions_user ON submissions(user_id, submitted_at DESC);
CREATE INDEX idx_submissions_problem ON submissions(problem_id, submitted_at DESC);
CREATE INDEX idx_submissions_contest ON submissions(contest_id, submitted_at DESC);
CREATE INDEX idx_submissions_status ON submissions(status);
```

# code_runs

```sql
CREATE TABLE code_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  test_case_id UUID REFERENCES test_cases(id) ON DELETE SET NULL,
  worker_id TEXT,
  status TEXT,  -- PASSED, FAILED, TIMEOUT, ERROR
  stdout TEXT,
  stderr TEXT,
  exit_code INTEGER,
  execution_time_ms INTEGER,
  memory_kb INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_code_runs_submission ON code_runs(submission_id);
```

# ai_code_reviews

```sql
CREATE TABLE ai_code_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETE', 'FAILED')),
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  dimensions JSONB,  -- {correctness: 95, efficiency: 80, code_quality: 85, ...}
  summary TEXT,
  strengths JSONB,  -- ["..."]
  improvements JSONB,  -- ["..."]
  code_suggestions JSONB,  -- [{line_start, line_end, suggestion, explanation}]
  complexity_analysis JSONB,  -- {time: "O(n)", space: "O(n)", explanation: "..."}
  generated_at TIMESTAMPTZ,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_reviews_submission ON ai_code_reviews(submission_id);
CREATE INDEX idx_ai_reviews_status ON ai_code_reviews(status);

-- Ensure one review per submission (latest)
CREATE UNIQUE INDEX idx_ai_reviews_latest ON ai_code_reviews(submission_id)
  WHERE status = 'COMPLETE';
```

---

4.6 AI Notebook Assistant

# ai_generated_content

```sql
CREATE TABLE ai_generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('mindmap', 'summary', 'flashcards')),
  source_type TEXT CHECK (source_type IN ('lesson', 'problem', 'notes', 'custom')),
  source_id UUID,  -- lesson_id, problem_id, or note_id
  generated_data JSONB NOT NULL,  -- mindmap structure, summary text, etc.
  export_urls JSONB,  -- {png: "url", pdf: "url", json: "url"}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_content_user ON ai_generated_content(user_id, created_at DESC);
CREATE INDEX idx_ai_content_type ON ai_generated_content(content_type);
```

---

4.7 Interview Practice

# interview_sessions

```sql
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interviewee_id UUID NOT NULL REFERENCES users(id),
  interviewer_id UUID REFERENCES users(id),
  interview_type TEXT CHECK (interview_type IN ('coding', 'behavioral', 'system_design')),
  difficulty TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_min INTEGER,
  communication_mode TEXT CHECK (communication_mode IN ('video', 'audio', 'text')),
  recording_enabled BOOLEAN DEFAULT FALSE,
  recording_url TEXT,
  workspace_data JSONB,  -- code snapshots, whiteboard, chat history
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interview_sessions_interviewee ON interview_sessions(interviewee_id, scheduled_at DESC);
CREATE INDEX idx_interview_sessions_interviewer ON interview_sessions(interviewer_id, scheduled_at DESC);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status, scheduled_at);
```

# interview_feedback

```sql
CREATE TABLE interview_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  problem_solving_rating INTEGER CHECK (problem_solving_rating BETWEEN 1 AND 5),
  technical_knowledge_rating INTEGER CHECK (technical_knowledge_rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  recommended_topics JSONB,  -- [topic_id1, topic_id2]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interview_feedback_session ON interview_feedback(session_id);
CREATE INDEX idx_interview_feedback_to_user ON interview_feedback(to_user_id);
```

---

4.8 Forum & Community

# forum_posts

```sql
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  related_problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
  upvotes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  has_accepted_answer BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  tags JSONB,  -- ["algorithms", "optimization"]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forum_posts_author ON forum_posts(author_id, created_at DESC);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_upvotes ON forum_posts(upvotes DESC);
CREATE INDEX idx_forum_posts_tags ON forum_posts USING GIN(tags);
```

# forum_replies

```sql
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  content_markdown TEXT NOT NULL,
  code_snippet JSONB,  -- {language: "python", code: "..."}
  upvotes INTEGER DEFAULT 0,
  is_accepted_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forum_replies_post ON forum_replies(post_id, created_at);
CREATE INDEX idx_forum_replies_author ON forum_replies(author_id);
```

# forum_votes

```sql
CREATE TABLE forum_votes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  votable_type TEXT CHECK (votable_type IN ('post', 'reply')),
  votable_id UUID NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, votable_type, votable_id)
);

CREATE INDEX idx_forum_votes_votable ON forum_votes(votable_type, votable_id);
```

---

4.9 Achievements & Gamification

# achievements

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB NOT NULL,  -- {type: "problems_solved", threshold: 10}
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed achievements
INSERT INTO achievements (name, slug, description, criteria, xp_reward, rarity) VALUES
  ('First Blood', 'first-blood', 'Solved your first problem', '{"type": "problems_solved", "threshold": 1}', 50, 'common'),
  ('Problem Solver', 'problem-solver', 'Solved 10 problems', '{"type": "problems_solved", "threshold": 10}', 200, 'rare'),
  ('Code Master', 'code-master', 'Solved 100 problems', '{"type": "problems_solved", "threshold": 100}', 1000, 'epic'),
  ('7 Day Streak', 'streak-7', 'Maintained 7 day streak', '{"type": "streak_days", "threshold": 7}', 150, 'rare');
```

# user_achievements

```sql
CREATE TABLE user_achievements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id, earned_at DESC);
```

---

4.10 Contests (Optional Module)

# contests

```sql
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',  -- scoring rules, penalties
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contests_dates ON contests(start_at, end_at);
```

# contest_problems

```sql
CREATE TABLE contest_problems (
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id),
  position INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 100,
  PRIMARY KEY (contest_id, problem_id)
);
```

# contest_participants

```sql
CREATE TABLE contest_participants (
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (contest_id, user_id)
);
```

# leaderboard_snapshot

```sql
CREATE TABLE leaderboard_snapshot (
  contest_id UUID NOT NULL,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  last_submission_at TIMESTAMPTZ,
  PRIMARY KEY (contest_id, user_id)
);

CREATE INDEX idx_leaderboard_contest_points ON leaderboard_snapshot(contest_id, points DESC);
```

---

4.11 User Activity & Analytics

# user_learning_profiles

```sql
CREATE TABLE user_learning_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_level TEXT DEFAULT 'beginner',
  weak_topics JSONB,  -- [{topic_id, proficiency_score}]
  strong_topics JSONB,
  learning_preferences JSONB,  -- {preferred_difficulty, study_time_per_day_min}
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

# analytics_events

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,  -- page_view, submission, lesson_complete, etc.
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, created_at DESC);

-- Partition by month for performance
-- ALTER TABLE analytics_events PARTITION BY RANGE (created_at);
```

---

4.12 Notes & Personal Workspace

# notes

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content_markdown TEXT,
  is_private BOOLEAN DEFAULT TRUE,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_user ON notes(user_id, updated_at DESC);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
```

---

4.13 Subscriptions & Payments

# subscription_plans

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB,  -- {max_submissions_per_day: null, ai_requests_per_hour: null, ...}
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed plans
INSERT INTO subscription_plans (name, slug, price_monthly, features) VALUES
  ('Free', 'free', 0.00, '{"max_submissions_per_day": 10, "ai_requests_per_hour": 20}'),
  ('Premium', 'premium', 9.99, '{"max_submissions_per_day": null, "ai_requests_per_hour": null}'),
  ('Organization', 'organization', 99.99, '{"max_members": null, "priority_support": true}');
```

# subscriptions

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  provider TEXT,  -- stripe, paypal
  provider_subscription_id TEXT,
  provider_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

4.14 Audit & Logging

# audit_logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  payload JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Partition by month
```

---

## 5. Redis Cache Patterns

5.1 Key Naming Convention

```
{entity}:{id}:{attribute}
{entity}:{id}
{scope}:{entity}:{filter}
```

5.2 Cache Keys & TTLs

# User Data

```
user:{user_id}:profile          → JSON (user profile)        TTL: 5 min
user:{user_id}:dashboard        → JSON (dashboard data)      TTL: 5 min
user:{user_id}:permissions      → JSON (role permissions)    TTL: 15 min
user:{user_id}:recent_submissions → LIST (submission IDs)   TTL: 10 min
```

# Problems & Lessons

```
problem:{problem_id}            → JSON (problem details)     TTL: 1 hour
lesson:{lesson_id}              → JSON (lesson content)      TTL: 1 hour
topic:{topic_id}:problems       → LIST (problem IDs)         TTL: 30 min
topics:tree                     → JSON (full topic tree)     TTL: 1 hour
```

# Submissions

```
submission:{submission_id}:live → HASH (status, progress)    TTL: 5 min (during execution)
submission:{submission_id}      → JSON (full submission)     TTL: 10 min
```

# Leaderboards (Sorted Sets)

```
contest:{contest_id}:leaderboard  → ZSET (member=user_id, score=points)  NO TTL
leaderboard:global:weekly         → ZSET                                 TTL: 1 week
leaderboard:topic:{topic_id}      → ZSET                                 TTL: 1 day
```

# Rate Limiting

```
ratelimit:submission:{user_id}    → STRING (counter)     TTL: 1 min
ratelimit:auth:{ip}               → STRING (counter)     TTL: 15 min
ratelimit:ai:{user_id}            → STRING (counter)     TTL: 1 hour
```

# Session & Auth

```
session:{session_id}              → JSON (session data)   TTL: access token lifetime
refresh_token:{token_hash}        → user_id               TTL: 30 days
```

5.3 Cache Update Patterns

# Write-Through (Dashboard)

```python
# On submission completion
def update_user_dashboard(user_id):
    # 1. Update DB
    db.execute("UPDATE users SET xp = xp + 100 WHERE id = %s", user_id)

    # 2. Invalidate cache
    redis.delete(f"user:{user_id}:dashboard")

    # OR update cache directly
    dashboard_data = compute_dashboard(user_id)
    redis.setex(f"user:{user_id}:dashboard", 300, json.dumps(dashboard_data))
```

# Lazy Load (Problems)

```python
def get_problem(problem_id):
    # Check cache
    cached = redis.get(f"problem:{problem_id}")
    if cached:
        return json.loads(cached)

    # Cache miss: load from DB
    problem = db.query("SELECT * FROM problems WHERE id = %s", problem_id)

    # Store in cache
    redis.setex(f"problem:{problem_id}", 3600, json.dumps(problem))

    return problem
```

# Leaderboard Update (ZSET)

```python
def update_contest_leaderboard(contest_id, user_id, points):
    # Update Redis sorted set
    redis.zadd(f"contest:{contest_id}:leaderboard", {f"user:{user_id}": points})

    # Persist to DB (async, eventually consistent)
    task_queue.enqueue(persist_leaderboard_snapshot, contest_id, user_id, points)
```

---

## 6. Message Queue & Workers

6.1 Job Queue Structure (RabbitMQ)

# Queues

- `code-execution` (high priority)
- `ai-review` (medium priority)
- `notifications` (low priority)
- `analytics` (low priority, batched)

  6.2 Job Payload: Code Execution

```json
{
  "job_id": "uuid",
  "job_type": "code_execution",
  "submission_id": "uuid",
  "user_id": "uuid",
  "problem_id": "uuid",
  "language": {
    "name": "python",
    "version": "3.10",
    "file_extension": "py",
    "run_command": "python3 {file}"
  },
  "code": "def two_sum(nums, target):\n    ...",
  "test_cases": [
    {
      "id": "uuid",
      "input_encrypted": "...",
      "expected_output_encrypted": "...",
      "is_sample": true,
      "points": 10
    }
  ],
  "limits": {
    "time_ms": 2000,
    "memory_kb": 65536,
    "cpu_cores": 1
  },
  "attempt": 1,
  "retry_count": 0
}
```

6.3 Worker Flow: Code Execution

```python
def execute_code_worker(job):
    submission_id = job['submission_id']

    # 1. Update submission status
    db.execute("UPDATE submissions SET status = 'RUNNING', started_execution_at = NOW() WHERE id = %s", submission_id)

    # 2. Publish real-time update
    redis.publish(f"submission:{submission_id}:events", json.dumps({
        "status": "RUNNING",
        "message": "Running test cases..."
    }))

    # 3. Create Docker container
    container = docker.run(
        image="codequest-sandbox-python:3.10",
        command=f"python3 solution.py",
        network_mode="none",  # no network
        mem_limit="65536k",
        cpu_quota=100000,  # 1 core
        timeout=2,
        volumes={"/tmp/submission-{id}": {"bind": "/workspace", "mode": "rw"}},
        security_opt=["no-new-privileges"],
        user="nobody"
    )

    results = []
    passed_count = 0

    # 4. Run each test case
    for test_case in job['test_cases']:
        # Decrypt test case
        input_data = decrypt(test_case['input_encrypted'])
        expected_output = decrypt(test_case['expected_output_encrypted'])

        # Execute
        start_time = time.time()
        result = container.exec(input_data)
        exec_time_ms = (time.time() - start_time) * 1000

        # Compare output
        passed = (result.stdout.strip() == expected_output.strip())
        if passed:
            passed_count += 1

        # Store result
        db.execute("""
            INSERT INTO code_runs (submission_id, test_case_id, status, stdout, stderr,
                                   execution_time_ms, memory_kb, exit_code)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, submission_id, test_case['id'],
             'PASSED' if passed else 'FAILED',
             result.stdout, result.stderr, exec_time_ms, result.memory_kb, result.exit_code)

        results.append({
            "test_case_id": test_case['id'],
            "passed": passed,
            "exec_time_ms": exec_time_ms
        })

    # 5. Calculate final status
    all_passed = (passed_count == len(job['test_cases']))
    status = 'ACCEPTED' if all_passed else 'FAILED'
    points = 100 if all_passed else (passed_count / len(job['test_cases'])) * 100

    # 6. Update submission
    db.execute("""
        UPDATE submissions
        SET status = %s, points = %s, passed = %s, completed_at = NOW(),
            execution_summary = %s
        WHERE id = %s
    """, status, points, all_passed, json.dumps({
        "total_test_cases": len(job['test_cases']),
        "passed_test_cases": passed_count,
        "results": results
    }), submission_id)

    # 7. Trigger AI review
    if all_passed:
        ai_review_queue.enqueue({
            "job_type": "ai_code_review",
            "submission_id": submission_id,
            "user_id": job['user_id'],
            "problem_id": job['problem_id'],
            "code": job['code'],
            "language": job['language']['name']
        })

    # 8. Update statistics
    db.execute("UPDATE problems SET total_submissions = total_submissions + 1, total_accepted = total_accepted + %s WHERE id = %s", 1 if all_passed else 0, job['problem_id'])

    # 9. Update user XP
    xp_earned = points
    db.execute("UPDATE users SET xp = xp + %s WHERE id = %s", xp_earned, job['user_id'])

    # 10. Invalidate caches
    redis.delete(f"user:{job['user_id']}:dashboard")
    redis.delete(f"problem:{job['problem_id']}")

    # 11. Publish completion event
    redis.publish(f"submission:{submission_id}:events", json.dumps({
        "status": status,
        "points": points,
        "passed": all_passed,
        "message": "Execution complete"
    }))

    # 12. Cleanup container
    container.remove()
```

6.4 Worker Flow: AI Code Review

```python
def ai_review_worker(job):
    submission_id = job['submission_id']

    # 1. Create review record
    review_id = db.execute("""
        INSERT INTO ai_code_reviews (submission_id, status)
        VALUES (%s, 'PROCESSING') RETURNING id
    """, submission_id)

    # 2. Update submission status
    db.execute("UPDATE submissions SET status = 'REVIEW_PENDING' WHERE id = %s", submission_id)

    try:
        # 3. Call AI service with timeout
        start_time = time.time()

        ai_response = requests.post(
            "https://ai-service.codequest.com/v1/code-review",
            json={
                "code": job['code'],
                "language": job['language'],
                "problem_context": get_problem_description(job['problem_id'])
            },
            timeout=5  # 5 second SLA
        )

        processing_time_ms = (time.time() - start_time) * 1000

        if ai_response.status_code != 200:
            raise Exception("AI service error")

        review_data = ai_response.json()

        # 4. Store review
        db.execute("""
            UPDATE ai_code_reviews
            SET status = 'COMPLETE',
                overall_score = %s,
                dimensions = %s,
                summary = %s,
                strengths = %s,
                improvements = %s,
                code_suggestions = %s,
                complexity_analysis = %s,
                generated_at = NOW(),
                processing_time_ms = %s
            WHERE id = %s
        """, review_data['overall_score'], json.dumps(review_data['dimensions']),
             review_data['summary'], json.dumps(review_data['strengths']),
             json.dumps(review_data['improvements']), json.dumps(review_data['code_suggestions']),
             json.dumps(review_data['complexity_analysis']), processing_time_ms, review_id)

        # 5. Update submission
        db.execute("UPDATE submissions SET status = 'REVIEW_COMPLETE' WHERE id = %s", submission_id)

        # 6. Send notification
        notification_queue.enqueue({
            "user_id": job['user_id'],
            "type": "ai_review_complete",
            "data": {"submission_id": submission_id, "score": review_data['overall_score']}
        })

    except Exception as e:
        # Handle failure
        db.execute("UPDATE ai_code_reviews SET status = 'FAILED' WHERE id = %s", review_id)
        db.execute("UPDATE submissions SET status = 'REVIEW_FAILED' WHERE id = %s", submission_id)

        # Retry logic
        if job.get('retry_count', 0) < 3:
            ai_review_queue.enqueue({ job, 'retry_count': job.get('retry_count', 0) + 1}, delay=60)
```

---

## 7. Real-time Communication

7.1 WebSocket Events (Socket.io)

# Client Connection

```javascript
// Client
const socket = io("wss://api.codequest.com", {
  auth: { token: access_token },
});

// Server authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = verifyJWT(token);
  if (user) {
    socket.user = user;
    next();
  } else {
    next(new Error("Authentication error"));
  }
});
```

# Channels & Events

Submission Updates

```javascript
// Client subscribes
socket.emit("subscribe", { channel: `submission:${submission_id}` });

// Server publishes (from worker)
redis_pubsub.publish(
  `submission:${submission_id}:events`,
  JSON.stringify({
    status: "RUNNING",
    progress: 40,
    message: "Running test case 4 of 10...",
  })
);

// Socket.io server relays
redis_subscriber.on("message", (channel, message) => {
  io.to(channel).emit("submission:update", JSON.parse(message));
});

// Client receives
socket.on("submission:update", (data) => {
  console.log("Status:", data.status, "Progress:", data.progress);
});
```

Leaderboard Updates

```javascript
// Subscribe to contest leaderboard
socket.emit("subscribe", { channel: `contest:${contest_id}:leaderboard` });

// Server publishes updates
redis_pubsub.publish(
  `contest:${contest_id}:leaderboard`,
  JSON.stringify({
    user_id: "uuid",
    rank: 5,
    points: 450,
  })
);

// Client receives
socket.on("leaderboard:update", (data) => {
  updateLeaderboardUI(data);
});
```

Interview Session (WebRTC Signaling)

```javascript
// Join interview room
socket.emit("join_interview", { session_id: "uuid" });

// WebRTC signaling
socket.on("webrtc:offer", (data) => {
  /* handle offer */
});
socket.emit("webrtc:answer", { sdp: answer });

// Shared code editor sync
socket.emit("code:update", { code: "...", cursor_position: 45 });
socket.on("code:update", (data) => {
  /* update editor */
});
```

7.2 Server-Sent Events (SSE) Alternative

```javascript
// GET /submissions/{id}/events
// Server
app.get("/submissions/:id/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const subscriber = redis.duplicate();
  subscriber.subscribe(`submission:${req.params.id}:events`);

  subscriber.on("message", (channel, message) => {
    res.write(`data: ${message}\n\n`);
  });

  req.on("close", () => {
    subscriber.unsubscribe();
    subscriber.quit();
  });
});
```

---

## 8. Performance & Scaling

8.1 Performance SLAs (from Vision Document)

| Feature         | Target      | Strategy                                                     |
| --------------- | ----------- | ------------------------------------------------------------ |
| AI Code Review  | < 5 seconds | Dedicated AI workers, circuit breaker, async processing      |
| Dashboard Load  | < 2 seconds | Aggressive Redis caching, precomputed stats, CDN             |
| CRUD Operations | < 2 seconds | DB indexes, connection pooling, query optimization           |
| Code Execution  | < 5 seconds | Fast sandboxes (Firecracker/gVisor), parallel test execution |

8.2 Database Optimization

# Connection Pooling

```javascript
// PostgreSQL connection pool
const pool = new Pool({
  max: 20, // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

# Read Replicas

```
Primary DB (writes): submissions, users, content management
Read Replicas (reads): problems, lessons, leaderboards, dashboard queries
```

# Query Optimization

```sql
-- Problematic query
SELECT * FROM submissions WHERE user_id = '...' ORDER BY created_at DESC LIMIT 20;

-- Optimized with covering index
CREATE INDEX idx_submissions_user_created ON submissions(user_id, created_at DESC)
  INCLUDE (problem_id, status, points);
```

8.3 Caching Strategy

# Multi-Level Cache

```
1. Application Memory (LRU cache) → 100ms
2. Redis (distributed cache) → 1-5ms
3. PostgreSQL (with indexes) → 10-50ms
4. PostgreSQL (full table scan) → 100ms+
```

# Cache Warming

```python
# On deployment, warm critical caches
def warm_cache():
    # Top 100 problems
    top_problems = db.query("SELECT id FROM problems ORDER BY total_submissions DESC LIMIT 100")
    for problem in top_problems:
        cache_problem(problem.id)

    # All topics tree
    topics_tree = build_topics_tree()
    redis.setex("topics:tree", 3600, json.dumps(topics_tree))
```

8.4 Horizontal Scaling

# API Servers (Stateless)

```
Load Balancer → [API-1, API-2, API-3, ..., API-N]
```

# Workers (Auto-scaling)

```
RabbitMQ → [Worker-1, Worker-2, ..., Worker-N]
Auto-scale based on queue length:
  - Queue length > 100: Add worker
  - Queue length < 20: Remove worker
```

# Database Sharding (Future)

```
Shard by user_id:
  - Shard 1: user_id hash % 4 == 0
  - Shard 2: user_id hash % 4 == 1
  - ...
```

8.5 CDN & Static Assets

```
CloudFront/CloudFlare CDN:
  - Problem images, lesson diagrams
  - User avatars
  - AI-generated mind map exports
  - Static JS/CSS bundles
```

---

## 9. Security Best Practices

9.1 Code Execution Sandbox Hardening

# Docker Security

```dockerfile
# Sandbox container
FROM python:3.10-alpine

# Run as non-root user
RUN adduser -D -u 1000 sandbox
USER sandbox

# No network
# docker run --network=none

# Resource limits
# docker run --memory="64m" --cpus="1.0" --pids-limit=50

# Read-only filesystem
# docker run --read-only --tmpfs /tmp:rw,noexec,nosuid,size=10m

# Seccomp profile (restrict syscalls)
# docker run --security-opt seccomp=/path/to/profile.json

# No new privileges
# docker run --security-opt no-new-privileges
```

# Firecracker MicroVMs (Production Alternative)

```bash
# Ultra-fast, minimal VM per execution
# Boot time: <125ms
# Memory overhead: <5MB
# Full kernel isolation
```

9.2 Input Validation & Sanitization

```python
# API input validation (using Pydantic)
from pydantic import BaseModel, validator

class SubmissionRequest(BaseModel):
    problem_id: UUID
    language: str
    code: str

    @validator('code')
    def validate_code(cls, v):
        if len(v) > 10000:  # max 10k chars
            raise ValueError('Code too long')
        if len(v.strip()) == 0:
            raise ValueError('Code cannot be empty')
        return v

    @validator('language')
    def validate_language(cls, v):
        allowed = ['python3.10', 'java17', 'cpp17', 'javascript']
        if v not in allowed:
            raise ValueError('Unsupported language')
        return v
```

9.3 SQL Injection Prevention

```python
# NEVER do this
query = f"SELECT * FROM users WHERE email = '{email}'"  # ❌ VULNERABLE

# Always use parameterized queries
query = "SELECT * FROM users WHERE email = %s"
result = db.execute(query, (email,))  # ✅ SAFE
```

9.4 Rate Limiting Implementation

```python
from redis import Redis

def check_rate_limit(user_id, action, limit, window_sec):
    key = f"ratelimit:{action}:{user_id}"
    current = redis.get(key)

    if current is None:
        redis.setex(key, window_sec, 1)
        return True
    elif int(current) < limit:
        redis.incr(key)
        return True
    else:
        return False  # rate limit exceeded

# Usage
if not check_rate_limit(user_id, 'submission', 10, 60):
    return {"error": "Rate limit exceeded. Max 10 submissions per minute."}
```

9.5 JWT Security

```python
import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv('JWT_SECRET')  # Strong random key, rotated periodically

def create_access_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(minutes=60),
        'iat': datetime.utcnow(),
        'jti': str(uuid.uuid4())  # unique token ID for revocation
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])

        # Check if token is revoked (blacklist in Redis)
        if redis.exists(f"token:revoked:{payload['jti']}"):
            raise Exception("Token revoked")

        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("Token expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid token")
```

9.6 Secrets Management

```bash
# Use environment variables or secret managers
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=<strong-random-secret>
AI_API_KEY=<ai-service-key>
STRIPE_SECRET_KEY=<payment-key>
ENCRYPTION_KEY=<for-test-cases>

# Production: AWS Secrets Manager, HashiCorp Vault
aws secretsmanager get-secret-value --secret-id codequest/production/db-password
```

---

## Summary: Revised Design Highlights

1.  AI-First Features: Dedicated AI review tables, notebook assistant endpoints
2.  Comprehensive Learning: Topics, lessons, problems, quizzes (not just coding contests)
3.  Interview Practice: Full session management, WebRTC support, feedback system
4.  Multi-Tenancy: Organizations table for business partners
5.  Performance SLAs: Redis caching patterns, async workers, optimized queries

Key Improvements Over Original Design

- Added 12 missing critical features (theory lessons, quizzes, interview, AI notebook, etc.)
- Restructured from contest-centric to learning-centric
- Added proper topics hierarchy (not just tags in JSONB)
- Dedicated AI code review tracking with dimensions
- Achievement/gamification system
- Forum with voting and accepted answers
- User learning profiles for personalization
- Comprehensive analytics events table

  Database Statistics

- Total Tables: 45+ (vs. original ~12)
- Core Entities: Users, Topics, Lessons, Problems, Quizzes, Submissions, AI Reviews, Interviews, Forum
- Total Indexes: 80+ for query optimization
- Supports: Multi-tenancy, full audit trail, analytics
- All endpoints documented with request/response examples
- Complete DDL with indexes and constraints
- Redis cache patterns defined
- Worker flows specified
- Security hardening included
- Performance targets addressed

---
