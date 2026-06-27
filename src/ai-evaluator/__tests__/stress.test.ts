import { describe, it, expect } from "vitest";
import { mockEvaluate } from "../mock-evaluator";
import { validateEvaluationOutput } from "../validator";
import { evaluateInterview } from "../index";
import { sampleFeedback, sampleAnswers } from "../data/sample-feedback";
import { interviewQuestions } from "../data/questions";
import type { EvaluateInterviewInput } from "../types";

function makeInput(
  overrides: Partial<EvaluateInterviewInput> & {
    questions: EvaluateInterviewInput["questions"];
  }
): EvaluateInterviewInput {
  return {
    templateTitle: overrides.templateTitle ?? "Stress Test Interview",
    targetRole: overrides.targetRole ?? "Software Engineer",
    difficulty: overrides.difficulty ?? "medium",
    questions: overrides.questions,
  };
}

describe("Stress Test: Boundary Inputs", () => {
  it("handles 0 questions gracefully", () => {
    const input = makeInput({ questions: [] });
    const result = mockEvaluate(input);
    const errors = validateEvaluationOutput(result, 0);

    expect(errors).toHaveLength(0);
    expect(result.perQuestion).toHaveLength(0);
    expect(result.overallScore).toBe(0);
    expect(result.readinessLevel).toBe("needs_practice");
  });

  it("handles 1 question", () => {
    const input = makeInput({
      questions: [
        {
          questionId: "single",
          questionText: "One question only.",
          answerText: "One answer with enough words to be classified as medium length for the evaluator system.",
        },
      ],
    });
    const result = mockEvaluate(input);
    const errors = validateEvaluationOutput(result, 1);

    expect(errors).toHaveLength(0);
    expect(result.perQuestion).toHaveLength(1);
  });

  it("handles 20 questions without performance degradation", () => {
    const questions = Array.from({ length: 20 }, (_, i) => ({
      questionId: `bulk-${i}`,
      questionText: `Question number ${i + 1} about software engineering topics.`,
      answerText: `This is answer ${i + 1}. I worked on a project where the team needed to handle complex requirements and I contributed by designing the solution and measuring the result with metrics.`,
    }));
    const input = makeInput({ questions });

    const start = performance.now();
    const result = mockEvaluate(input);
    const elapsed = performance.now() - start;

    const errors = validateEvaluationOutput(result, 20);
    expect(errors).toHaveLength(0);
    expect(result.perQuestion).toHaveLength(20);
    expect(elapsed).toBeLessThan(100);
  });

  it("handles 50 questions", () => {
    const questions = Array.from({ length: 50 }, (_, i) => ({
      questionId: `mass-${i}`,
      questionText: `Mass question ${i}`,
      answerText: i % 3 === 0 ? "" : `Answer ${i} with some content about team impact and result.`,
    }));
    const input = makeInput({ questions });
    const result = mockEvaluate(input);
    const errors = validateEvaluationOutput(result, 50);

    expect(errors).toHaveLength(0);
    expect(result.perQuestion).toHaveLength(50);
  });
});

