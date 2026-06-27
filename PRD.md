# Mockbros PRD

## 1. Product Summary

Mockbros is a mock interview practice product for job seekers. Users choose an interview type, answer a short set of realistic questions, submit their answers, and receive instant AI-style feedback with scores, strengths, weaknesses, recommendations, and improved answer examples.

The current build is a hackathon MVP focused on one complete demo flow:

1. Choose an interview template.
2. Start a mock interview.
3. Answer 3 questions.
4. Submit answers.
5. View a structured feedback report.

## 2. Target User

Primary user:

- Students, fresh graduates, and junior professionals preparing for interviews.

User problem:

- They do not know whether their interview answers are clear, structured, or convincing.
- They often practice alone without useful feedback.
- Coaching can be expensive or unavailable before an actual interview.

Mockbros value:

- Gives structured practice instead of generic chat.
- Provides immediate feedback.
- Shows concrete improvements users can apply before the real interview.

## 3. Current MVP Scope

### In Scope

- Frontend skeleton with Mockbros branding.
- White, black, and gold visual palette:
  - Primary: `#FFFFFF`
  - Secondary: `#000000`
  - Accent: `#FFD700`
- Interview template selection.
- Demo interview answer panel.
- Feedback report preview.
- Backend API for interview templates, sessions, answers, submission, and feedback.
- PostgreSQL schema and seed data.
- Docker Compose for backend local infrastructure.
- Mock AI evaluator for reliable demos.
- Optional HTTP AI evaluator for Duy's external AI service.

### Out Of Scope For Current Hackathon MVP

- Live audio/video interview.
- LiveKit integration.
- User authentication.
- Payment.
- Retry/correction monetization.
- Employer dashboard.
- Admin dashboard.
- Candidate marketplace.
- Production deployment.
- Real speech-to-text.
- Fine-tuned AI model.

## 4. User Journey

### Step 1: Choose Interview Type

User sees available interview templates:

- Software Engineer Interview
- Product Manager Interview
- Sales Interview
- General Behavioral Interview

Each template shows:

- Title
- Target role
- Difficulty
- Description
- Question count

### Step 2: Start Interview

User starts a selected interview session.

The system returns:

- Session ID
- Session status
- 3 ordered questions
- Rubric hints for internal scoring
- Expected answer duration

### Step 3: Submit Answers

User answers all questions using text.

The current MVP accepts all answers in one API call.

### Step 4: Generate Feedback

Backend submits the interview answers to an AI evaluator.

Default behavior:

- Use deterministic mock evaluator.

Optional behavior:

- Call external HTTP AI service if `AI_PROVIDER=http`.
- Fall back to mock evaluator if external AI fails.

### Step 5: View Feedback Report

User receives:

- Overall score
- Readiness level
- Summary
- Strengths
- Weaknesses
- Recommendations
- Per-question feedback
- Improved answer examples

## 5. Functional Requirements

### FR1: Health Check

The system must expose a health endpoint.

Endpoint:

```http
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "service": "mockbros-api"
}
```

### FR2: List Interview Templates

The system must return all available interview templates.

Endpoint:

```http
GET /interview-templates
```

Response includes:

- `id`
- `slug`
- `title`
- `targetRole`
- `difficulty`
- `description`
- `questionCount`

### FR3: Get Interview Template Detail

The system must return one interview template and its questions.

Endpoint:

```http
GET /interview-templates/:id
```

Response includes:

- Template data
- Ordered questions
- Rubric hints
- Expected duration

### FR4: Create Interview Session

The system must create an interview session for a demo candidate.

Endpoint:

```http
POST /interviews
```

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

### FR5: Start Interview Session

The system must move an interview session to `in_progress` and return questions.

Endpoint:

```http
POST /interviews/:id/start
```

Valid previous statuses:

- `created`
- `in_progress`

### FR6: Save Answers

The system must save answers for the active interview session.

Endpoint:

```http
POST /interviews/:id/answers
```

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

Rules:

- Session must be `in_progress`.
- Question IDs must belong to the selected interview template.
- Re-submitting an answer updates the saved answer.

### FR7: Submit Interview

The system must submit the interview, evaluate answers, store feedback, and mark the session completed.

Endpoint:

```http
POST /interviews/:id/submit
```

Rules:

- All questions must have answers.
- Session can be submitted from `in_progress`.
- Existing completed feedback should be returned idempotently.
- AI failure should mark the session `failed`.

Expected response:

```json
{
  "sessionId": "uuid",
  "status": "completed",
  "feedbackReportId": "uuid"
}
```

### FR8: Get Feedback Report

The system must return the stored feedback report.

Endpoint:

```http
GET /interviews/:id/feedback
```

Response includes:

- `overallScore`
- `readinessLevel`
- `summary`
- `strengths`
- `weaknesses`
- `recommendations`
- `perQuestion`

## 6. Data Model

Current backend tables:

### `users`

Demo user identity.

Fields:

