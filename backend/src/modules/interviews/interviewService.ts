import { pool } from "../../db/client.js";
import { badRequest, notFound } from "../../shared/errors.js";
import type { AiEvaluator } from "../../providers/ai/types.js";

type CreateInterviewInput = {
  templateId: string;
  userName: string;
  userEmail: string;
};

type SubmitAnswersInput = {
  answers: Array<{
    questionId: string;
    answerText: string;
  }>;
};

function toTemplate(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    targetRole: row.target_role,
    difficulty: row.difficulty,
    description: row.description,
    questionCount: Number(row.question_count ?? 0)
  };
}

function toQuestion(row: any) {
  return {
    id: row.id,
    questionOrder: row.question_order,
    questionText: row.question_text,
    rubricHint: row.rubric_hint,
    expectedDurationSeconds: row.expected_duration_seconds
  };
}

export class InterviewService {
  constructor(private readonly aiEvaluator: AiEvaluator) {}

  async listTemplates() {
    const result = await pool.query(`
      SELECT
        t.id,
        t.slug,
        t.title,
        t.target_role,
        t.difficulty,
        t.description,
        COUNT(q.id) AS question_count
      FROM interview_templates t
      LEFT JOIN interview_questions q ON q.template_id = t.id
      GROUP BY t.id
      ORDER BY t.title ASC
    `);

    return { templates: result.rows.map(toTemplate) };
  }

  async getTemplate(id: string) {
    const templateResult = await pool.query(
      `
        SELECT
          t.id,
          t.slug,
          t.title,
          t.target_role,
          t.difficulty,
          t.description,
          COUNT(q.id) AS question_count
        FROM interview_templates t
        LEFT JOIN interview_questions q ON q.template_id = t.id
        WHERE t.id = $1
        GROUP BY t.id
      `,
      [id]
    );

    if (!templateResult.rowCount) {
      throw notFound("Interview template not found");
    }

    const questions = await pool.query(
      `
        SELECT id, question_order, question_text, rubric_hint, expected_duration_seconds
        FROM interview_questions
        WHERE template_id = $1
        ORDER BY question_order ASC
      `,
      [id]
    );

    return {
      template: {
        ...toTemplate(templateResult.rows[0]),
        questions: questions.rows.map(toQuestion)
      }
    };
  }

  async createInterview(input: CreateInterviewInput) {
    const template = await pool.query("SELECT id FROM interview_templates WHERE id = $1", [input.templateId]);
    if (!template.rowCount) {
      throw notFound("Interview template not found");
    }

    const user = await pool.query(
      `
        INSERT INTO users (email, name)
        VALUES ($1, $2)
        ON CONFLICT (email)
        DO UPDATE SET name = EXCLUDED.name, updated_at = now()
        RETURNING id
      `,
      [input.userEmail.toLowerCase(), input.userName]
    );

    const session = await pool.query(
      `
        INSERT INTO interview_sessions (user_id, template_id, status)
        VALUES ($1, $2, 'created')
        RETURNING id, status
      `,
      [user.rows[0].id, input.templateId]
    );

    return {
      sessionId: session.rows[0].id,
      status: session.rows[0].status
    };
  }

  async startInterview(sessionId: string) {
    const session = await pool.query("SELECT id, status, template_id FROM interview_sessions WHERE id = $1", [
      sessionId
    ]);

    if (!session.rowCount) {
      throw notFound("Interview session not found");
    }

    if (!["created", "in_progress"].includes(session.rows[0].status)) {
      throw badRequest(`Cannot start interview from status ${session.rows[0].status}`);
    }

    const updated = await pool.query(
      `
        UPDATE interview_sessions
        SET status = 'in_progress',
            started_at = COALESCE(started_at, now()),
            updated_at = now()
        WHERE id = $1
        RETURNING id, status, started_at
      `,
      [sessionId]
    );

    const questions = await pool.query(
      `
        SELECT id, question_order, question_text, rubric_hint, expected_duration_seconds
        FROM interview_questions
        WHERE template_id = $1
        ORDER BY question_order ASC
      `,
      [session.rows[0].template_id]
    );

    return {
      sessionId: updated.rows[0].id,
      status: updated.rows[0].status,
      startedAt: updated.rows[0].started_at,
      questions: questions.rows.map(toQuestion)
    };
  }

  async saveAnswers(sessionId: string, input: SubmitAnswersInput) {
    const session = await pool.query("SELECT id, status, template_id FROM interview_sessions WHERE id = $1", [
      sessionId
    ]);

    if (!session.rowCount) {
      throw notFound("Interview session not found");
    }

    if (session.rows[0].status !== "in_progress") {
      throw badRequest("Answers can only be saved while interview is in progress");
    }

    const validQuestions = await pool.query("SELECT id FROM interview_questions WHERE template_id = $1", [
      session.rows[0].template_id
    ]);
    const validQuestionIds = new Set(validQuestions.rows.map((row) => row.id));

    for (const answer of input.answers) {
      if (!validQuestionIds.has(answer.questionId)) {
        throw badRequest(`Question ${answer.questionId} does not belong to this interview`);
      }

      await pool.query(
        `
          INSERT INTO interview_answers (session_id, question_id, answer_text)
          VALUES ($1, $2, $3)
          ON CONFLICT (session_id, question_id)
          DO UPDATE SET answer_text = EXCLUDED.answer_text,
                        answered_at = now(),
                        updated_at = now()
        `,
        [sessionId, answer.questionId, answer.answerText]
      );
    }

    return {
      sessionId,
      savedAnswers: input.answers.length
    };
  }

