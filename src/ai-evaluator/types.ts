export type ReadinessLevel = "needs_practice" | "almost_ready" | "ready";

export type DimensionKey =
  | "clarity"
  | "relevance"
  | "structure"
  | "confidence"
  | "technicalCorrectness"
  | "communication"
  | "authenticity";

export type DimensionScores = Record<DimensionKey, number>;

export type PerQuestionResult = {
  questionId: string;
  question: string;
  score: number;
  dimensionScores: DimensionScores;
  feedback: string;
  improvedAnswer: string;
};

export type EvaluateInterviewInput = {
  templateTitle: string;
  targetRole: string;
  difficulty: string;
  questions: Array<{
    questionId: string;
    questionText: string;
    rubricHint?: string;
    answerText: string;
  }>;
};

export type EvaluateInterviewOutput = {
  overallScore: number;
  readinessLevel: ReadinessLevel;
  summary: string;
  dimensionScores: DimensionScores;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  perQuestion: PerQuestionResult[];
};

export type InterviewQuestion = {
  id: string;
  interviewType: string;
  targetRole: string;
  difficulty: string;
  questionText: string;
  rubricHint: string;
  strongAnswerSignals: string[];
  weakAnswerSignals: string[];
};

export type EvaluatorOptions = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  useMock?: boolean;
};

export const DIMENSION_KEYS: DimensionKey[] = [
  "clarity",
  "relevance",
  "structure",
  "confidence",
  "technicalCorrectness",
  "communication",
  "authenticity",
];

export const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  clarity: 0.15,
  relevance: 0.2,
  structure: 0.15,
  confidence: 0.1,
  technicalCorrectness: 0.2,
  communication: 0.1,
  authenticity: 0.1,
};
