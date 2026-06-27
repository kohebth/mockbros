import { pool } from "../../db/client.js";
import { badRequest, notFound } from "../../shared/errors.js";
import type { SubmitAssessmentInput } from "./schemas.js";

type AssessmentFilters = {
  kind?: "entry" | "profession";
  industryId?: string;
  professionId?: string;
};

function toAssessment(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    kind: row.assessment_kind,
    testType: row.test_type,
    level: row.level,
    industryId: row.industry_id,
    industryName: row.industry_name,
    professionId: row.profession_id,
    professionTitle: row.profession_title,
    description: row.description,
    isActive: row.is_active,
    questionCount: Number(row.question_count ?? 0)
  };
}

function readinessLabel(score: number, maxScore: number) {
  if (maxScore <= 0) {
    return "No score available";
  }
  const ratio = score / maxScore;
  if (ratio >= 0.8) {
    return "Strong match";
  }
  if (ratio >= 0.6) {
    return "Good base, needs practice";
  }
  return "Needs focused practice";
}

export class AssessmentService {
  async listAssessments(filters: AssessmentFilters) {
    const where: string[] = ["a.is_active = true"];
    const values: string[] = [];

    if (filters.kind) {
      values.push(filters.kind);
      where.push(`a.assessment_kind = $${values.length}`);
    }
    if (filters.industryId) {
      values.push(filters.industryId);
      where.push(`a.industry_id = $${values.length}`);
    }
    if (filters.professionId) {
      values.push(filters.professionId);
      where.push(`a.profession_id = $${values.length}`);
    }

    const result = await pool.query(
      `
        SELECT
          a.id,
          a.slug,
          a.title,
          a.assessment_kind,
          a.test_type,
          a.level,
          a.industry_id,
          i.name AS industry_name,
          a.profession_id,
          p.title AS profession_title,
          a.description,
          a.is_active,
          COUNT(q.id) AS question_count
        FROM assessments a
        LEFT JOIN industries i ON i.id = a.industry_id
        LEFT JOIN professions p ON p.id = a.profession_id
        LEFT JOIN assessment_questions q ON q.assessment_id = a.id
        WHERE ${where.join(" AND ")}
        GROUP BY a.id, i.name, p.title
        ORDER BY a.assessment_kind ASC, a.title ASC
      `,
      values
    );

    return { assessments: result.rows.map(toAssessment) };
  }

  async getAssessment(id: string) {
    const assessment = await pool.query(
      `
        SELECT
          a.id,
          a.slug,
          a.title,
          a.assessment_kind,
          a.test_type,
          a.level,
          a.industry_id,
          i.name AS industry_name,
          a.profession_id,
          p.title AS profession_title,
          a.description,
          a.is_active,
          COUNT(q.id) AS question_count
        FROM assessments a
        LEFT JOIN industries i ON i.id = a.industry_id
        LEFT JOIN professions p ON p.id = a.profession_id
        LEFT JOIN assessment_questions q ON q.assessment_id = a.id
        WHERE a.id = $1
        GROUP BY a.id, i.name, p.title
      `,
      [id]
    );

    if (!assessment.rowCount) {
      throw notFound("Assessment not found");
    }

    const categories = await pool.query(
      `
        SELECT id, category_kind, slug, name, display_order
        FROM assessment_categories
        WHERE assessment_id = $1
        ORDER BY display_order ASC, name ASC
      `,
      [id]
    );

    const scoreBands = await pool.query(
      `
        SELECT id, min_score, max_score, label, display_order
        FROM assessment_score_bands
        WHERE assessment_id = $1
        ORDER BY min_score ASC, max_score ASC
      `,
      [id]
    );

    return {
      assessment: {
        ...toAssessment(assessment.rows[0]),
        categories: categories.rows.map((row) => ({
          id: row.id,
          kind: row.category_kind,
          slug: row.slug,
          name: row.name,
          displayOrder: row.display_order
        })),
        scoreBands: scoreBands.rows.map((row) => ({
          id: row.id,
          minScore: row.min_score,
          maxScore: row.max_score,
          label: row.label,
          displayOrder: row.display_order
        }))
      }
    };
  }

