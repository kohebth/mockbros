import type {
  EvaluateInterviewInput,
  EvaluateInterviewOutput,
} from "./types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import { validateEvaluationOutput } from "./validator";
import { mockEvaluate } from "./mock-evaluator";

type LLMEvaluatorOptions = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxRetries?: number;
};

export async function llmEvaluate(
  input: EvaluateInterviewInput,
  options: LLMEvaluatorOptions
): Promise<EvaluateInterviewOutput> {
  const {
    apiKey,
    baseUrl = "https://api.openai.com/v1",
    model = "gpt-4o-mini",
    maxRetries = 2,
  } = options;

  const userPrompt = buildUserPrompt(input);
  const questionCount = input.questions.length;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: attempt === 0 ? 0.1 : 0,
          max_tokens: 4500,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response");

      const parsed = JSON.parse(content);
      const errors = validateEvaluationOutput(parsed, questionCount);
      if (errors.length === 0) return parsed as EvaluateInterviewOutput;

      throw new Error(`Validation: ${errors[0].message}`);
    } catch {
      if (attempt === maxRetries) return mockEvaluate(input);
    }
  }

  return mockEvaluate(input);
}
