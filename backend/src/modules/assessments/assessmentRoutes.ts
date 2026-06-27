import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../../shared/validate.js";
import { AssessmentService } from "./assessmentService.js";
import { AssessmentQuerySchema, SubmitAssessmentSchema } from "./schemas.js";

const IdParamSchema = z.object({ id: z.string().uuid() });

export function createAssessmentRoutes() {
  const router = Router();
  const service = new AssessmentService();

  router.get("/assessments", async (req, res, next) => {
    try {
      const query = AssessmentQuerySchema.parse(req.query);
      res.json(await service.listAssessments(query));
    } catch (error) {
      next(error);
    }
  });

  router.get("/assessments/:id", async (req, res, next) => {
    try {
      const params = IdParamSchema.parse(req.params);
      res.json(await service.getAssessment(params.id));
    } catch (error) {
      next(error);
    }
  });

  router.get("/assessments/:id/questions", async (req, res, next) => {
    try {
      const params = IdParamSchema.parse(req.params);
      res.json(await service.getQuestions(params.id));
    } catch (error) {
      next(error);
    }
  });

  router.post("/assessments/:id/submit", validateBody(SubmitAssessmentSchema), async (req, res, next) => {
    try {
      const params = IdParamSchema.parse(req.params);
      res.status(201).json(await service.submitAssessment(params.id, req.body));
    } catch (error) {
      next(error);
    }
  });

  router.get("/assessment-attempts/:id", async (req, res, next) => {
    try {
      const params = IdParamSchema.parse(req.params);
      res.json(await service.getAttempt(params.id));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
