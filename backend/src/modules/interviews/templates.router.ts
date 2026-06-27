import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../db/client";
import { NotFoundError } from "../../shared/errors";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await prisma.interviewTemplate.findMany({
      include: { _count: { select: { questions: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      templates: templates.map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        targetRole: t.targetRole,
        difficulty: t.difficulty,
        description: t.description,
        questionCount: t._count.questions,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await prisma.interviewTemplate.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { orderBy: { questionOrder: "asc" } },
      },
    });

    if (!template) throw new NotFoundError("InterviewTemplate", req.params.id);

    res.json({
      id: template.id,
      slug: template.slug,
      title: template.title,
      targetRole: template.targetRole,
      difficulty: template.difficulty,
      description: template.description,
      questions: template.questions.map((q) => ({
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

export { router as interviewTemplatesRouter };
