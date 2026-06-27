# Mockbros Hackathon Tasks - Senior Backend Engineer

## Context

Mockbros is a mock interview product. For the hackathon demo, the product must show one complete vertical slice:

1. Candidate chooses an interview type.
2. Candidate answers a small set of interview questions.
3. Backend submits answers to an AI evaluator.
4. Candidate receives a structured feedback report.

Deadline: **15:45 today**.

This is a hackathon build. Prioritize demo reliability over production completeness. Use simple, readable implementation choices. Avoid LiveKit, payments, full admin dashboards, and complex background workers unless the vertical slice is already stable.

## Role

You are the senior backend engineer. Own:

- Overall technical architecture.
- Backend implementation.
- Local orchestration.
- API contracts for UI and AI integration.
- Final demo stability.

## Recommended Stack

- Node.js + TypeScript.
- Express or Fastify.
- PostgreSQL.
- Docker Compose.
- Prisma, Drizzle, Knex, or plain SQL migrations. Pick one and stay consistent.
- Zod or equivalent validation.
- Simple JWT or demo user bypass.
- AI provider adapter calling Duy's evaluator module/service.

## Hard Scope

Must build:

- Local backend runnable by the team.
- Docker Compose for backend dependencies.
- Minimal database schema.
- Interview template seed data.
- APIs for interview flow.
- AI feedback integration.
- API documentation for Huy/frontend/demo flow.

Do not build today:

- Live video.
- LiveKit.
- Payment.
- Retry/correction monetization.
- Full admin panel.
- Complex role permissions.
- Production observability.

## Deliverable 1: Backend Project Skeleton

Create the backend app foundation.

Required:

- `package.json`
- TypeScript config.
- App entrypoint.
- Health endpoint.
- Environment config.
- Error handling middleware.
- Request logging.
- Validation pattern.
- Test or smoke-test command.

Suggested structure:

```text
src/
  app.ts
  server.ts
  config.ts
  db/
    client.ts
    migrations/
    seed.ts
  modules/
    interviews/
    feedback/
    users/
  providers/
    ai/
  shared/
    errors.ts
    validate.ts
```

Acceptance:

- `npm install` works.
- `npm run dev` starts the API.
- `GET /health` returns JSON:

```json
{
  "status": "ok",
  "service": "mockbros-api"
}
```

## Deliverable 2: Docker Compose

Add local orchestration.

Required services:

- `api`
- `postgres`
- Optional: `redis`, only if implementation needs it.

Required files:

- `docker-compose.yml`
- `.env.example`
- `README.md` or `docs/local-dev.md` startup instructions.

