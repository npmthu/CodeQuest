# CodeQuest Backend Structure Documentation

## Overview

This document explains the complete folder structure of the CodeQuest backend API, the purpose of each directory and file, and suggestions for implementation.

## Technology Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15+ (with uuid-ossp, pgcrypto extensions)
- **Cache**: Redis 7+ (caching, pub/sub, rate limiting)
- **Message Queue**: RabbitMQ or Redis Streams
- **Code Execution**: Docker sandboxes with security constraints
- **Real-time**: WebSocket (Socket.io) for live updates
- **Object Storage**: AWS S3 or MinIO for file storage
- **AI Services**: OpenAI GPT-4 API integration
- **Testing**: Jest for unit and integration tests

---

## Root Directory Files

### `package.json`
**Purpose**: Node.js project configuration and dependency management

**Suggested Dependencies**:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.0.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "amqplib": "^0.10.3",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "joi": "^17.9.0",
    "dotenv": "^16.0.3",
    "winston": "^3.10.0",
    "nodemailer": "^6.9.0",
    "socket.io": "^4.6.0",
    "aws-sdk": "^2.1400.0",
    "openai": "^4.0.0",
    "dockerode": "^3.3.5",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.8.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.17",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.2",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "supertest": "^6.3.0",
    "@types/jest": "^29.5.0",
    "eslint": "^8.43.0",
    "prettier": "^3.0.0"
  }
}
```

### `tsconfig.json`
**Purpose**: TypeScript compiler configuration
- Compiles TypeScript to JavaScript in `dist/` folder
- Enables strict type checking for better code quality
- Configured for Node.js CommonJS module system

### `.env.example`
**Purpose**: Template for environment variables
- Copy to `.env` for local development
- Contains all configuration needed (database, Redis, JWT secrets, API keys)
- Never commit actual `.env` file to version control

### `.gitignore`
**Purpose**: Specifies files Git should ignore
- Excludes `node_modules/`, `dist/`, `.env`, logs, etc.

### `Dockerfile`
**Purpose**: Container configuration for the API server
- Multi-stage build for optimized production image
- Based on Node.js 18 Alpine for smaller image size
- Runs the compiled application on port 3000

### `docker-compose.yml`
**Purpose**: Orchestrates all required services
- API server, PostgreSQL, Redis, RabbitMQ
- Easy local development setup with `docker-compose up`
- Manages networking and volumes between containers

### `jest.config.js`
**Purpose**: Jest testing framework configuration
- Runs TypeScript tests with ts-jest
- Configures test paths and coverage reporting

### `README.md`
**Purpose**: Project documentation and setup instructions
- Getting started guide
- Installation steps
- Running the application

---

## `/src` - Source Code Directory

### `/src/server.ts`
**Purpose**: Main application entry point

**Implementation Suggestions**:
```typescript
import app from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { connectQueue } from './config/queue';
import { initWebSocket } from './config/websocket';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected');
    
    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected');
    
    // Connect to message queue
    await connectQueue();
    logger.info('Message queue connected');
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
    
    // Initialize WebSocket
    initWebSocket(server);
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### `/src/app.ts`
**Purpose**: Express application setup and middleware configuration

**Implementation Suggestions**:
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger as loggerMiddleware } from './middleware/logger';
import { corsConfig } from './middleware/cors';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(corsConfig));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(loggerMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
```

---

## `/src/config` - Configuration Files

### `/src/config/index.ts`
**Purpose**: Central configuration object from environment variables

**Implementation**:
```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  apiVersion: process.env.API_VERSION || 'v1',
  
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '1h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  },
  
  email: {
    service: process.env.EMAIL_SERVICE,
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
    from: process.env.EMAIL_FROM,
  },
  
  ai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
  },
  
  storage: {
    bucket: process.env.S3_BUCKET_NAME,
    region: process.env.S3_REGION,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT,
  },
};
```

### `/src/config/database.ts`
**Purpose**: PostgreSQL connection pool setup

**Implementation**:
```typescript
import { Pool } from 'pg';
import { config } from './index';
import logger from '../utils/logger';

