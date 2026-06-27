import { z } from "zod";

export const CreateInterviewSchema = z.object({
  templateId: z.string().uuid(),
  userName: z.string().trim().min(1).max(120).default("Demo Candidate"),
  userEmail: z.string().trim().email().default("demo@mockbros.test")
});

export const SubmitAnswersSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        answerText: z.string().trim().min(1).max(5000)
      })
    )
    .min(1)
});
