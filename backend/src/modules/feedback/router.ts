import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../db/client";
import { NotFoundError } from "../../shared/errors";

const router = Router();

router.get("/:id/feedback", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await prisma.feedbackReport.findFirst({
      where: { session: { id: req.params.id } },
      include: {
        session: {
          include: {
            template: true,
            user: true,
          },
        },
      },
    });

    if (!report) throw new NotFoundError("FeedbackReport for session", req.params.id);

    res.json({
      reportId: report.id,
      sessionId: report.sessionId,
      candidate: {
        name: report.session.user.name,
        email: report.session.user.email,
      },
      template: {
        title: report.session.template.title,
        targetRole: report.session.template.targetRole,
        difficulty: report.session.template.difficulty,
      },
      overallScore: report.overallScore,
      readinessLevel: report.readinessLevel,
      summary: report.summary,
      strengths: report.strengthsJson,
      weaknesses: report.weaknessesJson,
      recommendations: report.recommendationsJson,
      perQuestion: report.perQuestionJson,
      createdAt: report.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

export { router as feedbackRouter };
