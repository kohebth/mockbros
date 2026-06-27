# Mockbros Backend Task Breakdown

## Orchestration Rules

- Give each task to a lower-level model with only: product summary, stack assumptions, task goal, files/modules it owns, interfaces it must preserve, and acceptance tests.
- Keep each task independent where possible.
- Do tasks in order. Later tasks may depend on earlier database/API contracts.
- Do not let worker models rename product/domain concepts without approval.
- Product name: **Mockbros**.
- Backend shape: **Node.js TypeScript modular monolith**.
- Core stack: PostgreSQL, Redis, S3-compatible object storage, LiveKit, background jobs, LLM/STT provider adapters.
- Local orchestration must run through Docker Compose so lower-level models can verify work consistently.

## Shared Context For Every Worker

Mockbros is a mock interview product. Users practice interviews with timed questions, audio/video capture, AI feedback, retry history, and paid answer correction.

Core entities:

- User
- CandidateProfile
- InterviewCategory
- InterviewTemplate
- QuestionTemplate
- InterviewSession
- InterviewSessionQuestion
- InterviewAnswer
- MediaRoom
- MediaRecording
- TranscriptionJob
- FeedbackReport
- CorrectionRequest
- Payment

Session states:

`created`, `in_progress`, `submitted`, `processing`, `completed`, `failed`, `cancelled`.

Correction states:

`requested`, `payment_pending`, `processing`, `completed`, `failed`.

Provider interfaces:

- `MediaProvider`: create room, create participant token, verify webhook.
- `TranscriptionProvider`: transcribe recording/audio.
- `AiEvaluationProvider`: generate structured interview feedback.
- `PaymentProvider`: create checkout, verify webhook.

## Task List

### Task 1: Backend Skeleton

Goal: Create the Node.js TypeScript backend foundation.

Deliver:

- App bootstrap.
- Config validation.
- Health endpoint.
- PostgreSQL connection.
- Redis connection.
- Structured logging.
- Error response format.
- Request ID middleware.
- Test setup.

Acceptance:

- `GET /health` returns service status.
- Config fails fast when required env vars are missing.
- Tests can run without external paid services by using test/mocked providers.

---

### Task 2: Docker Compose Local Orchestration

Goal: Add reproducible local infrastructure for all backend development.

Deliver:

- `docker-compose.yml` for backend-local dependencies.
- PostgreSQL service.
- Redis service.
- S3-compatible object storage, preferably MinIO.
- Optional local LiveKit service if feasible; otherwise document LiveKit cloud env vars and keep mock provider as default for tests.
- App service for the Node.js backend.
- Worker service for background jobs if the app separates HTTP and worker processes.
- Health checks for database, Redis, object storage, app, and worker.
- `.env.example` with all required local variables.
- Local startup docs.

Acceptance:

- `docker compose up` starts required local infrastructure.
- App can connect to PostgreSQL and Redis through Compose service names.
- MinIO bucket initialization is automated or documented with a one-command setup.
- Test mode does not require real LiveKit, real LLM, real STT, or real payment credentials.
- Compose setup works from a clean checkout after installing dependencies.

---

### Task 3: Database Migration Foundation

Goal: Add schema migration workflow and initial shared columns.

Deliver:

- Migration tool setup.
- UUID primary keys.
- `created_at`, `updated_at` conventions.
- Soft delete policy only if used consistently.
- Base indexes for foreign keys.
- Seed runner.
- Migration command that works against the Compose PostgreSQL service.

Acceptance:

- Empty database can be migrated from scratch.
- Migration rollback strategy is documented or supported.
- Seed runner can insert initial interview categories later.
- Migrations run successfully against Docker Compose PostgreSQL.

---

### Task 4: Auth Module

Goal: Implement candidate/admin authentication.

Deliver:

- `users`
- `refresh_tokens`
- Register/login/refresh/logout APIs.
- Password hashing.
- JWT access tokens.
- Auth middleware.
- Role guard.

APIs:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

Acceptance:

- Candidate can register and log in.
- Refresh token rotation works.
- Admin-only route rejects candidate users.
- Invalid/expired tokens return consistent `401`.

---

### Task 5: Candidate Profile Module

Goal: Let authenticated candidates manage profile basics.

