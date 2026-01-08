# CodeQuest Backend API

Learning platform backend built with Node.js, Express, PostgreSQL, and Redis.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Message Queue**: RabbitMQ
- **Code Execution**: Docker sandboxes
- **AI**: OpenAI GPT-4
- **Object Storage**: AWS S3 / MinIO

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (for code execution)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

## Project Structure

See `BACKEND_STRUCTURE.md` for detailed information about the folder structure.

## API Documentation

Base URL: `http://localhost:3000/api/v1`

See `CodeQuest-API-DB-v2.md` for complete API documentation.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```
