import { AiEvaluator, EvaluateInterviewInput, EvaluateInterviewOutput } from "./types";
import { MockAiEvaluator } from "./mock";

export class HttpAiEvaluator implements AiEvaluator {
  private fallback = new MockAiEvaluator();

  constructor(private serviceUrl: string) {}

  async evaluateInterview(input: EvaluateInterviewInput): Promise<EvaluateInterviewOutput> {
    try {
      const response = await fetch(`${this.serviceUrl}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        console.error(`AI service returned ${response.status}, falling back to mock`);
        return this.fallback.evaluateInterview(input);
      }

      return (await response.json()) as EvaluateInterviewOutput;
    } catch (error) {
      console.error("AI service error, falling back to mock:", error);
      return this.fallback.evaluateInterview(input);
    }
  }
}