- `id`
- `email`
- `name`
- `created_at`
- `updated_at`

### `interview_templates`

Interview template metadata.

Fields:

- `id`
- `slug`
- `title`
- `target_role`
- `difficulty`
- `description`
- `created_at`
- `updated_at`

### `interview_questions`

Questions belonging to an interview template.

Fields:

- `id`
- `template_id`
- `question_order`
- `question_text`
- `rubric_hint`
- `expected_duration_seconds`
- `created_at`
- `updated_at`

### `interview_sessions`

A user's interview attempt.

Fields:

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

Saved answer text for each session question.

Fields:

- `id`
- `session_id`
- `question_id`
- `answer_text`
- `answered_at`
- `created_at`
- `updated_at`

### `feedback_reports`

Stored AI evaluation result.

Fields:

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

## 7. AI Evaluation

### Current Evaluator

The MVP includes a deterministic mock evaluator.

It scores answers based on:

- Empty answer.
- Very short answer.
- Medium answer.
- Presence of useful interview signals such as:
  - `because`
  - `tradeoff`
  - `result`
  - `impact`
  - `user`
  - `team`
  - `metric`
  - `learned`

### Readiness Levels

- `needs_practice`: score below 60.
- `almost_ready`: score from 60 to 79.
- `ready`: score 80 and above.

### AI Provider Contract

Backend interface:

```ts
export type EvaluateInterviewInput = {
  templateTitle: string;
  targetRole: string;
  difficulty: string;
  questions: Array<{
    questionId: string;
    questionText: string;
    rubricHint?: string | null;
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
```

Optional HTTP AI service:

```http
POST /evaluate-interview
```

The backend uses this service only when:

```env
AI_PROVIDER=http
```

Otherwise it uses:

```env
AI_PROVIDER=mock
```

## 8. Frontend Requirements

Current frontend is a Vite + React + TypeScript skeleton.

Required screens for MVP:

### Screen 1: Interview Selection

Purpose:

- Explain Mockbros.
- Let user choose an interview template.

Required UI:

- Product name.
- Value proposition.
- Interview template cards.
- CTA to start interview.

### Screen 2: Interview Practice

Purpose:

- Let user answer questions.

Required UI:

- Current question.
- Progress indicator.
- Answer input.
- Submit button.

Current skeleton includes a sample answer panel.

### Screen 3: Feedback Report

Purpose:

- Show the value of Mockbros.

Required UI:

- Score.
- Readiness level.
- Summary.
- Strengths.
- Weaknesses.
- Recommendations.
- Per-question coaching.

Current skeleton includes a feedback report preview.

## 9. Technical Architecture

### Frontend

- Vite
- React
- TypeScript
- CSS variables for theme
- `lucide-react` icons

Frontend files:

- `package.json`
- `src/App.tsx`
- `src/styles.css`
- `vite.config.ts`

### Backend

- Node.js
- TypeScript
- Express
- PostgreSQL
- Plain SQL migrations
- Zod validation
- Docker Compose

Backend files:

- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/db/migrations/001_initial.sql`
- `backend/src/db/seed.ts`
- `backend/src/modules/interviews/interviewRoutes.ts`
- `backend/src/modules/interviews/interviewService.ts`
- `backend/src/providers/ai/*`
- `docker-compose.yml`

## 10. Local Development

### Backend

From repo root:

```bash
docker compose up -d postgres
```

From `backend/`:

```bash
npm install
DATABASE_URL=postgresql://mockbros:mockbros@localhost:5432/mockbros npm run migrate
DATABASE_URL=postgresql://mockbros:mockbros@localhost:5432/mockbros npm run seed
DATABASE_URL=postgresql://mockbros:mockbros@localhost:5432/mockbros npm run dev
```

Run smoke test:

```bash
cd backend
npm run smoke
```

### Frontend

From repo root:

```bash
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

Backend runs at:

```text
http://localhost:3000
```

## 11. Demo Acceptance Criteria

The hackathon demo is successful if:

- User can see Mockbros frontend skeleton.
- User can understand the interview practice flow.
- Backend health check passes.
- Backend returns seeded interview templates.
- A session can be created and started.
- Answers can be saved.
- Submission generates a feedback report.
- Feedback can be fetched and displayed.
- Demo does not require real AI credentials.

Verified backend commands:

```bash
npm run build
docker compose config
docker compose up -d postgres
DATABASE_URL=postgresql://mockbros:mockbros@localhost:5432/mockbros npm run migrate
DATABASE_URL=postgresql://mockbros:mockbros@localhost:5432/mockbros npm run seed
npm run smoke
```

## 12. Future Scope

After the hackathon, Mockbros can expand into:

- Real AI evaluator using Duy's prompt and rubric.
- Authentication and user interview history.
- Audio answers.
- Speech-to-text.
- Video interview simulation.
- LiveKit integration.
- Retry and paid correction flows.
- Admin tools for managing question banks.
- University or bootcamp team dashboards.
- Role-specific premium interview packs.
