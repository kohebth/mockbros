CREATE TABLE IF NOT EXISTS live_interview_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_id uuid REFERENCES interview_questions(id),
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_interview_events_session_id ON live_interview_events(session_id);
CREATE INDEX IF NOT EXISTS idx_live_interview_events_question_id ON live_interview_events(question_id);
