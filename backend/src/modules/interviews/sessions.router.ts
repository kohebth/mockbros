import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../db/client";
import { NotFoundError, ConflictError, ValidationError } from "../../shared/errors";
import { validateBody } from "../../shared/validate";
import { aiEvaluator, EvaluateInterviewInput } from "../../providers/ai";

const router = Router();

const createSessionSchema = z.object({
  templateId: z.string().uuid(),
  userName: z.string().min(1).max(200),
  userEmail: z.string().email(),
});

router.post("/", validateBody(createSessionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateId, userName, userEmail } = req.body;

    const template = await prisma.interviewTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new NotFoundError("InterviewTemplate", templateId);

    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { name: userName },
      create: { email: userEmail, name: userName },
    });

    const session = await prisma.interviewSession.create({
      data: { userId: user.id, templateId },
    });

    res.status(201).json({ sessionId: session.id, status: session.status });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/start", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: req.params.id },
      include: {
        template: {
          include: { questions: { orderBy: { questionOrder: "asc" } } },
        },
      },
    });

    if (!session) throw new NotFoundError("InterviewSession", req.params.id);
    if (session.status !== "created") {
      throw new ConflictError(`Session is already '${session.status}', cannot start`);
    }

    const updated = await prisma.interviewSession.update({
      where: { id: session.id },
      data: { status: "in_progress", startedAt: new Date() },
    });

    res.json({
      sessionId: updated.id,
      status: updated.status,
      template: {
        id: session.template.id,
        title: session.template.title,
        targetRole: session.template.targetRole,
        difficulty: session.template.difficulty,
      },
      questions: session.template.questions.map((q) => ({
        id: q.id,
        questionOrder: q.questionOrder,
        questionText: q.questionText,
        expectedDurationSeconds: q.expectedDurationSeconds,
      })),
    });
  } catch (error) {
    next(error);
  }
});

const submitAnswersSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answerText: z.string().min(1),
    })
  ).min(1),
});

router.post("/:id/answers", validateBody(submitAnswersSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await prisma.interviewSession.findUnique({ where: { id: req.params.id } });
    if (!session) throw new NotFoundError("InterviewSession", req.params.id);
    if (session.status !== "in_progress") {
      throw new ConflictError(`Session is '${session.status}', must be 'in_progress' to submit answers`);
    }

    const { answers } = req.body;
    const now = new Date();

    await prisma.$transaction(
      answers.map((a: { questionId: string; answerText: string }) =>
        prisma.interviewAnswer.upsert({
          where: {
            sessionId_questionId: { sessionId: session.id, questionId: a.questionId },
          },
          update: { answerText: a.answerText, answeredAt: now },
          create: {
            sessionId: session.id,
            questionId: a.questionId,
            answerText: a.answerText,
            answeredAt: now,
          },
        })
      )
    );

    res.json({ sessionId: session.id, answersReceived: answers.length });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/submit", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: req.params.id },
      include: {
        template: true,
        answers: { include: { question: true } },
      },
    });

    if (!session) throw new NotFoundError("InterviewSession", req.params.id);
    if (session.status !== "in_progress") {
      throw new ConflictError(`Session is '${session.status}', must be 'in_progress' to submit`);
    }
    if (session.answers.length === 0) {
      throw new ValidationError("No answers submitted yet");
    }

    await prisma.interviewSession.update({
      where: { id: session.id },
      data: { status: "submitted", submittedAt: new Date() },
    });

    const evalInput: EvaluateInterviewInput = {
      templateTitle: session.template.title,
      targetRole: session.template.targetRole,
      difficulty: session.template.difficulty,
      questions: session.answers.map((a) => ({
        questionId: a.questionId,
        questionText: a.question.questionText,
        rubricHint: a.question.rubricHint ?? undefined,
        answerText: a.answerText,
      })),
    };

    let evalOutput;
    try {
      evalOutput = await aiEvaluator.evaluateInterview(evalInput);
    } catch {
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: { status: "failed" },
      });
      throw new Error("AI evaluation failed");
    }

    const report = await prisma.feedbackReport.create({
      data: {
        sessionId: session.id,
        overallScore: evalOutput.overallScore,
        readinessLevel: evalOutput.readinessLevel,
        summary: evalOutput.summary,
        strengthsJson: evalOutput.strengths,
        weaknessesJson: evalOutput.weaknesses,
        recommendationsJson: evalOutput.recommendations,
        perQuestionJson: evalOutput.perQuestion,
        rawAiJson: evalOutput,
      },
    });

    await prisma.interviewSession.update({
      where: { id: session.id },
      data: { status: "completed" },
    });

    res.json({
      sessionId: session.id,
      status: "completed",
      feedbackReportId: report.id,
    });
  } catch (error) {
    next(error);
  }
});

export { router as interviewSessionsRouter };
