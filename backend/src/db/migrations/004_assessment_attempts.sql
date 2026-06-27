CREATE TABLE IF NOT EXISTS assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  candidate_name text,
  candidate_email text,
  status text NOT NULL CHECK (status IN ('completed')),
  score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 0,
  result_label text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (score >= 0),
  CHECK (max_score >= 0),
  CHECK (score <= max_score)
);

CREATE TABLE IF NOT EXISTS assessment_attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES assessment_questions(id),
  selected_option_key text NOT NULL CHECK (selected_option_key IN ('A', 'B', 'C', 'D')),
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment_id ON assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_id ON assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempt_answers_attempt_id ON assessment_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempt_answers_question_id ON assessment_attempt_answers(question_id);
