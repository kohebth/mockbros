import { config } from "../../config.js";
import { HttpAiEvaluator } from "./httpAiEvaluator.js";
import { MockAiEvaluator } from "./mockAiEvaluator.js";
import { OpenAiEvaluator } from "./openAiEvaluator.js";
import type { AiEvaluator } from "./types.js";

export function createAiEvaluator(): AiEvaluator {
  const mock = new MockAiEvaluator();

  if (config.AI_PROVIDER === "openai") {
    if (!config.OPENAI_KEY) {
      console.warn("AI_PROVIDER=openai but OPENAI_KEY is missing; falling back to mock");
      return mock;
    }

    const openai = new OpenAiEvaluator(config.OPENAI_KEY);
    return {
      async evaluateInterview(input) {
        try {
          return await openai.evaluateInterview(input);
        } catch (error) {
          console.warn("OpenAI evaluator failed; falling back to mock evaluator", error);
          return mock.evaluateInterview(input);
        }
      },
    };
  }

  if (config.AI_PROVIDER === "http") {
    const http = new HttpAiEvaluator(config.AI_SERVICE_URL);
    return {
      async evaluateInterview(input) {
        try {
          return await http.evaluateInterview(input);
        } catch (error) {
          console.warn("AI HTTP evaluator failed; falling back to mock evaluator", error);
          return mock.evaluateInterview(input);
        }
      },
    };
  }

  return mock;
}
