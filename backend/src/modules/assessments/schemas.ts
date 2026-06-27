import { z } from "zod";

export const AssessmentQuerySchema = z.object({
  kind: z.enum(["entry", "profession"]).optional(),
  industryId: z.string().uuid().optional(),
  professionId: z.string().uuid().optional()
});

export const SubmitAssessmentSchema = z.object({
  userName: z.string().trim().min(1).max(120).optional(),
  userEmail: z.string().trim().email().max(255).optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        selectedOptionKey: z.enum(["A", "B", "C", "D"])
      })
    )
    .min(1)
});

export type SubmitAssessmentInput = z.infer<typeof SubmitAssessmentSchema>;
