# Mockbros

AI-powered mock interview & competency assessment platform. Mockbros bridges the gap between job seekers and recruiters by providing structured interview practice, competency benchmarking, and AI-driven feedback.

**For job seekers:** Understand your current skill level, identify gaps, and practice before real interviews.
**For recruiters:** Evaluate candidates consistently with standardized competency frameworks and structured scoring.

## Architecture

```
mockbros/
├── src/                  # Frontend (React + Vite)
│   ├── ai-evaluator/     # AI evaluation engine (prompt, rubric, scoring)
│   └── pages/            # Application screens
├── backend/              # Backend API (Express + PostgreSQL)
│   ├── src/
│   │   ├── modules/      # interviews, assessments, feedback, content, live
│   │   ├── providers/    # AI evaluator (mock, http, openai), STT
│   │   └── shared/       # errors, validation
│   └── src/db/           # migrations, seed, client
└── docker-compose.yml    # PostgreSQL + API orchestration
```

| Layer | Stack | Port |
|---|---|---|
| Frontend | React 19, Vite 7, TypeScript, Lexend | `5173` |
| Backend | Express 4, PostgreSQL 16, Zod | `3001` |
| Database | PostgreSQL 16 (Alpine) | `5433` |
| AI Evaluator | OpenAI GPT-4o-mini (7-dimension scoring) | — |

## Competency Dictionary

Mockbros covers **8 industries** with **50+ job roles**, each mapped to a structured competency framework:

| Industry | Roles |
|---|---|
| **Marketing** | Brand Executive, Marketing Executive, Digital Marketing Specialist, Performance Marketing Specialist, Trade Marketing Executive, Marketing Manager |
| **Sales / Business Development** | Sales Executive, Account Executive, Business Development Executive, Sales Representative, Key Account Manager, Sales Manager, Regional Sales Manager |
| **Human Resources** | HR Executive, Talent Acquisition Specialist, C&B Specialist, HRBP, L&D Executive, Employer Branding Specialist, HR Manager |
| **Finance / Accounting / Audit** | Accountant, General Accountant, Chief Accountant, Finance Analyst, Internal Auditor, Tax Specialist, Finance Manager, CFO |
| **Information Technology** | Full-stack Developer, Frontend Developer, Backend Developer, Java Developer, DevOps Engineer, System Admin, IT Support, QA Tester |
| **Data / AI / Analytics** | Data Analyst, Business Intelligence Analyst, Data Engineer, Data Scientist, Machine Learning Engineer, AI Engineer |
| **Design / Creative** | Graphic Designer, UI Designer, UX Designer, Product Designer, Art Director, Creative Director, Motion Designer |
| **Content / Media / Communications** | Content Writer, Copywriter, Social Media Executive, PR Executive, Communications Specialist, Editor, Video Producer |

## Assessment Types

| Assessment | Description |
|---|---|
| **EQ Test** | 15 emotional intelligence questions across 8 dimensions: self-awareness, emotion control, empathy, motivation, communication, adaptability, teamwork, leadership |
| **IQ Test** | 15 cognitive ability questions: number sequences, logic, pattern recognition, analogies, geometry, vocabulary |
| **Technical Interview** | Role-specific questions per industry and position with rubric-based evaluation |
| **AI Mock Interview** | Real-time interview simulation with GPT-4o-mini powered feedback |
| **CV Analysis** | AI-powered CV parsing matched against competency frameworks |

## AI Evaluation Engine

7-dimension weighted scoring rubric:

| Dimension | Weight | Description |
|---|---|---|
| Relevance | 20% | Directly addresses the question |
| Technical Correctness | 20% | Accuracy for tech roles; role correctness for non-tech |
| Clarity | 15% | Clear, coherent, easy to follow |
| Structure | 15% | Logical organization (STAR for behavioral) |
| Confidence | 10% | Professional, decisive tone |
| Communication | 10% | Concise, persuasive delivery |
| Authenticity | 10% | Specific, genuine examples |

Readiness levels: `needs_practice` (<60), `almost_ready` (60–79), `ready` (≥80)

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) & Docker Compose v2+

## Quick Start

### 1. Clone

```bash
git clone https://github.com/kohebth/mockbros.git
cd mockbros
```

### 2. Docker Compose (recommended)

```bash
# Create .env with your OpenAI key
echo "OPENAI_KEY=sk-your-key-here" > .env

# Start everything
docker compose up -d --build

# Run migrations & seed
docker compose exec api npm run migrate
docker compose exec api npm run seed
```

| Service | URL |
|---|---|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:3001](http://localhost:3001) |
| PostgreSQL | `localhost:5433` |

### 3. Manual Setup (development)

```bash
# Start database
docker compose up postgres -d

# Backend
cd backend
cp .env.example .env    # Add OPENAI_KEY here
npm install
npm run migrate
npm run seed
npm run dev             # → http://localhost:3001

# Frontend (separate terminal)
cd ..
npm install
npm run dev             # → http://localhost:5173
```

## API Reference

Base URL: `http://localhost:3001`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/interview-templates` | List all interview templates |
| `GET` | `/interview-templates/:id` | Template detail with questions |
| `POST` | `/interviews` | Create interview session |
| `POST` | `/interviews/:id/start` | Start interview, get questions |
| `POST` | `/interviews/:id/answers` | Submit answers |
| `POST` | `/interviews/:id/submit` | Submit for AI evaluation |
| `GET` | `/interviews/:id/feedback` | Get structured feedback report |

### Demo Flow

```bash
# 1. List templates
curl http://localhost:3001/interview-templates

# 2. Create session
curl -X POST http://localhost:3001/interviews \
  -H "Content-Type: application/json" \
  -d '{"templateId":"<ID>","userName":"Demo","userEmail":"demo@test.dev"}'

# 3. Start → answers → submit → feedback
curl -X POST http://localhost:3001/interviews/<SESSION_ID>/start
curl -X POST http://localhost:3001/interviews/<SESSION_ID>/answers \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"<QID>","answerText":"My answer"}]}'
curl -X POST http://localhost:3001/interviews/<SESSION_ID>/submit
curl http://localhost:3001/interviews/<SESSION_ID>/feedback
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OPENAI_KEY` | — | OpenAI API key for AI evaluation |
| `AI_PROVIDER` | `openai` | `mock`, `http`, or `openai` |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `PORT` | `3001` | API server port |
| `NODE_ENV` | `development` | Runtime environment |

## Design System

| Token | Value |
|---|---|
| Font | Lexend family |
| Primary | `#FFFFFF` |
| Secondary | `#000000` |
| Accent | `#FFD700` |

Defined as CSS variables in `src/styles.css`.

## Scripts

### Frontend

```bash
npm run dev       # Vite dev server (port 5173)
npm run build     # Production build
npm run lint      # ESLint
```

### Backend

```bash
cd backend
npm run dev       # Express dev server with hot reload
npm run migrate   # Apply SQL migrations
npm run seed      # Seed templates & questions
npm run smoke     # Run smoke tests
```

## License

MIT
