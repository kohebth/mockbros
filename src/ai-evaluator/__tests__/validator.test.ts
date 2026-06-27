import { describe, it, expect } from "vitest";
import { validateEvaluationOutput, isValidOutput } from "../validator";
import { sampleFeedback } from "../data/sample-feedback";

describe("validateEvaluationOutput", () => {
  it("passes for valid sample feedback", () => {
    const errors = validateEvaluationOutput(sampleFeedback, 3);
    expect(errors).toHaveLength(0);
  });

  it("passes isValidOutput for valid data", () => {
    expect(isValidOutput(sampleFeedback, 3)).toBe(true);
  });

  it("fails for null input", () => {
    const errors = validateEvaluationOutput(null, 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe("root");
  });

  it("fails for missing required keys", () => {
    const errors = validateEvaluationOutput({ overallScore: 50 }, 1);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("fails for overallScore out of range", () => {
    const data = {
      ...sampleFeedback,
      overallScore: 150,
    };
    const errors = validateEvaluationOutput(data, 3);
    expect(errors.some((e) => e.field === "overallScore")).toBe(true);
  });

  it("fails for readinessLevel mismatch", () => {
    const data = {
      ...sampleFeedback,
      overallScore: 50,
      readinessLevel: "ready",
    };
    const errors = validateEvaluationOutput(data, 3);
    expect(errors.some((e) => e.field === "readinessLevel")).toBe(true);
  });

  it("fails for wrong perQuestion length", () => {
    const errors = validateEvaluationOutput(sampleFeedback, 5);
    expect(errors.some((e) => e.field === "perQuestion")).toBe(true);
  });

  it("fails for missing dimension in dimensionScores", () => {
    const data = {
      ...sampleFeedback,
      dimensionScores: {
        clarity: 80,
        relevance: 80,
      },
    };
    const errors = validateEvaluationOutput(data, 3);
    expect(errors.some((e) => e.field.startsWith("dimensionScores."))).toBe(true);
  });

  it("fails for empty summary", () => {
    const data = { ...sampleFeedback, summary: "" };
    const errors = validateEvaluationOutput(data, 3);
    expect(errors.some((e) => e.field === "summary")).toBe(true);
  });
});
