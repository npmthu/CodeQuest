# Database Requirements for Instructor & Business Features

## Current Status
Database has basic user learning features but **lacks schema for instructor course management and business partner organization features**.

---

## 1. INSTRUCTOR FEATURES - Required Tables

### 1.1 `instructor_courses` 
**Purpose:** Track courses created by instructors (separate from problems)

```sql
CREATE TABLE instructor_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(500),
  category VARCHAR(100),
  level VARCHAR(50), -- beginner, intermediate, advanced
  price DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  lessons_count INT DEFAULT 0,
  students_enrolled INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_instructor_courses_instructor_id ON instructor_courses(instructor_id);
```

### 1.2 `course_enrollments`
**Purpose:** Track which students enrolled in which courses

```sql
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES instructor_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  completion_percentage INT DEFAULT 0,
  last_accessed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'enrolled' -- enrolled, completed, dropped
);

CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE UNIQUE INDEX idx_course_enrollments_unique ON course_enrollments(course_id, user_id);
```

### 1.3 `course_revenues`
**Purpose:** Track payment/revenue from courses

```sql
CREATE TABLE course_revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES instructor_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_status VARCHAR(50) DEFAULT 'completed', -- pending, completed, refunded
  transaction_date TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_course_revenues_course_id ON course_revenues(course_id);
CREATE INDEX idx_course_revenues_user_id ON course_revenues(user_id);
```

### 1.4 `course_reviews`
**Purpose:** Store reviews and ratings for courses

```sql
CREATE TABLE course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES instructor_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX idx_course_reviews_user_id ON course_reviews(user_id);
```

---

## 2. BUSINESS PARTNER FEATURES - Required Tables

### 2.1 `business_organizations`
**Purpose:** Represent organizations that use CodeQuest

```sql
CREATE TABLE business_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  admin_id UUID NOT NULL REFERENCES users(id),
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  max_learners INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_organizations_admin_id ON business_organizations(admin_id);
```

### 2.2 `organization_members`
**Purpose:** Track which users belong to an organization

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES business_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- member, manager, admin
  department VARCHAR(100),
  joined_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE UNIQUE INDEX idx_organization_members_unique ON organization_members(organization_id, user_id);
```

### 2.3 `organization_cohorts`
**Purpose:** Learning cohorts/groups within organizations

```sql
CREATE TABLE organization_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES business_organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  max_learners INT,
  current_learners INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_organization_cohorts_organization_id ON organization_cohorts(organization_id);