Minimum env vars:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://mockbros:mockbros@postgres:5432/mockbros
JWT_SECRET=dev-secret-change-later
AI_PROVIDER=mock
AI_SERVICE_URL=http://localhost:4000
```

Acceptance:

- `docker compose up` starts PostgreSQL and API.
- API can connect to PostgreSQL using Compose service name.
- Fresh teammate can start from clean checkout using documented commands.

## Deliverable 3: Database Schema

Implement only what the demo needs.

Tables:

### `users`

- `id`
- `email`
- `name`
- `created_at`
- `updated_at`

For hackathon, password auth can be skipped if demo user bypass is chosen.

### `interview_templates`

- `id`
- `slug`
- `title`
- `target_role`
- `difficulty`
- `description`
- `created_at`
- `updated_at`

### `interview_questions`

- `id`
- `template_id`
- `question_order`
- `question_text`
- `rubric_hint`
- `expected_duration_seconds`
- `created_at`
- `updated_at`

### `interview_sessions`

- `id`
- `user_id`
- `template_id`
- `status`
- `started_at`
- `submitted_at`
- `created_at`
- `updated_at`

Allowed statuses:

- `created`
- `in_progress`
- `submitted`
- `completed`
- `failed`

### `interview_answers`

- `id`
- `session_id`
- `question_id`
- `answer_text`
- `answered_at`
- `created_at`
- `updated_at`

### `feedback_reports`

- `id`
- `session_id`
- `overall_score`
- `readiness_level`
- `summary`
- `strengths_json`
- `weaknesses_json`
- `recommendations_json`
- `per_question_json`
- `raw_ai_json`
- `created_at`
- `updated_at`

Acceptance:

- Migrations create all required tables from scratch.
- Seed command inserts at least 4 interview templates and 12 questions total.
- Database can be reset quickly for demo.

## Deliverable 4: Seed Data

Create realistic interview templates for demo.

Templates:

1. Software Engineer Interview
2. Product Manager Interview
3. Sales Interview
4. General Behavioral Interview

Each template should have 3 questions.

Example software engineer questions:

- "Tell me about a technical project you are proud of. What tradeoffs did you make?"
- "How do you debug a production issue when logs are incomplete?"
- "Explain a time you disagreed with a teammate about implementation."

Acceptance:

- `GET /interview-templates` returns seeded templates.
- Each template includes enough question data for UI to start a demo interview.

## Deliverable 5: API Contract

Implement these endpoints.

### `GET /interview-templates`

Returns available templates.

Response shape:

```json
{
  "templates": [
    {
      "id": "uuid",
      "slug": "software-engineer",
      "title": "Software Engineer Interview",
      "targetRole": "Software Engineer",
      "difficulty": "junior",
      "description": "Practice common software engineering interview questions.",
      "questionCount": 3
    }
  ]
}
```

### `GET /interview-templates/:id`

Returns template detail with questions.

### `POST /interviews`

Creates a session.

Request:

```json
{
  "templateId": "uuid",
  "userName": "Demo Candidate",
  "userEmail": "demo@mockbros.test"
}
```

Response:

```json
{
  "sessionId": "uuid",
  "status": "created"
}
```

### `POST /interviews/:id/start`

Moves session to `in_progress` and returns questions.

### `POST /interviews/:id/answers`

Accepts all answers at once.

Request:

```json
{
  "answers": [
    {
      "questionId": "uuid",
      "answerText": "My answer..."
    }
  ]
}
```

### `POST /interviews/:id/submit`

Submits interview, calls AI evaluator, stores feedback.

Response:

```json
{
  "sessionId": "uuid",
  "status": "completed",
  "feedbackReportId": "uuid"
}
```

### `GET /interviews/:id/feedback`

Returns structured feedback.

Acceptance:

- Full flow works through HTTP calls.
- API returns useful validation errors.
- Session ownership can be simple for hackathon, but do not expose random destructive endpoints.

## Deliverable 6: AI Provider Adapter

Create an internal AI interface so Duy can plug in either mock data or a real model.

Interface:

```ts
export type EvaluateInterviewInput = {
  templateTitle: string;
  targetRole: string;
  difficulty: string;
  questions: Array<{
    questionId: string;
    questionText: string;
    rubricHint?: string;
    answerText: string;
  }>;
};

export type EvaluateInterviewOutput = {
  overallScore: number;
  readinessLevel: "needs_practice" | "almost_ready" | "ready";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  perQuestion: Array<{
    questionId: string;
    score: number;
    feedback: string;
    improvedAnswer: string;
  }>;
};

export interface AiEvaluator {
  evaluateInterview(input: EvaluateInterviewInput): Promise<EvaluateInterviewOutput>;
}
```

Implement:

- `MockAiEvaluator`
- `HttpAiEvaluator` or direct SDK adapter if Duy provides one.

Acceptance:

- Backend can run with `AI_PROVIDER=mock`.
- Backend can call real AI only if env vars are present.
- Demo never fails just because real AI quota/network fails. Fall back to mock or cached sample feedback.

## Deliverable 7: Demo Script And Smoke Test

Create a repeatable demo path.

Required:

- One command to reset DB and seed data.
- One curl/http file or script that runs:
  - list templates
  - create interview
  - start interview
  - submit answers
  - get feedback

Acceptance:

- Demo can be run twice without manual DB editing.
- API returns feedback in under 10 seconds with mock AI.
- You can explain backend architecture in under 60 seconds.

## Coordination With Huy

Give Huy:

- Template list response shape.
- Interview start response shape.
- Feedback report response shape.
- Any frontend route assumptions.

Ask Huy to keep UI to this flow:

1. Select interview.
2. Answer 3 questions.
3. Submit.
4. Display report.

## Coordination With Duy

Give Duy:

- AI provider interface.
- Example input JSON.
- Expected output JSON.
- Whether his AI runs as:
  - direct TypeScript module,
  - local HTTP service,
  - or prompt-only spec.

For hackathon speed, prefer Duy gives a function or HTTP endpoint returning the exact expected JSON.

## Final Backend Checklist

- [ ] `docker compose up` works.
- [ ] DB migrations work.
- [ ] Seed data works.
- [ ] API health works.
- [ ] Template list works.
- [ ] Interview creation works.
- [ ] Answer submission works.
- [ ] AI feedback works.
- [ ] Feedback retrieval works.
- [ ] Huy has API shapes.
- [ ] Duy has AI interface.
- [ ] Demo script works.
