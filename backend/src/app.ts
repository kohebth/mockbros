import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import { config } from "./config.js";
import { pool } from "./db/client.js";
import { createInterviewRoutes } from "./modules/interviews/interviewRoutes.js";
import { HttpError } from "./shared/errors.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", async (_req, res, next) => {
    try {
      await pool.query("SELECT 1");
      res.json({
        status: "ok",
        service: "mockbros-api"
      });
    } catch (error) {
      next(error);
    }
  });

  app.use(createInterviewRoutes());

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        message: "Route not found"
      }
    });
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: {
          message: "Invalid request",
          details: error.flatten()
        }
      });
      return;
    }

    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        error: {
          message: error.message,
          details: error.details
        }
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      error: {
        message: "Internal server error"
      }
    });
  };

  app.use(errorHandler);

  return app;
}