  async getQuestions(assessmentId: string) {
    await this.ensureAssessment(assessmentId);

    const result = await pool.query(
      `
        SELECT
          q.id AS question_id,
          q.question_order,
          q.question_text,
          c.id AS category_id,
          c.name AS category_name,
          c.category_kind,
          o.id AS option_id,
          o.option_key,
          o.option_order,
          o.option_text
        FROM assessment_questions q
        LEFT JOIN assessment_categories c ON c.id = q.category_id
        JOIN assessment_question_options o ON o.question_id = q.id
        WHERE q.assessment_id = $1
        ORDER BY q.question_order ASC, o.option_order ASC
      `,
      [assessmentId]
    );

    const questions = new Map<string, any>();
    for (const row of result.rows) {
      if (!questions.has(row.question_id)) {
        questions.set(row.question_id, {
          id: row.question_id,
          questionOrder: row.question_order,
          questionText: row.question_text,
          category: row.category_id
            ? {
                id: row.category_id,
                name: row.category_name,
                kind: row.category_kind
              }
            : null,
          options: []
        });
      }
      questions.get(row.question_id).options.push({
        id: row.option_id,
        key: row.option_key,
        order: row.option_order,
        text: row.option_text
      });
    }

    return { questions: Array.from(questions.values()) };
  }

  async submitAssessment(assessmentId: string, input: SubmitAssessmentInput) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const assessmentResult = await client.query(
        "SELECT id, assessment_kind FROM assessments WHERE id = $1 AND is_active = true",
        [assessmentId]
      );
      if (!assessmentResult.rowCount) {
        throw notFound("Assessment not found");
      }

      const questionsResult = await client.query(
        `
          SELECT
            q.id,
            q.question_order,
            q.question_text,
            q.explanation,
            o.option_key AS correct_option_key
          FROM assessment_questions q
          LEFT JOIN assessment_question_options o ON o.question_id = q.id AND o.is_correct = true
          WHERE q.assessment_id = $1
          ORDER BY q.question_order ASC
        `,
        [assessmentId]
      );

      if (!questionsResult.rowCount) {
        throw badRequest("Assessment has no questions");
      }

      const questionById = new Map(questionsResult.rows.map((row) => [row.id, row]));
      const seen = new Set<string>();
      for (const answer of input.answers) {
        if (!questionById.has(answer.questionId)) {
          throw badRequest(`Question ${answer.questionId} does not belong to this assessment`);
        }
        if (seen.has(answer.questionId)) {
          throw badRequest(`Duplicate answer for question ${answer.questionId}`);
        }
        seen.add(answer.questionId);
      }

      if (seen.size !== questionById.size) {
        throw badRequest("All assessment questions must be answered before submit");
      }

      let userId: string | null = null;
      if (input.userEmail) {
        const user = await client.query(
          `
            INSERT INTO users (email, name)
            VALUES ($1, $2)
            ON CONFLICT (email)
            DO UPDATE SET name = EXCLUDED.name, updated_at = now()
            RETURNING id
          `,
          [input.userEmail.toLowerCase(), input.userName ?? input.userEmail]
        );
        userId = user.rows[0].id;
      }

      let score = 0;
      const answerRows = input.answers.map((answer) => {
        const question = questionById.get(answer.questionId);
        const isCorrect = question.correct_option_key === answer.selectedOptionKey;
        if (isCorrect) {
          score += 1;
        }
        return {
          question,
          selectedOptionKey: answer.selectedOptionKey,
          isCorrect
        };
      });

      const maxScore = questionsResult.rowCount;
      const resultLabel = await this.resolveResultLabel(client, assessmentId, score, maxScore);

