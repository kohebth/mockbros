import { describe, it, expect } from "vitest";
import { interviewQuestions } from "../data/questions";

const VALID_INTERVIEW_TYPES = [
  "software_engineer",
  "product_manager",
  "sales",
  "general_behavioral",
];

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

describe("interviewQuestions dataset", () => {
  it("has at least 12 questions", () => {
    expect(interviewQuestions.length).toBeGreaterThanOrEqual(12);
  });

  it("covers all 4 interview types", () => {
    const types = new Set(interviewQuestions.map((q) => q.interviewType));
    for (const t of VALID_INTERVIEW_TYPES) {
      expect(types.has(t)).toBe(true);
    }
  });

  it("has at least 3 questions per interview type", () => {
    for (const type of VALID_INTERVIEW_TYPES) {
      const count = interviewQuestions.filter(
        (q) => q.interviewType === type
      ).length;
      expect(count).toBeGreaterThanOrEqual(3);
    }
  });

  it("all questions have valid required fields", () => {
    for (const q of interviewQuestions) {
      expect(q.id).toBeTruthy();
      expect(q.interviewType).toBeTruthy();
      expect(q.targetRole).toBeTruthy();
      expect(q.questionText).toBeTruthy();
      expect(q.rubricHint).toBeTruthy();
      expect(q.strongAnswerSignals.length).toBeGreaterThan(0);
      expect(q.weakAnswerSignals.length).toBeGreaterThan(0);
    }
  });

  it("all questions have valid difficulty", () => {
    for (const q of interviewQuestions) {
      expect(VALID_DIFFICULTIES).toContain(q.difficulty);
    }
  });

  it("all question IDs are unique", () => {
    const ids = interviewQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