let pool: Pool;

export async function connectDatabase() {
  pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl,
    max: 20, // maximum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  pool.on('error', (err) => {
    logger.error('Unexpected database error:', err);
  });
  
  // Test connection
  const client = await pool.connect();
  await client.query('SELECT NOW()');
  client.release();
}

export function getPool() {
  return pool;
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug('Executed query', { text, duration, rows: res.rowCount });
  return res;
}
```

### `/src/config/redis.ts`
**Purpose**: Redis client configuration for caching and rate limiting

**Implementation**:
```typescript
import { createClient } from 'redis';
import { config } from './index';
import logger from '../utils/logger';

let redisClient: ReturnType<typeof createClient>;

export async function connectRedis() {
  redisClient = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
    },
    password: config.redis.password,
    database: config.redis.db,
  });
  
  redisClient.on('error', (err) => {
    logger.error('Redis error:', err);
  });
  
  await redisClient.connect();
}

export function getRedisClient() {
  return redisClient;
}
```

### `/src/config/queue.ts`
**Purpose**: RabbitMQ message queue configuration

**Implementation**:
```typescript
import amqp from 'amqplib';
import { config } from './index';
import logger from '../utils/logger';

let connection: amqp.Connection;
let channel: amqp.Channel;

export async function connectQueue() {
  connection = await amqp.connect(process.env.RABBITMQ_URL!);
  channel = await connection.createChannel();
  
  // Declare queues
  await channel.assertQueue('code-execution', { durable: true });
  await channel.assertQueue('ai-processing', { durable: true });
  await channel.assertQueue('email-sending', { durable: true });
  
  logger.info('Message queue connected');
}

export function getChannel() {
  return channel;
}
```

### `/src/config/storage.ts`
**Purpose**: S3/MinIO object storage configuration

**Implementation**:
```typescript
import AWS from 'aws-sdk';
import { config } from './index';

export const s3 = new AWS.S3({
  accessKeyId: config.storage.accessKey,
  secretAccessKey: config.storage.secretKey,
  endpoint: config.storage.endpoint,
  region: config.storage.region,
  s3ForcePathStyle: true, // needed for MinIO
});

export const bucketName = config.storage.bucket!;
```

### `/src/config/websocket.ts`
**Purpose**: WebSocket server for real-time updates

**Implementation**:
```typescript
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '../services/authService';
import logger from '../utils/logger';

let io: SocketIOServer;

export function initWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
    path: process.env.WS_PATH || '/ws',
  });
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = await verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });
  
  io.on('connection', (socket) => {
    logger.info(`WebSocket connected: ${socket.data.user.id}`);
    
    // Join user's personal room
    socket.join(`user:${socket.data.user.id}`);
    
    socket.on('disconnect', () => {
      logger.info(`WebSocket disconnected: ${socket.data.user.id}`);
    });
  });
  
  logger.info('WebSocket server initialized');
}

export function getIO() {
  return io;
}
```

---

## `/src/middleware` - Request Middleware

### `/src/middleware/auth.ts`
**Purpose**: JWT authentication middleware

**Implementation**:
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    
    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    
    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
```

### `/src/middleware/rbac.ts`
**Purpose**: Role-based access control

**Implementation**:
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ForbiddenError } from '../utils/errors';

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('User not authenticated'));
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    
    next();
  };
}

// Example usage: requireRole('admin', 'instructor')
```

### `/src/middleware/rateLimiter.ts`
**Purpose**: Redis-based rate limiting

**Implementation**:
```typescript
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { TooManyRequestsError } from '../utils/errors';

