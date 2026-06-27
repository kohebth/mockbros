export type EvaluateInterviewInput = {
  templateTitle: string;
  targetRole: string;
  difficulty: string;
  questions: Array<{
    questionId: string;
    questionText: string;
    rubricHint?: string | null;
    answerText: string;
  }>;
};

export type ReadinessLevel = "needs_practice" | "almost_ready" | "ready";

export type EvaluateInterviewOutput = {
  overallScore: number;
  readinessLevel: ReadinessLevel;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  perQuestion: Array<{
    questionId: string;
    score: number;
    feedback: string;
    improvedAnswer: string;
  }>;
};

export interface AiEvaluator {
  evaluateInterview(input: EvaluateInterviewInput): Promise<EvaluateInterviewOutput>;
}
