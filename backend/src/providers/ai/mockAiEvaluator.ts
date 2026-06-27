import type { AiEvaluator, EvaluateInterviewInput, EvaluateInterviewOutput, ReadinessLevel } from "./types.js";

function scoreAnswer(answer: string): number {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 28;
  if (words.length < 20) return 48;
  if (words.length < 45) return 62;

  const strongSignals = ["because", "tradeoff", "result", "impact", "user", "team", "metric", "learned"];
  const signalCount = strongSignals.filter((signal) => answer.toLowerCase().includes(signal)).length;
  return Math.min(90, 68 + signalCount * 4 + Math.floor(words.length / 35));
}

function readinessFromScore(score: number): ReadinessLevel {
  if (score >= 80) return "ready";
  if (score >= 60) return "almost_ready";
  return "needs_practice";
}

export class MockAiEvaluator implements AiEvaluator {
  async evaluateInterview(input: EvaluateInterviewInput): Promise<EvaluateInterviewOutput> {
    const perQuestion = input.questions.map((question) => {
      const score = scoreAnswer(question.answerText);
      const tooShort = question.answerText.trim().split(/\s+/).filter(Boolean).length < 20;

      return {
        questionId: question.questionId,
        score,
        feedback: tooShort
          ? "Your answer is understandable but too short. Add context, your specific action, and the result."
          : "Your answer is relevant. Make it stronger by stating the situation, your action, the tradeoff, and the measurable result.",
        improvedAnswer:
          `A stronger answer for this ${input.targetRole} question would briefly explain the context, ` +
          "name your personal contribution, describe one tradeoff, and close with the outcome."
      };
    });

    const overallScore = Math.round(
      perQuestion.reduce((total, question) => total + question.score, 0) / Math.max(perQuestion.length, 1)
    );
    const readinessLevel = readinessFromScore(overallScore);

    return {
      overallScore,
      readinessLevel,
      summary:
        readinessLevel === "ready"
          ? "Your answers are clear, relevant, and close to interview-ready. Keep adding concrete results."
          : "Your answers are relevant but need stronger structure, more specific examples, and clearer impact.",
      strengths: [
        "You responded directly to the interview questions.",
        "You included useful context for the interviewer."
      ],
      weaknesses: [
        "Some answers need a clearer result or measurable impact.",
        "The structure can be easier to follow with Situation, Action, and Result."
      ],
      recommendations: [
        "Use the STAR structure for each answer.",
        "Add one concrete metric, user impact, or business outcome.",
        "Close each answer with what you learned or changed afterward."
      ],
      perQuestion
    };
  }
}
