import { describe, it, expect } from "vitest";
import {
  calculateWeightedScore,
  getReadinessLevel,
  clampScore,
  averageDimensionScores,
} from "../rubric";
import type { DimensionScores } from "../types";

describe("calculateWeightedScore", () => {
  it("calculates correct weighted average", () => {
    const scores: DimensionScores = {
      clarity: 80,
      relevance: 80,
      structure: 80,
      confidence: 80,
      technicalCorrectness: 80,
      communication: 80,
      authenticity: 80,
    };
    expect(calculateWeightedScore(scores)).toBe(80);
  });

  it("applies different weights correctly", () => {
    const scores: DimensionScores = {
      clarity: 100,
      relevance: 100,
      structure: 100,
      confidence: 100,
      technicalCorrectness: 0,
      communication: 100,
      authenticity: 100,
    };
    expect(calculateWeightedScore(scores)).toBe(80);
  });

  it("returns 0 for all zeros", () => {
    const scores: DimensionScores = {
      clarity: 0, relevance: 0, structure: 0, confidence: 0,
      technicalCorrectness: 0, communication: 0, authenticity: 0,
    };
    expect(calculateWeightedScore(scores)).toBe(0);
  });

  it("returns 100 for all 100s", () => {
    const scores: DimensionScores = {
      clarity: 100, relevance: 100, structure: 100, confidence: 100,
      technicalCorrectness: 100, communication: 100, authenticity: 100,
    };
    expect(calculateWeightedScore(scores)).toBe(100);
  });
});

describe("getReadinessLevel", () => {
  it("returns needs_practice for score < 60", () => {
    expect(getReadinessLevel(0)).toBe("needs_practice");
    expect(getReadinessLevel(59)).toBe("needs_practice");
  });

  it("returns almost_ready for score 60-79", () => {
    expect(getReadinessLevel(60)).toBe("almost_ready");
    expect(getReadinessLevel(79)).toBe("almost_ready");
  });

  it("returns ready for score >= 80", () => {
    expect(getReadinessLevel(80)).toBe("ready");
    expect(getReadinessLevel(100)).toBe("ready");
  });
});

describe("clampScore", () => {
  it("clamps negative to 0", () => {
    expect(clampScore(-10)).toBe(0);
  });

  it("clamps above 100 to 100", () => {
    expect(clampScore(150)).toBe(100);
  });

  it("rounds to integer", () => {
    expect(clampScore(75.7)).toBe(76);
  });

  it("passes through valid scores", () => {
    expect(clampScore(50)).toBe(50);
  });
});

describe("averageDimensionScores", () => {
  it("returns zeros for empty array", () => {
    const result = averageDimensionScores([]);
    expect(result.clarity).toBe(0);
    expect(result.relevance).toBe(0);
  });

  it("averages multiple score sets", () => {
    const s1: DimensionScores = {
      clarity: 80, relevance: 60, structure: 70, confidence: 50,
      technicalCorrectness: 90, communication: 70, authenticity: 60,
    };
    const s2: DimensionScores = {
      clarity: 60, relevance: 80, structure: 70, confidence: 70,
      technicalCorrectness: 70, communication: 50, authenticity: 80,
    };
    const result = averageDimensionScores([s1, s2]);
    expect(result.clarity).toBe(70);
    expect(result.relevance).toBe(70);
  });
});
