import type { EvaluateInterviewOutput } from "./types";
import { DIMENSION_KEYS } from "./types";
import { getReadinessLevel } from "./rubric";

export type ValidationError = {
  field: string;
  message: string;
};

export function validateEvaluationOutput(
  data: unknown,
  questionCount: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    errors.push({ field: "root", message: "Output must be an object" });
    return errors;
  }

  const output = data as Record<string, unknown>;

  const requiredTopKeys = [
    "overallScore",
    "readinessLevel",
    "summary",
    "dimensionScores",
    "strengths",
    "weaknesses",
    "recommendations",
    "perQuestion",
  ];

  for (const key of requiredTopKeys) {
    if (!(key in output)) {
      errors.push({ field: key, message: `Missing required key: ${key}` });
    }
  }

  if (errors.length > 0) return errors;

  if (
    typeof output.overallScore !== "number" ||
    output.overallScore < 0 ||
    output.overallScore > 100
  ) {
    errors.push({
      field: "overallScore",
      message: "overallScore must be a number between 0 and 100",
    });
  }

  if (typeof output.summary !== "string" || output.summary.length === 0) {
    errors.push({
      field: "summary",
      message: "summary must be a non-empty string",
    });
  }

  const validLevels = ["needs_practice", "almost_ready", "ready"];
  if (!validLevels.includes(output.readinessLevel as string)) {
    errors.push({
      field: "readinessLevel",
      message: `readinessLevel must be one of: ${validLevels.join(", ")}`,
    });
  }

  if (typeof output.overallScore === "number") {
    const expectedLevel = getReadinessLevel(output.overallScore as number);
    if (output.readinessLevel !== expectedLevel) {
      errors.push({
        field: "readinessLevel",
        message: `readinessLevel "${output.readinessLevel}" does not match overallScore ${output.overallScore} (expected "${expectedLevel}")`,
      });
    }
  }

  if (output.dimensionScores && typeof output.dimensionScores === "object") {
    const ds = output.dimensionScores as Record<string, unknown>;
    for (const key of DIMENSION_KEYS) {
      if (!(key in ds)) {
        errors.push({
          field: `dimensionScores.${key}`,
          message: `Missing dimension: ${key}`,
        });
      } else if (
        typeof ds[key] !== "number" ||
        (ds[key] as number) < 0 ||
        (ds[key] as number) > 100
      ) {
        errors.push({
          field: `dimensionScores.${key}`,
          message: `${key} must be a number between 0 and 100`,
        });
      }
    }
  }

  for (const arrayKey of ["strengths", "weaknesses", "recommendations"]) {
    if (!Array.isArray(output[arrayKey])) {
      errors.push({
        field: arrayKey,
        message: `${arrayKey} must be an array`,
      });
    }
  }

  if (Array.isArray(output.perQuestion)) {
    const pq = output.perQuestion as Array<Record<string, unknown>>;
    if (pq.length !== questionCount) {
      errors.push({
        field: "perQuestion",
        message: `perQuestion length (${pq.length}) does not match question count (${questionCount})`,
      });
    }

    for (let i = 0; i < pq.length; i++) {
      const item = pq[i];
      const perQuestionRequired = [
        "questionId",
        "question",
        "score",
        "dimensionScores",
        "feedback",
        "improvedAnswer",
      ];
      for (const key of perQuestionRequired) {
        if (!(key in item)) {
          errors.push({
            field: `perQuestion[${i}].${key}`,
            message: `Missing required key in perQuestion[${i}]: ${key}`,
          });
        }
      }

      if (
        typeof item.score === "number" &&
        (item.score < 0 || item.score > 100)
      ) {
        errors.push({
          field: `perQuestion[${i}].score`,
          message: `score must be between 0 and 100`,
        });
      }

      if (item.dimensionScores && typeof item.dimensionScores === "object") {
        const qds = item.dimensionScores as Record<string, unknown>;
        for (const key of DIMENSION_KEYS) {
          if (!(key in qds)) {
            errors.push({
              field: `perQuestion[${i}].dimensionScores.${key}`,
              message: `Missing dimension in perQuestion[${i}]: ${key}`,
            });
          }
        }
      }
    }
  }

  return errors;
}

export function isValidOutput(
  data: unknown,
  questionCount: number
): data is EvaluateInterviewOutput {
  return validateEvaluationOutput(data, questionCount).length === 0;
}