export function rateLimiter(
  maxRequests: number,
  windowMs: number,
  keyPrefix: string = 'rate-limit'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redis = getRedisClient();
      const key = `${keyPrefix}:${req.ip}`;
      
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, Math.floor(windowMs / 1000));
      }
      
      if (current > maxRequests) {
        throw new TooManyRequestsError('Too many requests');
      }
      
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      
      next();
    } catch (error) {
      next(error);
    }
  };
}
```

### `/src/middleware/validator.ts`
**Purpose**: Request validation using Joi schemas

**Implementation**:
```typescript
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      
      return next(new ValidationError('Validation failed', details));
    }
    
    req.body = value;
    next();
  };
}
```

### `/src/middleware/errorHandler.ts`
**Purpose**: Global error handling middleware

**Implementation**:
```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }
  
  // Unexpected errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

### `/src/middleware/logger.ts`
**Purpose**: HTTP request logging

**Implementation**:
```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  
  next();
}
```

### `/src/middleware/cors.ts`
**Purpose**: CORS configuration

**Implementation**:
```typescript
import cors from 'cors';

export const corsConfig = cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## `/src/models` - Database Models

Each model file should define the TypeScript interface and database operations.

### `/src/models/User.ts`
**Purpose**: User model with authentication data

**Implementation**:
```typescript
import { query } from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  role: 'learner' | 'instructor' | 'business_partner' | 'admin';
  email_verified: boolean;
  avatar_url?: string;
  bio?: string;
  xp_points: number;
  streak_days: number;
  organization_id?: string;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async create(userData: Partial<User>) {
    const { email, password, display_name, role } = userData;
    const password_hash = await bcrypt.hash(password, 12);
    
    const result = await query(
      `INSERT INTO users (email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [email, password_hash, display_name, role || 'learner']
    );
    
    return result.rows[0];
  }
  
  static async findById(id: string) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
  
  static async findByEmail(email: string) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }
  
  static async update(id: string, updates: Partial<User>) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    
    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    return result.rows[0];
  }
  
  static async verifyPassword(user: User, password: string) {
    return bcrypt.compare(password, user.password_hash);
  }
}
```

### `/src/models/Problem.ts`
**Purpose**: Coding problem model

**Structure**:
- Problem details (title, description, difficulty)
- Test cases (input, expected output)
- Constraints and hints
- Acceptance rate and statistics
- Relations to topics and submissions

### `/src/models/Submission.ts`
**Purpose**: Code submission model

**Structure**:
- User and problem relation
- Code content and language
- Execution results (status, time, memory)
- Test case results
- AI review data
- Timestamps

---

## `/src/controllers` - Request Handlers

Controllers handle HTTP requests and responses. They use services for business logic.

### `/src/controllers/authController.ts`
**Purpose**: Authentication endpoints

**Endpoints to implement**:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/verify-email` - Verify email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

**Example**:
```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { successResponse } from '../utils/responseFormatter';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
  
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
  
  // ... other methods
}
```

### `/src/controllers/submissionController.ts`
**Purpose**: Code submission endpoints

**Endpoints**:
- `POST /submissions` - Submit code
- `GET /submissions/:id` - Get submission details
- `GET /problems/:problemId/submissions` - List user submissions
- `GET /submissions/:id/code` - Get submission code

### `/src/controllers/aiController.ts`
**Purpose**: AI features endpoints

**Endpoints**:
- `POST /submissions/:id/ai-review` - Request AI review
- `GET /submissions/:id/ai-review` - Get AI review results
- `POST /ai/notebook/mindmap` - Generate mind map
- `POST /ai/notebook/summary` - Generate summary
- `GET /users/me/learning-path` - Get personalized learning path

---

## `/src/routes` - Route Definitions

Routes connect URLs to controller methods.

### `/src/routes/index.ts`
**Purpose**: Main router combining all routes

**Implementation**:
```typescript
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import topicRoutes from './topic.routes';
import lessonRoutes from './lesson.routes';
import problemRoutes from './problem.routes';
import submissionRoutes from './submission.routes';
import quizRoutes from './quiz.routes';
import interviewRoutes from './interview.routes';
import forumRoutes from './forum.routes';
import aiRoutes from './ai.routes';
import organizationRoutes from './organization.routes';
import adminRoutes from './admin.routes';
import leaderboardRoutes from './leaderboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/topics', topicRoutes);
router.use('/lessons', lessonRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/quizzes', quizRoutes);
router.use('/interviews', interviewRoutes);
router.use('/forum', forumRoutes);
router.use('/ai', aiRoutes);
router.use('/organizations', organizationRoutes);
router.use('/admin', adminRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;
```

### `/src/routes/auth.routes.ts`
**Purpose**: Authentication routes

**Implementation**:
```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validator';
import { registerSchema, loginSchema } from '../validators/authValidators';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;
```

### `/src/routes/submission.routes.ts`
**Purpose**: Submission routes

**Implementation**:
```typescript
import { Router } from 'express';
import { SubmissionController } from '../controllers/submissionController';
import { authenticate } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Rate limit: 10 submissions per minute
router.post(
  '/',
  rateLimiter(10, 60000, 'submission'),
  SubmissionController.create
);

router.get('/:id', SubmissionController.getById);
router.get('/:id/code', SubmissionController.getCode);

export default router;
```

---

## `/src/services` - Business Logic

Services contain the core business logic, separated from controllers.

### `/src/services/authService.ts`
**Purpose**: Authentication business logic

**Functions to implement**:
- `register()` - Create user, send verification email
- `login()` - Verify credentials, generate tokens
- `verifyToken()` - Validate JWT token
- `refreshToken()` - Generate new access token
- `generateResetToken()` - Create password reset token
- `resetPassword()` - Update password with valid token

### `/src/services/codeExecutionService.ts`
**Purpose**: Execute code in Docker sandbox

**Implementation approach**:
```typescript
import Docker from 'dockerode';
import { getChannel } from '../config/queue';

export class CodeExecutionService {
  static async executeCode(submission: {
    code: string;
    language: string;
    problemId: string;
    testCases: any[];
  }) {
    // Queue the execution job
    const channel = getChannel();
    await channel.sendToQueue(
      'code-execution',
      Buffer.from(JSON.stringify(submission)),
      { persistent: true }
    );
    
    return { status: 'queued' };
  }
  
  static async runInSandbox(code: string, language: string, input: string) {
    const docker = new Docker();
    
    // Create container with resource limits
    const container = await docker.createContainer({
      Image: 'codequest-sandbox:latest',
      Cmd: [language, code, input],
      HostConfig: {
        Memory: 128 * 1024 * 1024, // 128MB
        NanoCpus: 1000000000, // 1 CPU
        NetworkMode: 'none', // No network access
        PidsLimit: 50,
      },
      AttachStdout: true,
      AttachStderr: true,
    });
    
    // Start and wait for completion (with timeout)
    await container.start();
    
    const result = await Promise.race([
      container.wait(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      ),
    ]);
    
    // Get output
    const logs = await container.logs({
      stdout: true,
      stderr: true,
    });
    
    // Cleanup
    await container.remove();
    
    return {
      output: logs.toString(),
      exitCode: result.StatusCode,
    };
  }
}
```

### `/src/services/aiService.ts`
**Purpose**: OpenAI integration for code review

**Implementation**:
```typescript
import OpenAI from 'openai';
import { config } from '../config';

const openai = new OpenAI({
  apiKey: config.ai.apiKey,
});

export class AIService {
  static async reviewCode(code: string, problem: string) {
    const prompt = `
      Review this code solution for the following problem:
      
      Problem: ${problem}
      
      Code:
      ${code}
      
      Provide:
      1. Overall assessment (1-5 stars)
      2. Time complexity analysis
      3. Space complexity analysis
      4. Strengths (2-3 points)
      5. Areas for improvement (2-3 points)
      6. Alternative approaches
    `;
    
    const response = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert coding instructor providing constructive feedback.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: config.ai.maxTokens,
      temperature: 0.7,
    });
    
    return response.choices[0].message.content;
  }
  
  static async generateMindMap(content: string) {
    // Generate mind map structure from learning content
  }
  
  static async generateSummary(content: string) {
    // Generate summary from learning content
  }
  
  static async generateLearningPath(userProgress: any) {
    // Analyze weaknesses and recommend next steps
  }
}
```

### `/src/services/emailService.ts`
**Purpose**: Send emails via SMTP

**Functions**:
- `sendVerificationEmail()` - Email verification link
- `sendPasswordResetEmail()` - Password reset link
- `sendNotificationEmail()` - General notifications

### `/src/services/cacheService.ts`
**Purpose**: Redis caching operations

**Functions**:
- `get()`, `set()`, `del()` - Basic cache operations
- `setWithExpiry()` - Set with TTL
- `cacheDecorator()` - Decorator for automatic caching

---

## `/src/validators` - Request Validation Schemas

Use Joi for input validation.

### `/src/validators/authValidators.ts`
**Implementation**:
```typescript
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/[A-Z]/).pattern(/[a-z]/).pattern(/[0-9]/).required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers',
    }),
  display_name: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('learner', 'instructor', 'business_partner').default('learner'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
```

---

## `/src/utils` - Utility Functions

### `/src/utils/responseFormatter.ts`
**Purpose**: Standardize API responses

**Implementation**:
```typescript
export function successResponse(data: any, meta?: any) {
  return {
    success: true,
    data,
    meta,
    error: null,
  };
}

export function errorResponse(code: string, message: string, details?: any) {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      details,
    },
  };
}
```

### `/src/utils/errors.ts`
**Purpose**: Custom error classes

**Implementation**:
```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string) {
    super(429, 'TOO_MANY_REQUESTS', message);
  }
}
```

### `/src/utils/logger.ts`
**Purpose**: Winston logger configuration

**Implementation**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export default logger;
```

