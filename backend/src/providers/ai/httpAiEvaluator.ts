import type { AiEvaluator, EvaluateInterviewInput, EvaluateInterviewOutput } from "./types.js";

export class HttpAiEvaluator implements AiEvaluator {
  constructor(private readonly serviceUrl: string) {}

  async evaluateInterview(input: EvaluateInterviewInput): Promise<EvaluateInterviewOutput> {
    const response = await fetch(`${this.serviceUrl.replace(/\/$/, "")}/evaluate-interview`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}`);
    }

    return (await response.json()) as EvaluateInterviewOutput;
  }
}