Deliver:

- `candidate_profiles`
- Get/update current profile.
- Validation for name, target role, experience level, avatar URL, education/work summary.

APIs:

- `GET /me`
- `PATCH /me/profile`

Acceptance:

- Profile is created on registration or first profile update.
- User can only access their own profile.
- Invalid payload returns `400`.

---

### Task 6: Interview Catalog Module

Goal: Build interview categories, templates, and question templates.

Deliver:

- `interview_categories`
- `interview_templates`
- `question_templates`
- Admin CRUD.
- Candidate read APIs.
- Initial seed data for software engineering, product, sales, marketing, and general behavioral interviews.

APIs:

- `GET /interview-categories`
- `GET /interview-templates`
- Admin routes under `/admin/interview-*`

Acceptance:

- Candidate can list active templates.
- Admin can create/update/deactivate templates.
- Inactive templates are hidden from candidate APIs.
- Seed command creates usable starter content.

---

### Task 7: Interview Session Module

Goal: Implement interview lifecycle without media/AI yet.

Deliver:

- `interview_sessions`
- `interview_session_questions`
- `interview_answers`
- Session creation from template.
- Question selection.
- State transition validation.
- Answer submission.
- Final submit.

APIs:

- `POST /interviews`
- `GET /interviews`
- `GET /interviews/:id`
- `POST /interviews/:id/start`
- `POST /interviews/:id/answers`
- `POST /interviews/:id/submit`

Acceptance:

- Candidate can create/start/submit an interview.
- Candidate cannot access another user's interview.
- Invalid transitions are rejected.
- Submitted interview moves to `submitted`.

---

### Task 8: LiveKit Media Module

Goal: Add real-time room creation and recording metadata handling.

Deliver:

- `media_rooms`
- `media_recordings`
- `MediaProvider` interface.
- LiveKit provider implementation.
- Mock provider for tests.
- LiveKit webhook endpoint.
- Idempotent webhook storage.
- Compose-compatible default config that uses mock media unless real LiveKit env vars are set.

APIs:

- Extend `POST /interviews/:id/start` to return room token.
- `POST /webhooks/livekit`

Acceptance:

- Starting an interview creates or reuses a media room.
- Candidate receives a participant token.
- Duplicate webhook events do not duplicate recordings.
- Recording metadata is linked to interview session.
- Local tests pass without a real LiveKit server.

---

### Task 9: Transcription Jobs

Goal: Convert submitted media/answers into transcripts.

Deliver:

- `transcription_jobs`
- `TranscriptionProvider` interface.
- Mock transcription provider.
- One real provider adapter behind config.
- Background job worker.
- Retry/failure tracking.
- Worker process runs under Docker Compose.

Acceptance:

- Submitted interview can enqueue transcription.
- Successful job stores transcript on answers or session records.
- Failed job marks reason and can be retried.
- Tests use mock provider only.
- Compose worker can process queued test jobs.

---

### Task 10: AI Feedback Module

Goal: Generate structured feedback after transcription.

Deliver:

- `feedback_reports`
- `feedback_question_items`
- `ai_evaluation_jobs`
- `ai_audit_logs`
- `AiEvaluationProvider` interface.
- Mock AI provider.
- One real LLM adapter behind config.
- Background feedback generation job.

Feedback fields:

- overall score
- per-question score
- clarity
- relevance
- structure
- confidence
- technical correctness
- communication
- authenticity
- strengths
- weaknesses
- recommended improvements

APIs:

- `GET /interviews/:id/feedback`

Acceptance:

- Submitted interview moves `submitted -> processing -> completed`.
- Feedback is persisted and readable.
- Failed AI job marks session `failed` or job `failed` with retry support.
- Raw AI logs are internal only.
- Feedback job works in the Compose worker using mock provider.

---

### Task 11: Retry Policy Module

Goal: Let candidates retry interviews with free limits.

Deliver:

- `retry_grants`
- Retry policy service.
- Retry endpoint.
- Link retry session to original session.

API:

- `POST /interviews/:id/retry`

Acceptance:

- Candidate can retry within free limit.
- Retry creates a new interview session with reference to original.
- Retry beyond limit is rejected unless later unlocked by payment/subscription.
- User cannot retry another user's session.

