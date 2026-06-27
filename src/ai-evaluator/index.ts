import type {
  EvaluateInterviewInput,
  EvaluateInterviewOutput,
  EvaluatorOptions,
} from "./types";
import { mockEvaluate } from "./mock-evaluator";
import { llmEvaluate } from "./llm-evaluator";
import { validateEvaluationOutput, isValidOutput } from "./validator";

export async function evaluateInterview(
  input: EvaluateInterviewInput,
  options: EvaluatorOptions = {}
): Promise<EvaluateInterviewOutput> {
  const { apiKey, baseUrl, model, useMock } = options;

  if (useMock || !apiKey) {
    return mockEvaluate(input);
  }

  return llmEvaluate(input, { apiKey, baseUrl, model });
}

export { mockEvaluate } from "./mock-evaluator";
export { llmEvaluate } from "./llm-evaluator";
export { validateEvaluationOutput, isValidOutput } from "./validator";
export { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
export {
  calculateWeightedScore,
  getReadinessLevel,
  clampScore,
  averageDimensionScores,
} from "./rubric";
export { interviewQuestions } from "./data/questions";
export { sampleAnswers, sampleFeedback } from "./data/sample-feedback";

export type {
  EvaluateInterviewInput,
  EvaluateInterviewOutput,
  DimensionScores,
  DimensionKey,
  PerQuestionResult,
  ReadinessLevel,
  InterviewQuestion,
  EvaluatorOptions,
} from "./types";
export { DIMENSION_KEYS, DIMENSION_WEIGHTS } from "./types";