### `/src/utils/constants.ts`
**Purpose**: Application constants

**Example**:
```typescript
export const ROLES = {
  LEARNER: 'learner',
  INSTRUCTOR: 'instructor',
  BUSINESS_PARTNER: 'business_partner',
  ADMIN: 'admin',
  SYSTEM_ADMIN: 'system_admin',
} as const;

export const DIFFICULTY = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
} as const;

export const SUBMISSION_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  ACCEPTED: 'accepted',
  WRONG_ANSWER: 'wrong_answer',
  TIME_LIMIT_EXCEEDED: 'time_limit_exceeded',
  MEMORY_LIMIT_EXCEEDED: 'memory_limit_exceeded',
  RUNTIME_ERROR: 'runtime_error',
  COMPILATION_ERROR: 'compilation_error',
} as const;

export const SUPPORTED_LANGUAGES = [
  'python3.10',
  'javascript',
  'typescript',
  'cpp17',
  'java17',
  'go',
] as const;
```

---

## `/src/workers` - Background Workers

Workers process jobs from the message queue.

### `/src/workers/codeExecutionWorker.ts`
**Purpose**: Process code execution jobs

**Implementation**:
```typescript
import { getChannel } from '../config/queue';
import { CodeExecutionService } from '../services/codeExecutionService';
import { getIO } from '../config/websocket';
import logger from '../utils/logger';

export async function startCodeExecutionWorker() {
  const channel = getChannel();
  
  await channel.consume('code-execution', async (msg) => {
    if (!msg) return;
    
    try {
      const submission = JSON.parse(msg.content.toString());
      
      logger.info(`Processing submission ${submission.id}`);
      
      // Execute code and run test cases
      const results = await CodeExecutionService.runTestCases(submission);
      
      // Save results to database
      await SubmissionModel.updateResults(submission.id, results);
      
      // Notify user via WebSocket
      const io = getIO();
      io.to(`user:${submission.userId}`).emit('submission-complete', {
        submissionId: submission.id,
        status: results.status,
      });
      
      // Acknowledge message
      channel.ack(msg);
      
      logger.info(`Completed submission ${submission.id}`);
    } catch (error) {
      logger.error('Error processing submission:', error);
      // Requeue or send to dead letter queue
      channel.nack(msg, false, true);
    }
  });
  
  logger.info('Code execution worker started');
}
```

