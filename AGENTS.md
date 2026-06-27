# Repository Guidelines

## Project Structure & Module Organization

Mockbros is a hackathon MVP for mock interview practice. The root contains the Vite React frontend and product/task docs. Frontend code lives in `src/`, with `src/App.tsx` for the current UI and `src/styles.css` for the white/black/gold theme. Backend code lives in `backend/src/`, grouped by `db/`, `modules/`, `providers/`, and `shared/`. SQL migrations are in `backend/src/db/migrations/`. Backend API docs are in `backend/API.md`; product/task context is in `PRD.md`, `TASKS-*.md`, and `TASKS.md`.

## Build, Test, and Development Commands

Frontend:

```bash
npm install
npm run dev      # start Vite on http://localhost:5173
npm run build    # type-check and build frontend
npm run lint     # run ESLint
```

Backend:

```bash
cd backend
npm install
npm run build
DATABASE_URL=postgresql://mockbros:mockbros@localhost:5432/mockbros npm run migrate
DATABASE_URL=postgresql://mockbros:mockbros@localhost:5432/mockbros npm run seed
DATABASE_URL=postgresql://mockbros:mockbros@localhost:5432/mockbros npm run dev
npm run smoke
npm run smoke:live
npm run smoke:audio
```

Use `docker compose up -d postgres` from the repo root for local PostgreSQL.

## Coding Style & Naming Conventions

Use TypeScript with strict mode. Prefer small modules, explicit types at service/provider boundaries, and Zod schemas for request validation. Use 2-space indentation in JSON and TypeScript. React components use PascalCase; functions and variables use camelCase. Keep provider interfaces under `backend/src/providers/*` so mock and real integrations remain swappable.

## Testing Guidelines

This repo currently uses smoke tests rather than a full unit test suite. Before handing off backend changes, run `npm run build`, `npm run smoke`, `npm run smoke:live`, and `npm run smoke:audio` from `backend/`. Add focused tests or smoke scripts when introducing new flows. Do not require real AI, STT, or external services for default verification.

## Commit & Pull Request Guidelines

No established commit history convention exists yet. Use short imperative commits, for example `Add live interview WebSocket flow`. PRs should include a summary, verification commands run, screenshots for UI changes, and notes for any schema/config changes.

## Security & Configuration Tips

Never commit `.env` or API keys. Keep `.env.example` current when adding config. Default local providers should be mock-safe. Real AI/STT integrations must be opt-in through environment variables.
