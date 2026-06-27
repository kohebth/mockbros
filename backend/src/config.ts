import "dotenv/config";
import { z } from "zod";

const ConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8).default("dev-secret-change-later"),
  AI_PROVIDER: z.enum(["mock", "http"]).default("mock"),
  AI_SERVICE_URL: z.string().url().default("http://localhost:4000")
});

export const config = ConfigSchema.parse(process.env);
