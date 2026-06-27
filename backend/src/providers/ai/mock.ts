import { AiEvaluator, EvaluateInterviewInput, EvaluateInterviewOutput } from "./types";

export class MockAiEvaluator implements AiEvaluator {
  async evaluateInterview(input: EvaluateInterviewInput): Promise<EvaluateInterviewOutput> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const perQuestion = input.questions.map((q) => {
      const answerLength = q.answerText.trim().length;
      const score = Math.min(10, Math.max(3, Math.round(answerLength / 20)));
      return {
        questionId: q.questionId,
        score,
        feedback: `Your answer demonstrates ${score >= 7 ? "strong" : "developing"} understanding of the topic. ${score >= 7 ? "Good use of specific examples." : "Consider providing more concrete examples."}`,
        improvedAnswer: `A stronger answer would include: specific metrics, concrete examples from your experience, and a clear structure (Situation, Task, Action, Result). For the question "${q.questionText.substring(0, 50)}...", consider elaborating on the impact of your decisions.`,
      };
    });

    const avgScore = perQuestion.reduce((sum, pq) => sum + pq.score, 0) / perQuestion.length;
    const overallScore = Math.round(avgScore * 10) / 10;

    let readinessLevel: EvaluateInterviewOutput["readinessLevel"];
    if (overallScore >= 7) readinessLevel = "ready";
    else if (overallScore >= 5) readinessLevel = "almost_ready";
    else readinessLevel = "needs_practice";

    return {
      overallScore,
      readinessLevel,
      summary: `Overall ${readinessLevel === "ready" ? "strong" : readinessLevel === "almost_ready" ? "promising" : "developing"} performance for the ${input.targetRole} role (${input.difficulty} level). Your answers show ${overallScore >= 7 ? "solid preparation" : "room for improvement"} across ${input.questions.length} questions.`,
      strengths: [
        "Demonstrates willingness to engage with interview questions",
        "Shows awareness of the role requirements",
        overallScore >= 6 ? "Provides structured responses" : "Attempts to address key points",
      ],
      weaknesses: [
        overallScore < 7 ? "Answers could benefit from more specific examples" : "Minor areas for deeper technical depth",
        "Consider using the STAR method more consistently",
        "Some responses could be more concise",
      ],
      recommendations: [
        "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions",
        `Review common ${input.targetRole} interview patterns`,
        "Prepare 3-5 strong examples from your experience that can be adapted to different questions",
        "Time your responses to stay within 2-3 minutes per answer",
      ],
      perQuestion,
    };
  }
}
