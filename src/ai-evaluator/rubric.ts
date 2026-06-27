import type { DimensionScores, ReadinessLevel, DimensionKey } from "./types";
import { DIMENSION_WEIGHTS, DIMENSION_KEYS } from "./types";

export function calculateWeightedScore(scores: DimensionScores): number {
  let total = 0;
  for (const key of DIMENSION_KEYS) {
    total += scores[key] * DIMENSION_WEIGHTS[key];
  }
  return Math.round(total);
}

export function getReadinessLevel(overallScore: number): ReadinessLevel {
  if (overallScore >= 80) return "ready";
  if (overallScore >= 60) return "almost_ready";
  return "needs_practice";
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function averageDimensionScores(
  allScores: DimensionScores[]
): DimensionScores {
  if (allScores.length === 0) {
    return Object.fromEntries(
      DIMENSION_KEYS.map((k) => [k, 0])
    ) as DimensionScores;
  }

  const result = {} as DimensionScores;
  for (const key of DIMENSION_KEYS) {
    const sum = allScores.reduce((acc, s) => acc + s[key], 0);
    result[key] = Math.round(sum / allScores.length);
  }
  return result;
}

export { DIMENSION_WEIGHTS, DIMENSION_KEYS };
export type { DimensionKey };