### `/src/workers/aiWorker.ts`
**Purpose**: Process AI review jobs

**Similar structure** - consumes from 'ai-processing' queue

### `/src/workers/emailWorker.ts`
**Purpose**: Process email sending jobs

**Similar structure** - consumes from 'email-sending' queue

---

## `/src/database` - Database Files

### `/src/database/schema.sql`
**Purpose**: Complete database schema

**Should include**:
- All table definitions
- Indexes for performance
- Foreign key constraints
- Check constraints
- Triggers (e.g., auto-update timestamps)

**Example tables**:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'learner',
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,
  xp_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  parent_id UUID REFERENCES topics(id),
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Problems table
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description_markdown TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty IN (1, 2, 3)),
  time_limit_ms INTEGER DEFAULT 2000,
  memory_limit_kb INTEGER DEFAULT 65536,
  acceptance_rate DECIMAL(5, 2),
  is_premium BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_slug ON problems(slug);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  problem_id UUID NOT NULL REFERENCES problems(id),
  language VARCHAR(50) NOT NULL,
  code TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  execution_time_ms INTEGER,
  memory_used_kb INTEGER,
  test_results JSONB,
  ai_review_id UUID,
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submissions_user_problem ON submissions(user_id, problem_id);
CREATE INDEX idx_submissions_status ON submissions(status);
```

### `/src/database/migrations/`
**Purpose**: Version-controlled database changes

Each migration should:
- Have a sequential number prefix
- Be idempotent (can run multiple times safely)
- Include both UP and DOWN migrations

### `/src/database/seeds/`
**Purpose**: Sample data for development/testing

Seed files should:
- Insert initial data (admin users, sample problems, etc.)
- Be safe to run in development only
- Use realistic data

---

## `/tests` - Test Files

### `/tests/unit/`
**Purpose**: Test individual functions/classes in isolation

**Example**: `/tests/unit/authService.test.ts`
```typescript
import { AuthService } from '../../src/services/authService';
import { UserModel } from '../../src/models/User';

