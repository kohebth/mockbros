import { Router } from "express";
import { z } from "zod";
import { ContentService } from "./contentService.js";

const IdParamSchema = z.object({ id: z.string().uuid() });

export function createContentRoutes() {
  const router = Router();
  const service = new ContentService();

  router.get("/product-facts", async (_req, res, next) => {
    try {
      res.json(await service.listProductFacts());
    } catch (error) {
      next(error);
    }
  });

  router.get("/industries", async (_req, res, next) => {
    try {
      res.json(await service.listIndustries());
    } catch (error) {
      next(error);
    }
  });

  router.get("/professions", async (_req, res, next) => {
    try {
      res.json(await service.listProfessions());
    } catch (error) {
      next(error);
    }
  });

  router.get("/industries/:id/professions", async (req, res, next) => {
    try {
      const params = IdParamSchema.parse(req.params);
      res.json(await service.listProfessions(params.id));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
