# Mockbros API

Hackathon backend for the Mockbros mock interview demo.

## What It Does

- Lists interview templates.
- Creates a demo interview session.
- Starts a session and returns questions.
- Saves text answers.
- Submits answers to an AI evaluator.
- Stores and returns structured feedback.

The default AI evaluator is deterministic mock logic, so the demo works without real AI credentials.

## Local Run

From `backend/`:

```bash
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

API runs at:

```text
http://localhost:3000
```

## Docker Compose

From repo root:

```bash
docker compose up --build
```

Then run migrations and seed inside the API container:

```bash
docker compose exec api npm run migrate
docker compose exec api npm run seed
```

## Demo Smoke Test

From `backend/` with the API running:

```bash
npm run smoke
```

This runs the full path:

1. Health check.
2. List templates.
3. Create interview.
4. Start interview.
5. Save answers.
6. Submit interview.
7. Fetch feedback.

## AI Integration

Default:

```env
AI_PROVIDER=mock
```

Optional HTTP provider:

```env
AI_PROVIDER=http
AI_SERVICE_URL=http://localhost:4000
```

The HTTP service must expose:

```http
POST /evaluate-interview
```

See `src/providers/ai/types.ts` for the exact input and output contract.
