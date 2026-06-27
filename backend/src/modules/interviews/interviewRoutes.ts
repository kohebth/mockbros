import { Router } from "express";
import { z } from "zod";
import { createAiEvaluator } from "../../providers/ai/index.js";
import { validateBody } from "../../shared/validate.js";
import { CreateInterviewSchema, SubmitAnswersSchema } from "./schemas.js";
import { InterviewService } from "./interviewService.js";

const IdParamSchema = z.object({ id: z.string().uuid() });

export function createInterviewRoutes() {
  const router = Router();
  const service = new InterviewService(createAiEvaluator());

  router.get("/interview-templates", async (_req, res, next) => {
    try {
      res.json(await service.listTemplates());
    } catch (error) {
      next(error);
    }
  });

  router.get("/interview-templates/:id", async (req, res, next) => {
    try {
      const params = IdParamSchema.parse(req.params);
      res.json(await service.getTemplate(params.id));
    } catch (error) {
      next(error);
    }
  });

  router.post("/interviews", validateBody(CreateInterviewSchema), async (req, res, next) => {
    try {
      res.status(201).json(await service.createInterview(req.body));
    } catch (error) {
      next(error);
    }
  });

  router.post("/interviews/:id/start", async (req, res, next) => {
    try {
      const params = IdParamSchema.parse(req.params);
      res.json(await service.startInterview(params.id));
    } catch (error) {
      next(error);
    }
  });

  router.post("/interviews/:id/answers", validateBody(SubmitAnswersSchema), async (req, res, next) => {
    try {
      const params = IdParamSchema.parse(req.params);
      res.json(await service.saveAnswers(params.id, req.body));
    } catch (error) {
      next(error);
    }
  });

  router.post("/interviews/:id/submit", async (req, res, next) => {
    try {
      const params = IdParamSchema.parse(req.params);
      res.json(await service.submitInterview(params.id));
    } catch (error) {
      next(error);
    }
  });

  router.get("/interviews/:id/feedback", async (req, res, next) => {
    try {
      const params = IdParamSchema.parse(req.params);
      res.json(await service.getFeedback(params.id));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