      const attempt = await client.query(
        `
          INSERT INTO assessment_attempts (
            assessment_id,
            user_id,
            candidate_name,
            candidate_email,
            status,
            score,
            max_score,
            result_label
          )
          VALUES ($1, $2, $3, $4, 'completed', $5, $6, $7)
          RETURNING id, submitted_at
        `,
        [assessmentId, userId, input.userName ?? null, input.userEmail?.toLowerCase() ?? null, score, maxScore, resultLabel]
      );

      for (const answer of answerRows) {
        await client.query(
          `
            INSERT INTO assessment_attempt_answers (attempt_id, question_id, selected_option_key, is_correct)
            VALUES ($1, $2, $3, $4)
          `,
          [attempt.rows[0].id, answer.question.id, answer.selectedOptionKey, answer.isCorrect]
        );
      }

      await client.query("COMMIT");

      return {
        attempt: {
          id: attempt.rows[0].id,
          assessmentId,
          status: "completed",
          score,
          maxScore,
          resultLabel,
          submittedAt: attempt.rows[0].submitted_at,
          answers: answerRows.map((answer) => ({
            questionId: answer.question.id,
            questionOrder: answer.question.question_order,
            questionText: answer.question.question_text,
            selectedOptionKey: answer.selectedOptionKey,
            correctOptionKey: answer.question.correct_option_key,
            isCorrect: answer.isCorrect,
            explanation: answer.question.explanation
          }))
        }
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getAttempt(id: string) {
    const attempt = await pool.query(
      `
        SELECT
          aa.id,
          aa.assessment_id,
          a.title AS assessment_title,
          aa.candidate_name,
          aa.candidate_email,
          aa.status,
          aa.score,
          aa.max_score,
          aa.result_label,
          aa.submitted_at
        FROM assessment_attempts aa
        JOIN assessments a ON a.id = aa.assessment_id
        WHERE aa.id = $1
      `,
      [id]
    );

    if (!attempt.rowCount) {
      throw notFound("Assessment attempt not found");
    }

    const answers = await pool.query(
      `
        SELECT
          q.id AS question_id,
          q.question_order,
          q.question_text,
          q.explanation,
          aaa.selected_option_key,
          aaa.is_correct,
          o.option_key AS correct_option_key
        FROM assessment_attempt_answers aaa
        JOIN assessment_questions q ON q.id = aaa.question_id
        LEFT JOIN assessment_question_options o ON o.question_id = q.id AND o.is_correct = true
        WHERE aaa.attempt_id = $1
        ORDER BY q.question_order ASC
      `,
      [id]
    );

    const row = attempt.rows[0];
    return {
      attempt: {
        id: row.id,
        assessmentId: row.assessment_id,
        assessmentTitle: row.assessment_title,
        candidateName: row.candidate_name,
        candidateEmail: row.candidate_email,
        status: row.status,
        score: row.score,
        maxScore: row.max_score,
        resultLabel: row.result_label,
        submittedAt: row.submitted_at,
        answers: answers.rows.map((answer) => ({
          questionId: answer.question_id,
          questionOrder: answer.question_order,
          questionText: answer.question_text,
          selectedOptionKey: answer.selected_option_key,
          correctOptionKey: answer.correct_option_key,
          isCorrect: answer.is_correct,
          explanation: answer.explanation
        }))
      }
    };
  }

  private async ensureAssessment(id: string) {
    const result = await pool.query("SELECT id FROM assessments WHERE id = $1 AND is_active = true", [id]);
    if (!result.rowCount) {
      throw notFound("Assessment not found");
    }
  }

  private async resolveResultLabel(client: any, assessmentId: string, score: number, maxScore: number) {
    const band = await client.query(
      `
        SELECT label
        FROM assessment_score_bands
        WHERE assessment_id = $1 AND $2 BETWEEN min_score AND max_score
        ORDER BY min_score ASC
        LIMIT 1
      `,
      [assessmentId, score]
    );

    if (band.rowCount) {
      return band.rows[0].label;
    }

    return readinessLabel(score, maxScore);
  }
}
