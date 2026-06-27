# Mockbros Backend - Local Development Guide

## Prerequisites

- Node.js 22+
- Docker & Docker Compose
- npm

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up postgres -d
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

API starts at `http://localhost:3000`.

### 3. Verify

```bash
curl http://localhost:3000/health
```

### 4. Run Smoke Test

```bash
cd backend
bash scripts/smoke-test.sh
```

## Docker Compose (Full Stack)

```bash
docker compose up
```

This starts both PostgreSQL and the API service.

## Database Commands

| Command | Description |
|---|---|
| `npm run db:migrate:dev` | Create new migration |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed interview templates |
| `npm run db:reset` | Reset DB + re-seed |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment |
| `PORT` | `3000` | API port |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `JWT_SECRET` | - | JWT signing secret |
| `AI_PROVIDER` | `mock` | `mock` or `http` |
| `AI_SERVICE_URL` | - | URL for HTTP AI evaluator |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/interview-templates` | List templates |
| GET | `/interview-templates/:id` | Template detail + questions |
| POST | `/interviews` | Create interview session |
| POST | `/interviews/:id/start` | Start interview |
| POST | `/interviews/:id/answers` | Submit answers |
| POST | `/interviews/:id/submit` | Submit for AI evaluation |
| GET | `/interviews/:id/feedback` | Get feedback report |

## Demo Flow

1. `GET /interview-templates` → Pick a template
2. `POST /interviews` → Create session with template ID
3. `POST /interviews/:id/start` → Get questions
4. `POST /interviews/:id/answers` → Send all answers
5. `POST /interviews/:id/submit` → Get AI feedback
6. `GET /interviews/:id/feedback` → Display report