---

### Task 12: Correction Request Module

Goal: Let candidates request paid answer correction after feedback.

Deliver:

- `correction_requests`
- Correction lifecycle.
- AI correction generation job.
- Link correction to interview/question.
- Do not overwrite original answer.

API:

- `POST /interviews/:id/corrections`

Acceptance:

- Correction can only be requested for completed interviews.
- Correction starts as `payment_pending` when payment is required.
- Completed correction stores revised guidance separately.
- Original answer and original feedback remain unchanged.

---

### Task 13: Payment Module

Goal: Support paid corrections.

Deliver:

- `payments`
- `payment_events`
- `PaymentProvider` interface.
- Mock payment provider.
- Checkout creation.
- Webhook verification.
- Payment status updates.
- Unlock correction after successful payment.

APIs:

- `POST /payments/checkout`
- `POST /webhooks/payments`

Acceptance:

- Checkout can be created for a correction request.
- Payment webhook is idempotent.
- Successful payment moves correction to `processing`.
- Failed/cancelled payment does not unlock correction.
- Local Compose/test mode uses mock payment provider by default.

---

### Task 14: Admin Operations Module

Goal: Give admins control over content and failed processing.

Deliver:

- Admin list/detail APIs for interviews.
- Admin list/retry APIs for failed transcription and AI jobs.
- Admin read-only feedback/report inspection.
- Basic audit logging for admin actions.

Acceptance:

- Candidate routes reject admin-only actions.
- Admin can inspect failed jobs.
- Admin can re-run failed transcription/AI jobs.
- Audit logs include actor, action, target, timestamp.

---

### Task 15: Rate Limiting And Security Hardening

Goal: Protect expensive and sensitive endpoints.

Deliver:

- Redis-backed rate limits.
- Auth rate limits.
- Interview creation limits.
- AI submission limits.
- Webhook signature validation.
- Request payload size limits.
- File/media metadata validation.

Acceptance:

- Excessive login attempts are throttled.
- Excessive interview creation is throttled.
- Invalid webhook signatures are rejected.
- Error messages do not leak secrets or provider internals.
- Rate limiting works against Compose Redis.

---

### Task 16: API Documentation

Goal: Make backend usable by frontend and future agents.

Deliver:

- OpenAPI spec generation or maintained spec.
- Auth examples.
- Interview lifecycle examples.
- Docker Compose local setup instructions.
- Webhook payload notes.
- Error response schema.

Acceptance:

- API docs include all public candidate APIs.
- API docs include admin route auth requirements.
- Docs explain how to start backend locally with Docker Compose.
- Frontend can implement interview flow from docs alone.

---

### Task 17: End-To-End Backend Tests

Goal: Verify the whole happy path and important failures.

Scenarios:

- Start Docker Compose dependencies.
- Run migrations and seeds.
- Register/login/update profile.
- Admin creates interview template.
- Candidate starts interview.
- Candidate submits answers.
- LiveKit webhook stores recording metadata through mock/local provider.
- Transcription mock completes.
- AI feedback mock completes.
- Candidate reads feedback.
- Candidate retries interview.
- Candidate requests correction.
- Mock payment succeeds.
- Correction completes.

Failure scenarios:

- Unauthorized access.
- Wrong owner access.
- Invalid session transition.
- Duplicate webhook.
- Failed transcription.
- Failed AI feedback.
- Retry limit exceeded.
- Unpaid correction access.

Acceptance:

- E2E tests pass using Docker Compose dependencies.
- No test depends on LiveKit cloud, real LLM, real STT, or real payment provider.
- One documented command runs the full local verification path.

## Suggested Execution Groups

1. Foundation: Tasks 1-3.
2. Identity: Tasks 4-5.
3. Interview Core: Tasks 6-7.
4. Media And AI: Tasks 8-10.
5. Monetization: Tasks 11-13.
6. Operations: Tasks 14-16.
7. Full Verification: Task 17.

## Assumptions

- Lower-level models should implement one task at a time.
- Each task should include migrations, code, and tests for its own scope.
- External services must be hidden behind provider interfaces.
- Mock providers are mandatory so the whole backend can be tested locally.
- Docker Compose is the required local orchestration path for dependencies and optional app/worker processes.
