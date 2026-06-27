import type { RequestHandler } from "express";
import type { z } from "zod";
import { badRequest } from "./errors.js";

export function validateBody<T extends z.ZodTypeAny>(schema: T): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(badRequest("Invalid request body", parsed.error.flatten()));
      return;
    }
    req.body = parsed.data;
    next();
  };
}