describe("Stress Test: Extreme Answer Content", () => {
  it("handles very long answer (5000 chars)", () => {
    const longAnswer = "I built a system that handles real-time data processing. ".repeat(100);
    const input = makeInput({
      questions: [
        { questionId: "long", questionText: "Tell me about your work.", answerText: longAnswer },
      ],
    });
    const result = mockEvaluate(input);
    const errors = validateEvaluationOutput(result, 1);

    expect(errors).toHaveLength(0);
    expect(result.perQuestion[0].score).toBeGreaterThanOrEqual(0);
    expect(result.perQuestion[0].score).toBeLessThanOrEqual(100);
  });

  it("handles answer with only whitespace", () => {
    const input = makeInput({
      questions: [
        { questionId: "ws", questionText: "Question?", answerText: "   \n\t  \n  " },
      ],
    });
    const result = mockEvaluate(input);
    const errors = validateEvaluationOutput(result, 1);

    expect(errors).toHaveLength(0);
    expect(result.perQuestion[0].score).toBeLessThanOrEqual(45);
  });

  it("handles answer with only newlines", () => {
    const input = makeInput({
      questions: [
        { questionId: "nl", questionText: "Question?", answerText: "\n\n\n\n\n" },
      ],
    });
    const result = mockEvaluate(input);

    expect(validateEvaluationOutput(result, 1)).toHaveLength(0);
  });

  it("handles answer with unicode/emoji", () => {
    const input = makeInput({
      questions: [
        {
          questionId: "uni",
          questionText: "Câu hỏi tiếng Việt có dấu?",
          answerText: "Tôi đã làm việc 🚀 trong team 5 người 👨‍💻 và đạt kết quả tốt ✅. Impact rõ ràng vì chúng tôi reduced latency 50% 📉.",
        },
      ],
    });
    const result = mockEvaluate(input);
    const errors = validateEvaluationOutput(result, 1);
    const json = JSON.stringify(result);

    expect(errors).toHaveLength(0);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("handles answer with JSON-breaking characters", () => {
    const input = makeInput({
      questions: [
        {
          questionId: "json-break",
          questionText: 'What about "quotes" and \\backslashes\\?',
          answerText: 'I used {"key": "value"} patterns and handled edge cases like null, undefined, and strings with "nested quotes" and backslash \\ characters. The result was a robust solution.',
        },
      ],
    });
    const result = mockEvaluate(input);
    const json = JSON.stringify(result);

    expect(() => JSON.parse(json)).not.toThrow();
    expect(validateEvaluationOutput(result, 1)).toHaveLength(0);
  });

  it("handles HTML/script injection in answer", () => {
    const input = makeInput({
      questions: [
        {
          questionId: "xss",
          questionText: "Tell me about security.",
          answerText: '<script>alert("xss")</script><img onerror="hack" src=x> I also worked on team security because the impact was significant and the result was measurable.',
        },
      ],
    });
    const result = mockEvaluate(input);

    expect(validateEvaluationOutput(result, 1)).toHaveLength(0);
    expect(JSON.stringify(result)).not.toContain("<script>");
  });
});

describe("Stress Test: All Answer Classifications", () => {
  it("all-empty answers produce needs_practice", () => {
    const input = makeInput({
      questions: [
        { questionId: "e1", questionText: "Q1", answerText: "" },
        { questionId: "e2", questionText: "Q2", answerText: "" },
        { questionId: "e3", questionText: "Q3", answerText: "" },
      ],
    });
    const result = mockEvaluate(input);

    expect(result.readinessLevel).toBe("needs_practice");
    expect(result.overallScore).toBeLessThan(60);
    for (const pq of result.perQuestion) {
      expect(pq.score).toBeLessThanOrEqual(45);
    }
  });

  it("all-strong answers produce high scores", () => {
    const strongAnswer =
      "In my previous role, I led a team of 8 engineers to rebuild our payment processing pipeline. The tradeoff was between using a managed service vs building in-house. We chose in-house because it reduced costs by 40% and improved latency from 500ms to 120ms. The result was a 25% increase in conversion rate, measured over 3 months. I learned that investing in monitoring early saves debugging time later.";

    const input = makeInput({
      questions: [
        { questionId: "s1", questionText: "Q1", answerText: strongAnswer },
        { questionId: "s2", questionText: "Q2", answerText: strongAnswer },
        { questionId: "s3", questionText: "Q3", answerText: strongAnswer },
      ],
    });
    const result = mockEvaluate(input);

    expect(result.overallScore).toBeGreaterThanOrEqual(65);
    expect(["almost_ready", "ready"]).toContain(result.readinessLevel);
  });

  it("mixed answers produce intermediate scores", () => {
    const input = makeInput({
      questions: [
        { questionId: "m1", questionText: "Q1", answerText: "" },
        {
          questionId: "m2",
          questionText: "Q2",
          answerText: "I worked on a project where the team improved performance by 30% because we identified the bottleneck early. The result was significant cost reduction and better user experience.",
        },
        { questionId: "m3", questionText: "Q3", answerText: "I did some work." },
      ],
    });
    const result = mockEvaluate(input);

    expect(result.overallScore).toBeGreaterThan(20);
    expect(result.overallScore).toBeLessThan(85);
    expect(result.perQuestion[0].score).toBeLessThan(result.perQuestion[1].score);
  });
});

describe("Stress Test: Determinism (100 runs)", () => {
  it("produces identical output across 100 runs", () => {
    const input = makeInput({
      questions: sampleAnswers.map((sa) => ({
        questionId: sa.questionId,
        questionText: sa.questionText,
        answerText: sa.answerText,
      })),
    });

    const baseline = mockEvaluate(input);
    const baselineJson = JSON.stringify(baseline);

    for (let i = 0; i < 100; i++) {
      const result = mockEvaluate(input);
      expect(JSON.stringify(result)).toBe(baselineJson);
    }
  });
});

describe("Stress Test: Entry Point Routing", () => {
  it("evaluateInterview defaults to mock when no apiKey", async () => {
    const input = makeInput({
      questions: [
        {
          questionId: "route1",
          questionText: "Test routing",
          answerText: "Testing the evaluateInterview entry point with team collaboration and measurable impact on the result.",
        },
      ],
    });

    const result = await evaluateInterview(input);
    expect(validateEvaluationOutput(result, 1)).toHaveLength(0);
  });

  it("evaluateInterview uses mock when useMock is true", async () => {
    const input = makeInput({
      questions: [
        {
          questionId: "route2",
          questionText: "Test mock flag",
          answerText: "Answer for mock flag test with enough words.",
        },
      ],
    });

    const result = await evaluateInterview(input, { useMock: true, apiKey: "fake-key" });
    expect(validateEvaluationOutput(result, 1)).toHaveLength(0);
  });

  it("evaluateInterview returns same result as mockEvaluate when no apiKey", async () => {
    const input = makeInput({
      questions: sampleAnswers.map((sa) => ({
        questionId: sa.questionId,
        questionText: sa.questionText,
        answerText: sa.answerText,
      })),
    });

    const entryResult = await evaluateInterview(input);
    const directResult = mockEvaluate(input);

    expect(entryResult.overallScore).toBe(directResult.overallScore);
    expect(entryResult.readinessLevel).toBe(directResult.readinessLevel);
  });
});

describe("Stress Test: Sample Feedback Fixture Integrity", () => {
  it("sampleFeedback passes validation", () => {
    const errors = validateEvaluationOutput(sampleFeedback, 3);
    expect(errors).toHaveLength(0);
  });

  it("sampleFeedback is valid JSON round-trip", () => {
    const json = JSON.stringify(sampleFeedback);
    const parsed = JSON.parse(json);
    expect(parsed.overallScore).toBe(sampleFeedback.overallScore);
    expect(parsed.perQuestion).toHaveLength(3);
  });

  it("sampleFeedback has Vietnamese content in feedback fields", () => {
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    expect(vietnamesePattern.test(sampleFeedback.summary)).toBe(true);
    expect(sampleFeedback.strengths.some((s) => vietnamesePattern.test(s))).toBe(true);
    expect(sampleFeedback.perQuestion[0].feedback).toBeTruthy();
    expect(vietnamesePattern.test(sampleFeedback.perQuestion[0].feedback)).toBe(true);
  });
});

describe("Stress Test: TASKS-VDDUY Checklist Compliance", () => {
  it("dataset has 12+ questions (Deliverable 1)", () => {
    expect(interviewQuestions.length).toBeGreaterThanOrEqual(12);
  });

  it("output schema matches contract exactly (Deliverable 3)", () => {
    const input = makeInput({
      questions: [
        { questionId: "contract", questionText: "Q", answerText: "A with team and result." },
      ],
    });
    const result = mockEvaluate(input);

    const topKeys = Object.keys(result).sort();
    const expectedKeys = [
      "dimensionScores",
      "overallScore",
      "perQuestion",
      "readinessLevel",
      "recommendations",
      "strengths",
      "summary",
      "weaknesses",
    ];
    expect(topKeys).toEqual(expectedKeys);

    const dimKeys = Object.keys(result.dimensionScores).sort();
    expect(dimKeys).toEqual([
      "authenticity",
      "clarity",
      "communication",
      "confidence",
      "relevance",
      "structure",
      "technicalCorrectness",
    ]);

    const pqKeys = Object.keys(result.perQuestion[0]).sort();
    expect(pqKeys).toEqual([
      "dimensionScores",
      "feedback",
      "improvedAnswer",
      "question",
      "questionId",
      "score",
    ]);
  });

  it("mock evaluator always returns valid JSON (Deliverable 5)", () => {
    const inputs = [
      makeInput({ questions: [] }),
      makeInput({ questions: [{ questionId: "x", questionText: "Q", answerText: "" }] }),
      makeInput({
        targetRole: "Sales Manager",
        difficulty: "hard",
        questions: [{ questionId: "y", questionText: "Q", answerText: "Short" }],
      }),
    ];

    for (const input of inputs) {
      const result = mockEvaluate(input);
      const json = JSON.stringify(result);
      expect(() => JSON.parse(json)).not.toThrow();
    }
  });

  it("readinessLevel values are exactly as specified", () => {
    const emptyInput = makeInput({
      questions: [{ questionId: "rl", questionText: "Q", answerText: "" }],
    });
    const result = mockEvaluate(emptyInput);
    expect(["needs_practice", "almost_ready", "ready"]).toContain(result.readinessLevel);
  });
});