  async submitInterview(sessionId: string) {
    const sessionResult = await pool.query(
      `
        SELECT
          s.id,
          s.status,
          t.title,
          t.target_role,
          t.difficulty
        FROM interview_sessions s
        JOIN interview_templates t ON t.id = s.template_id
        WHERE s.id = $1
      `,
      [sessionId]
    );

    if (!sessionResult.rowCount) {
      throw notFound("Interview session not found");
    }

    const session = sessionResult.rows[0];
    if (!["in_progress", "submitted", "completed"].includes(session.status)) {
      throw badRequest(`Cannot submit interview from status ${session.status}`);
    }

    const existingReport = await pool.query("SELECT id FROM feedback_reports WHERE session_id = $1", [sessionId]);
    if (existingReport.rowCount) {
      return {
        sessionId,
        status: "completed",
        feedbackReportId: existingReport.rows[0].id
      };
    }

    const answers = await pool.query(
      `
        SELECT
          q.id AS question_id,
          q.question_text,
          q.rubric_hint,
          a.answer_text
        FROM interview_questions q
        LEFT JOIN interview_answers a ON a.question_id = q.id AND a.session_id = $1
        JOIN interview_sessions s ON s.template_id = q.template_id
        WHERE s.id = $1
        ORDER BY q.question_order ASC
      `,
      [sessionId]
    );

    if (answers.rows.some((row) => !row.answer_text)) {
      throw badRequest("All questions must have answers before submit");
    }

    await pool.query(
      "UPDATE interview_sessions SET status = 'submitted', submitted_at = now(), updated_at = now() WHERE id = $1",
      [sessionId]
    );

    try {
      const feedback = await this.aiEvaluator.evaluateInterview({
        templateTitle: session.title,
        targetRole: session.target_role,
        difficulty: session.difficulty,
        questions: answers.rows.map((row) => ({
          questionId: row.question_id,
          questionText: row.question_text,
          rubricHint: row.rubric_hint,
          answerText: row.answer_text
        }))
      });

      const report = await pool.query(
        `
          INSERT INTO feedback_reports (
            session_id,
            overall_score,
            readiness_level,
            summary,
            strengths_json,
            weaknesses_json,
            recommendations_json,
            per_question_json,
            raw_ai_json
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `,
        [
          sessionId,
          feedback.overallScore,
          feedback.readinessLevel,
          feedback.summary,
          JSON.stringify(feedback.strengths),
          JSON.stringify(feedback.weaknesses),
          JSON.stringify(feedback.recommendations),
          JSON.stringify(feedback.perQuestion),
          JSON.stringify(feedback)
        ]
      );

      await pool.query("UPDATE interview_sessions SET status = 'completed', updated_at = now() WHERE id = $1", [
        sessionId
      ]);

      return {
        sessionId,
        status: "completed",
        feedbackReportId: report.rows[0].id
      };
    } catch (error) {
      await pool.query("UPDATE interview_sessions SET status = 'failed', updated_at = now() WHERE id = $1", [
        sessionId
      ]);
      throw error;
    }
  }

  async getLiveSession(sessionId: string) {
    const result = await pool.query(
      `
        SELECT
          s.id,
          s.status,
          s.started_at,
          t.id AS template_id,
          t.title,
          t.target_role,
          t.difficulty
        FROM interview_sessions s
        JOIN interview_templates t ON t.id = s.template_id
        WHERE s.id = $1
      `,
      [sessionId]
    );

    if (!result.rowCount) {
      throw notFound("Interview session not found");
    }

    const questions = await pool.query(
      `
        SELECT id, question_order, question_text, rubric_hint, expected_duration_seconds
        FROM interview_questions
        WHERE template_id = $1
        ORDER BY question_order ASC
      `,
      [result.rows[0].template_id]
    );

    const answers = await pool.query(
      `
        SELECT question_id, answer_text, answered_at
        FROM interview_answers
        WHERE session_id = $1
      `,
      [sessionId]
    );

    return {
      session: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        startedAt: result.rows[0].started_at,
        template: {
          id: result.rows[0].template_id,
          title: result.rows[0].title,
          targetRole: result.rows[0].target_role,
          difficulty: result.rows[0].difficulty
        }
      },
      questions: questions.rows.map(toQuestion),
      answers: answers.rows.map((row) => ({
        questionId: row.question_id,
        answerText: row.answer_text,
        answeredAt: row.answered_at
      }))
    };
  }

  async saveLiveAnswer(sessionId: string, questionId: string, answerText: string) {
    return this.saveAnswers(sessionId, {
      answers: [
        {
          questionId,
          answerText
        }
      ]
    });
  }

  async logLiveEvent(sessionId: string, eventType: string, payload: unknown, questionId?: string) {
    await pool.query(
      `
        INSERT INTO live_interview_events (session_id, question_id, event_type, payload)
        VALUES ($1, $2, $3, $4)
      `,
      [sessionId, questionId ?? null, eventType, JSON.stringify(payload ?? {})]
    );
  }

  async getFeedback(sessionId: string) {
    const result = await pool.query(
      `
        SELECT
          fr.id,
          fr.session_id,
          fr.overall_score,
          fr.readiness_level,
          fr.summary,
          fr.strengths_json,
          fr.weaknesses_json,
          fr.recommendations_json,
          fr.per_question_json,
          fr.created_at
        FROM feedback_reports fr
        WHERE fr.session_id = $1
      `,
      [sessionId]
    );

    if (!result.rowCount) {
      throw notFound("Feedback report not found");
    }

    const row = result.rows[0];
    return {
      feedback: {
        id: row.id,
        sessionId: row.session_id,
        overallScore: row.overall_score,
        readinessLevel: row.readiness_level,
        summary: row.summary,
        strengths: row.strengths_json,
        weaknesses: row.weaknesses_json,
        recommendations: row.recommendations_json,
        perQuestion: row.per_question_json,
        createdAt: row.created_at
      }
    };
  }
}