jest.mock('../../src/models/User');

describe('AuthService', () => {
  describe('register', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        display_name: 'Test User',
      };
      
      UserModel.findByEmail = jest.fn().mockResolvedValue(null);
      UserModel.create = jest.fn().mockResolvedValue({ id: '123', ...userData });
      
      const result = await AuthService.register(userData);
      
      expect(result).toHaveProperty('id');
      expect(UserModel.create).toHaveBeenCalled();
    });
    
    it('should throw error if email exists', async () => {
      UserModel.findByEmail = jest.fn().mockResolvedValue({ id: '123' });
      
      await expect(AuthService.register({ email: 'existing@example.com' }))
        .rejects.toThrow('Email already exists');
    });
  });
});
```

### `/tests/integration/`
**Purpose**: Test complete API endpoints

**Example**: `/tests/integration/auth.test.ts`
```typescript
import request from 'supertest';
import app from '../../src/app';

describe('POST /api/v1/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Password123!',
        display_name: 'New User',
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('user');
  });
  
  it('should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email',
        password: 'Password123!',
        display_name: 'Test',
      });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

---

## `/docker` - Docker Files

### `/docker/sandbox.Dockerfile`
**Purpose**: Secure execution environment

**Security considerations**:
- No network access
- Limited CPU and memory
- Non-root user
- Restricted file system access
- Process limits

