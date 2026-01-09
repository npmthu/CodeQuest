# CodeQuest - Online Learning Platform

CodeQuest is a comprehensive online learning platform that supports coding courses, interactive lessons, quizzes, and mock interviews with AI-powered feedback.

## Previous Deployment

An older version of this application from PA4 is still available at https://frontend-pa4-two.vercel.app. This deployment uses an earlier codebase but can still connect to the database and demonstrate core functionality. However, this version is extremely outdated in terms of features and UI. For the best experience and to see the more completed functionality, it is  recommended to run the application locally using this repository instead.

## Prerequisites

- Node.js
- npm package manager

## Local Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3001 by default.

## Test Accounts

The following test accounts are available after seeding the database:

### Learner Account
- Email: john@codequest.com
- Password: password123

### Instructor Account
- Email: test1@example.com
- Password: 123456

### Business Partner Account
- Email: test2@example.com
- Password: 123456

## Features

### For Learners
- Browse and enroll in courses
- Complete interactive coding lessons
- Get AI review for code submissions
- Take quizzes
- Participate in mock interviews
- Track learning progress and earn certificates
- Create study notes
- Get summary, mindmap and chat assistant via AI
- Engage in course forums

### For Instructors
- Create quizzes
- Review & analyze student submissions
- Conduct mock interviews
- Access student analytics and performance data

### For Business Partners
- Access instructor and learner analytics
- Monitor learner performance across courses
- Access detailed reporting and metrics

## Known Limitations

The following features are currently incomplete or unavailable in this version:

### Admin Dashboard
The admin-dashboard directory exists in the project but contains incomplete code. The full implementation is available in a separate branch but has not been merged due to significant differences from the main branch and time constraints.

### Payment System
Payment features are implemented in another branch and are not included in this version. The current build does not support payment transactions.

### Business Partner Features
Business partner accounts have limited functionality. They can view data related to courses, instructors, and learners that are associated with their organization, including some basic course statistics. However, the following features are not available:
- Course creation or management
- Instructor management tools
- Learner account administration
- Advanced analytics configuration

### Problem Creation
While coding problems in the system are associated with specific instructors, there is no user interface for instructors to create or modify problems. All coding problems must be added manually through direct database operations and then (optionally) linked to the appropriate instructor account.

