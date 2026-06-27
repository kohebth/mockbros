-- Product Build Sheet mapping:
-- - Fact Sheet: product_facts
-- - Industry: industries, professions
-- - Entry Questions: entry assessments, categories, questions, options, score bands
-- - Profession Questions: profession assessments, topics, questions, options
-- - Nháp: draft planning notes, intentionally not modeled as durable schema

CREATE TABLE IF NOT EXISTS product_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_key text NOT NULL UNIQUE,
  label text NOT NULL,
  value_text text,
  display_order integer NOT NULL DEFAULT 0,
  source_sheet text NOT NULL,
  source_row integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  source_sheet text,
  source_row integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS professions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id uuid REFERENCES industries(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  source_sheet text,
  source_row integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  assessment_kind text NOT NULL CHECK (assessment_kind IN ('entry', 'profession')),
  test_type text,
  level text,
  industry_id uuid REFERENCES industries(id) ON DELETE SET NULL,
  profession_id uuid REFERENCES professions(id) ON DELETE SET NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  source_sheet text NOT NULL,
  source_row integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (assessment_kind = 'entry' AND profession_id IS NULL)
    OR assessment_kind = 'profession'
  )
);

CREATE TABLE IF NOT EXISTS assessment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  category_kind text NOT NULL CHECK (category_kind IN ('classification', 'topic')),
  slug text NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, category_kind, slug)
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  category_id uuid REFERENCES assessment_categories(id) ON DELETE SET NULL,
  question_order integer NOT NULL,
  question_text text NOT NULL,
  explanation text,
  source_sheet text NOT NULL,
  source_row integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, question_order)
);

CREATE TABLE IF NOT EXISTS assessment_question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  option_key text NOT NULL CHECK (option_key IN ('A', 'B', 'C', 'D')),
  option_order integer NOT NULL,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, option_key),
  UNIQUE (question_id, option_order)
);

CREATE TABLE IF NOT EXISTS assessment_score_bands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  min_score integer NOT NULL,
  max_score integer NOT NULL,
  label text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  source_sheet text NOT NULL,
  source_row integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (min_score <= max_score),
  UNIQUE (assessment_id, min_score, max_score)
);

CREATE INDEX IF NOT EXISTS idx_professions_industry_id ON professions(industry_id);
CREATE INDEX IF NOT EXISTS idx_assessments_kind ON assessments(assessment_kind);
CREATE INDEX IF NOT EXISTS idx_assessments_industry_id ON assessments(industry_id);
CREATE INDEX IF NOT EXISTS idx_assessments_profession_id ON assessments(profession_id);
CREATE INDEX IF NOT EXISTS idx_assessment_categories_assessment_id ON assessment_categories(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_category_id ON assessment_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_assessment_question_options_question_id ON assessment_question_options(question_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_assessment_question_options_one_correct
  ON assessment_question_options(question_id)
  WHERE is_correct;
CREATE INDEX IF NOT EXISTS idx_assessment_score_bands_assessment_id ON assessment_score_bands(assessment_id);