---

## `/scripts` - Utility Scripts

### `/scripts/migrate.js`
**Purpose**: Run database migrations

**Implementation**:
```javascript
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigrations() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Create migrations table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);
  
  // Get list of executed migrations
  const { rows } = await pool.query('SELECT name FROM migrations');
  const executed = new Set(rows.map(r => r.name));
  
  // Read migration files
  const migrationsDir = path.join(__dirname, '../src/database/migrations');
  const files = fs.readdirSync(migrationsDir).sort();
  
  for (const file of files) {
    if (executed.has(file)) continue;
    
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      await pool.query('COMMIT');
      console.log(`✓ ${file}`);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(`✗ ${file}:`, error.message);
      process.exit(1);
    }
  }
  
  await pool.end();
  console.log('All migrations completed');
}

runMigrations();
```

### `/scripts/seed.js`
**Purpose**: Populate database with sample data

---

## Implementation Priority

Suggested order for implementing the backend:

### Phase 1: Foundation (Week 1-2)
1. Set up project structure and configuration
2. Database schema and migrations
3. User model and authentication
4. Basic CRUD endpoints for users
5. JWT middleware and error handling

### Phase 2: Core Features (Week 3-4)
6. Topics and lessons models/endpoints
7. Problems model and CRUD
8. Code submission (without execution)
9. Basic caching with Redis

### Phase 3: Advanced Features (Week 5-6)
10. Code execution with Docker
11. WebSocket for real-time updates
12. AI integration for code review
13. Quiz system

### Phase 4: Business Features (Week 7-8)
14. Interview scheduling and matching
15. Forum and community features
16. Organization management
17. Analytics and leaderboards

### Phase 5: Polish (Week 9-10)
18. Comprehensive testing
19. Performance optimization
20. Documentation
21. Deployment setup

---

## Key Implementation Notes

### Security Checklist
- ✓ Password hashing with bcrypt (12+ rounds)
- ✓ JWT with short expiry times
- ✓ Rate limiting on all endpoints
- ✓ Input validation on all requests
- ✓ SQL injection prevention (parameterized queries)
- ✓ XSS prevention (sanitize inputs)
- ✓ CORS properly configured
- ✓ Security headers (helmet)
- ✓ Docker sandbox isolation
- ✓ Environment variables for secrets

### Performance Checklist
- ✓ Database indexes on frequently queried columns
- ✓ Redis caching for expensive queries
- ✓ Pagination for large result sets
- ✓ WebSocket for real-time updates (avoid polling)
- ✓ Background workers for heavy tasks
- ✓ Connection pooling for database
- ✓ Compression for responses
- ✓ CDN for static assets

### Code Quality Checklist
- ✓ TypeScript for type safety
- ✓ ESLint and Prettier for code style
- ✓ Comprehensive error handling
- ✓ Logging for debugging
- ✓ Unit and integration tests
- ✓ Code comments for complex logic
- ✓ Consistent naming conventions
- ✓ Modular, reusable code

---

## Next Steps

1. **Install dependencies**: Run `npm install` after adding dependencies to `package.json`
2. **Set up environment**: Copy `.env.example` to `.env` and fill in values
3. **Start services**: Use `docker-compose up` to start PostgreSQL, Redis, RabbitMQ
4. **Run migrations**: Execute `npm run migrate` to create database tables
5. **Start development**: Run `npm run dev` to start the server with hot reload
6. **Begin implementation**: Start with Phase 1 (Foundation) as outlined above

---

## Additional Resources

- **Express.js Docs**: https://expressjs.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Redis Docs**: https://redis.io/docs/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Docker Docs**: https://docs.docker.com/
- **OpenAI API**: https://platform.openai.com/docs/

---

**Document Version**: 1.0  
**Last Updated**: November 21, 2025  
**Author**: CodeQuest Backend Team
