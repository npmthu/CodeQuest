# CodeQuest - Frontend & Backend Connection

This document describes how the frontend and backend are connected for the learner UI.

## Overview

The frontend is a React application built with Vite, using:
- **Supabase** for authentication (client-side)
- **TanStack Query** for data fetching and caching
- **Custom API hooks** for backend communication

The backend is an Express.js application that:
- Uses **Supabase Admin SDK** for database operations
- Validates **JWT tokens** from Supabase Auth
- Provides **REST API endpoints** for learners

## Architecture

```
Frontend (React + Vite)
  ↓ (Authentication)
  Supabase Auth (Client)
  ↓ (API Calls with JWT)
  Backend (Express + Supabase Admin)
  ↓ (Database)
  Supabase PostgreSQL
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure `.env`:
```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

SUPABASE_URL=https://mdymathlxreqjxoisqoa.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Start the backend:
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### 2. Database Setup

Run the SQL script in Supabase SQL Editor:
```bash
# Open Supabase Dashboard > SQL Editor
# Run the file: backend/database/init_tables.sql
```

This creates:
- `users` table
- `topics` table
- `lessons` table
- `user_lesson_progress` table
- `problems` table
- `languages` table
- `submissions` table

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Configure `.env.local`:
```env
VITE_SUPABASE_URL=https://mdymathlxreqjxoisqoa.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE=http://localhost:3000/api
```

Start the frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns Supabase session)
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Topics & Lessons
- `GET /api/topics` - List all topics
- `GET /api/topics/:id` - Get topic details with lessons
- `GET /api/lessons` - List all lessons
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons/:lessonId/progress` - Update lesson progress (protected)
- `GET /api/lessons/user/progress` - Get user's lesson progress (protected)

### Problems
- `GET /api/problems` - List all problems
- `GET /api/problems/:id` - Get problem details

### User Stats
- `GET /api/users/me/stats` - Get current user's statistics (protected)

## Frontend Components Connected

### 1. Authentication Flow
- **LoginPage**: Uses `useAuth` hook with Supabase client
- **AuthContext**: Manages authentication state
- **AuthProvider**: Wraps the entire app

### 2. Dashboard
- **Dashboard**: Fetches user stats using `useUserStats` hook
- Shows:
  - Submissions count
  - Problems solved
  - Lessons completed
  - Current XP

### 3. Lessons (HomePage)
- **HomePage**: Fetches topics using `useTopics` hook
- Displays available learning paths
- Shows lesson count per topic

### 4. Lesson Detail
- **LessonPage**: Will fetch lesson details and problems
- Track lesson progress
- Mark lessons as complete

## API Hooks Available

Located in `frontend/src/hooks/useApi.ts`:

### Auth Hooks
- `useRegister()` - Register mutation
- `useLogin()` - Login mutation
- `useLogout()` - Logout mutation
- `useCurrentUser()` - Get current user query

### Data Hooks
- `useTopics()` - Get topics query
- `useTopic(id)` - Get topic detail query
- `useLessons(topicId?)` - Get lessons query
- `useLesson(id)` - Get lesson detail query
- `useUpdateLessonProgress()` - Update progress mutation
- `useUserProgress()` - Get user progress query
- `useProblems()` - Get problems query
- `useProblem(id)` - Get problem detail query
- `useUserStats()` - Get user stats query

## Current Features Implemented

### Learner Features
✅ Login/Logout with Supabase Auth
✅ View Dashboard with real statistics
✅ Browse Topics (Learning Paths)
✅ View Lessons per Topic
✅ Track Lesson Progress
✅ View Problems
✅ User Stats & Progress

### Backend Features
✅ Authentication middleware
✅ CORS configuration
✅ User management
✅ Topics & Lessons CRUD
✅ Progress tracking
✅ Problem listing
✅ User statistics endpoint

## Next Steps

To continue development:

1. **Enhance Problem Solving**:
   - Connect CodeEditor to submission API
   - Implement code execution worker
   - Show test results

2. **Add More Lesson Content**:
   - Seed database with actual lessons
   - Add lesson content rendering
   - Implement quiz functionality

3. **Improve Progress Tracking**:
   - Add XP calculation
   - Implement streak tracking
   - Create leaderboard

4. **Add Social Features**:
   - Connect Forum to backend
   - Implement discussion threads
   - Add comments on lessons

## Testing

### Test User Creation
You can create a test user via Supabase Auth or the register endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Test Login
```bash
# Use Supabase client in frontend, or:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Backend won't start
- Check `.env` file has correct Supabase credentials
- Verify port 3000 is not in use
- Check for TypeScript errors

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check CORS_ORIGIN in backend `.env`
- Verify VITE_API_BASE in frontend `.env.local`

### Authentication fails
- Verify Supabase credentials are correct
- Check that user exists in Supabase Auth
- Verify JWT token is being sent in headers

### No data showing
- Run the init_tables.sql script in Supabase
- Verify tables exist in Supabase dashboard
- Check browser console for errors
