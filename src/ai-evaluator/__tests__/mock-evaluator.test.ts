import { describe, it, expect } from "vitest";
import { mockEvaluate } from "../mock-evaluator";
import { validateEvaluationOutput } from "../validator";
import type { EvaluateInterviewInput } from "../types";

const normalInput: EvaluateInterviewInput = {
  templateTitle: "Software Engineer Interview",
  targetRole: "Software Engineer",
  difficulty: "medium",
  questions: [
    {
      questionId: "se-001",
      questionText: "Tell me about a technical project you are proud of.",
      answerText:
        "I built a dashboard using React and Node.js. We chose WebSocket over polling because it reduced latency significantly. The tradeoff was increased server complexity, but we managed it with a message queue. The result was a 70% improvement in response time.",
    },
    {
      questionId: "se-002",
      questionText: "Describe a time you debugged a production issue.",
      answerText:
        "We had a memory leak causing crashes every 6 hours. I analyzed heap snapshots, found uncleared event listeners, and fixed the root cause. Memory usage dropped 40% and crashes stopped.",
    },
    {
      questionId: "se-003",
      questionText: "How would you handle 10x traffic growth?",
      answerText:
        "I would profile the system first, add caching with Redis, use horizontal scaling behind a load balancer, and move heavy tasks to a queue. I would measure impact at each step.",
    },
  ],
};

const emptyAnswerInput: EvaluateInterviewInput = {
  templateTitle: "Software Engineer Interview",
  targetRole: "Software Engineer",
  difficulty: "easy",
  questions: [
    {
      questionId: "q1",
      questionText: "Tell me about yourself.",
      answerText: "",
    },
    {
      questionId: "q2",
      questionText: "Why do you want this role?",
      answerText: "I like coding.",
    },
  ],
};

const nonTechnicalInput: EvaluateInterviewInput = {
  templateTitle: "Sales Interview",
  targetRole: "Sales Manager",
  difficulty: "medium",
  questions: [
    {
      questionId: "s1",
      questionText: "Tell me about a deal you closed.",
      answerText:
        "I worked with a large enterprise customer who was hesitant about our pricing. I focused on building trust by demonstrating ROI through a pilot program. The result was a $500K annual contract.",
    },
  ],
};

const hardDifficultyInput: EvaluateInterviewInput = {
  templateTitle: "Senior Engineer Interview",
  targetRole: "Software Engineer",
  difficulty: "hard",
  questions: [
    {
      questionId: "h1",
      questionText: "Design a distributed caching system.",
      answerText: "I would use Redis.",
    },
  ],
};

const specialCharsInput: EvaluateInterviewInput = {
  templateTitle: 'Interview "Test"',
  targetRole: "Software Engineer",
  difficulty: "easy",
  questions: [
    {
      questionId: "sc1",
      questionText: 'What about "edge cases" & performance?',
      answerText:
        'I handle edge cases like null/undefined values, empty strings "", and special chars like <>&. The team appreciated my approach because it reduced bugs by 50%.',
    },
  ],
};

describe("mockEvaluate", () => {
  it("returns valid JSON for normal case with 3 questions", () => {
    const result = mockEvaluate(normalInput);
    const errors = validateEvaluationOutput(result, normalInput.questions.length);

    expect(errors).toHaveLength(0);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.perQuestion).toHaveLength(3);
    expect(result.summary).toBeTruthy();
    expect(result.strengths.length).toBeGreaterThanOrEqual(2);
    expect(result.weaknesses.length).toBeGreaterThanOrEqual(2);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(3);
  });

  it("produces deterministic output for same input", () => {
    const result1 = mockEvaluate(normalInput);
    const result2 = mockEvaluate(normalInput);

    expect(result1.overallScore).toBe(result2.overallScore);
    expect(result1.readinessLevel).toBe(result2.readinessLevel);
    expect(result1.perQuestion[0].score).toBe(result2.perQuestion[0].score);
  });

  it("scores empty answers low", () => {
    const result = mockEvaluate(emptyAnswerInput);
    const errors = validateEvaluationOutput(result, emptyAnswerInput.questions.length);

    expect(errors).toHaveLength(0);
    expect(result.perQuestion[0].score).toBeLessThanOrEqual(45);
    expect(result.perQuestion[1].score).toBeLessThanOrEqual(65);
  });

  it("handles non-technical roles", () => {
    const result = mockEvaluate(nonTechnicalInput);
    const errors = validateEvaluationOutput(result, nonTechnicalInput.questions.length);

    expect(errors).toHaveLength(0);
    expect(result.perQuestion).toHaveLength(1);
    expect(result.perQuestion[0].dimensionScores.technicalCorrectness).toBeDefined();
  });

  it("scores short answers for hard difficulty appropriately", () => {
    const result = mockEvaluate(hardDifficultyInput);
    const errors = validateEvaluationOutput(result, hardDifficultyInput.questions.length);

    expect(errors).toHaveLength(0);
    expect(result.perQuestion[0].score).toBeLessThanOrEqual(65);
  });

  it("handles special characters in input without breaking", () => {
    const result = mockEvaluate(specialCharsInput);
    const errors = validateEvaluationOutput(result, specialCharsInput.questions.length);
    const json = JSON.stringify(result);

    expect(errors).toHaveLength(0);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("readinessLevel matches overallScore threshold", () => {
    const result = mockEvaluate(normalInput);

    if (result.overallScore >= 80) expect(result.readinessLevel).toBe("ready");
    else if (result.overallScore >= 60) expect(result.readinessLevel).toBe("almost_ready");
    else expect(result.readinessLevel).toBe("needs_practice");
  });

  it("all dimension scores are between 0 and 100", () => {
    const result = mockEvaluate(normalInput);
    const allScores = [
      result.dimensionScores,
      ...result.perQuestion.map((q) => q.dimensionScores),
    ];

    for (const scores of allScores) {
      for (const [, value] of Object.entries(scores)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });
});
