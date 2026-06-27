import { config } from "../../config.js";
import { HttpAiEvaluator } from "./httpAiEvaluator.js";
import { MockAiEvaluator } from "./mockAiEvaluator.js";
import type { AiEvaluator } from "./types.js";

export function createAiEvaluator(): AiEvaluator {
  const mock = new MockAiEvaluator();

  if (config.AI_PROVIDER !== "http") {
    return mock;
  }

  const http = new HttpAiEvaluator(config.AI_SERVICE_URL);
  return {
    async evaluateInterview(input) {
      try {
        return await http.evaluateInterview(input);
      } catch (error) {
        console.warn("AI HTTP evaluator failed; falling back to mock evaluator", error);
        return mock.evaluateInterview(input);
      }
    }
  };
}