```

### 2.4 `cohort_assignments`
**Purpose:** Assign courses/problems to cohorts

```sql
CREATE TABLE cohort_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES organization_cohorts(id) ON DELETE CASCADE,
  course_id UUID REFERENCES instructor_courses(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  sequence_order INT,
  is_required BOOLEAN DEFAULT TRUE,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cohort_assignments_cohort_id ON cohort_assignments(cohort_id);
```

### 2.5 `organization_analytics`
**Purpose:** Pre-computed analytics for performance

```sql
CREATE TABLE organization_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES business_organizations(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES organization_cohorts(id) ON DELETE CASCADE,
  metric_date DATE DEFAULT CURRENT_DATE,
  total_learners INT DEFAULT 0,
  active_learners INT DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  avg_score DECIMAL(5, 2) DEFAULT 0,
  problems_solved INT DEFAULT 0,
  lessons_completed INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_organization_analytics_organization_id ON organization_analytics(organization_id);
CREATE INDEX idx_organization_analytics_metric_date ON organization_analytics(metric_date);
```

---

## 3. INSTRUCTOR API ENDPOINTS (When Schema Ready)

```
GET /api/instructor/stats
  - Total courses, students, revenue, avg rating

GET /api/instructor/courses
  - List instructor's courses with enrollment count

GET /api/instructor/courses/:courseId/details
  - Course details, enrollments, reviews

GET /api/instructor/analytics
  - Revenue over time, enrollment trends

GET /api/instructor/activities
  - Recent student activities (enrollments, completions)

GET /api/instructor/reviews
  - Student reviews and ratings

POST /api/instructor/courses
  - Create new course

PUT /api/instructor/courses/:courseId
  - Update course details

DELETE /api/instructor/courses/:courseId
  - Archive/delete course
```

---

## 4. BUSINESS PARTNER API ENDPOINTS (When Schema Ready)

```
GET /api/business/stats
  - Total learners, active instructors, enrolled courses, avg completion rate

GET /api/business/organizations
  - List organizations for current business partner

GET /api/business/organizations/:orgId/cohorts
  - List cohorts in organization

GET /api/business/organizations/:orgId/analytics
  - Organization-wide analytics and reports

GET /api/business/leaderboard
  - Top performers in organization

GET /api/business/learners
  - List all learners in organization

POST /api/business/organizations
  - Create new organization

POST /api/business/organizations/:orgId/cohorts
  - Create new cohort

PUT /api/business/organizations/:orgId
  - Update organization details
```

---

## 5. CURRENT WORKAROUND (Without Schema Changes)

Until database is redesigned, can use:
- `problems` table as "instructor courses"
- `submissions` as "course enrollments"
- No revenue tracking (mock data only)
- Limited analytics

**This is NOT ideal for production but acceptable for demo/prototype.**

---

## 6. MIGRATION PRIORITY

1. **High Priority (Needed for demo):**
   - `instructor_courses` - to track instructor's content
   - `course_enrollments` - to track student-course relationship

2. **Medium Priority (For proper analytics):**
   - `course_revenues` - revenue tracking
   - `course_reviews` - ratings and feedback

3. **Low Priority (For business features):**
   - Business organization tables (can mock for now)

---

## 7. ESTIMATED EFFORT

| Table | Complexity | Time |
|-------|-----------|------|
| instructor_courses | Low | 15 min |
| course_enrollments | Low | 15 min |
| course_revenues | Medium | 20 min |
| course_reviews | Medium | 20 min |
| Business tables | High | 1 hour |
| **TOTAL** | | **~2 hours** |

---

## 8. AUTO-INITIALIZATION (Already Implemented)

When users register with different roles, the database **automatically** creates related records:

```sql
-- Trigger: handle_new_instructor()
-- Runs on: INSERT into users table
-- Actions:
--   IF role = 'instructor':
--     1. Create partner record: "Instructor Name (Instructor)"
--     2. Create instructor record linking user to partner
--   IF role = 'business':
--     1. Create partner record: "Partner Name (Partner)" with type='business'
```

**SQL Migration File:** `backend/database/create-instructor-business-records.sql`

**Status:** ✅ Ready to run in Supabase

---

## 9. RECOMMENDATION

✅ **For Tonight's Submission:**
- ✅ Submit with current schema
- ✅ Instructor/Business API endpoints working with real database queries
- ✅ Auto-initialization trigger handles role-based record creation
- ✅ Mock data clearly marked for features not in schema

✅ **For Final Project:**
- Implement instructor_courses + course_enrollments tables
- Replace mock data with real data sources
- Add revenue/payment tracking

---

## 10. API ENDPOINTS (Now Available)

### Learner (Student)
```
GET /api/users/me/stats          → User statistics & learning progress
GET /api/users/leaderboard       → Top learners ranking
```

### Instructor (After Role Assignment)
```
GET /api/instructor/stats        → Courses, students, revenue, rating
GET /api/instructor/courses      → List instructor's courses
GET /api/instructor/analytics    → Revenue & enrollment trends
GET /api/instructor/activities   → Recent student submissions
```

### Business Partner (After Role Assignment)
```
GET /api/business/stats          → Learners, instructors, courses, completion rate
GET /api/business/leaderboard    → Top performers in organization
GET /api/business/analytics      → Engagement & department trends
GET /api/business/cohorts        → Learning cohorts/groups
GET /api/business/activities     → Recent learner activities
```

All endpoints require Bearer token authentication from Supabase.

---

**Document Created:** December 1, 2025
**Status:** Implementation Complete - Ready for Deployment
