CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interview_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  target_role text NOT NULL,
  difficulty text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES interview_templates(id) ON DELETE CASCADE,
  question_order integer NOT NULL,
  question_text text NOT NULL,
  rubric_hint text,
  expected_duration_seconds integer NOT NULL DEFAULT 120,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, question_order)
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  template_id uuid NOT NULL REFERENCES interview_templates(id),
  status text NOT NULL CHECK (status IN ('created', 'in_progress', 'submitted', 'completed', 'failed')),
  started_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interview_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES interview_questions(id),
  answer_text text NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, question_id)
);

CREATE TABLE IF NOT EXISTS feedback_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
  overall_score integer NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  readiness_level text NOT NULL CHECK (readiness_level IN ('needs_practice', 'almost_ready', 'ready')),
  summary text NOT NULL,
  strengths_json jsonb NOT NULL,
  weaknesses_json jsonb NOT NULL,
  recommendations_json jsonb NOT NULL,
  per_question_json jsonb NOT NULL,
  raw_ai_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_questions_template_id ON interview_questions(template_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_template_id ON interview_sessions(template_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_session_id ON interview_answers(session_id);
