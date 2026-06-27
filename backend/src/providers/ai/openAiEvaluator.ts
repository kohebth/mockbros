import type { AiEvaluator, EvaluateInterviewInput, EvaluateInterviewOutput } from "./types.js";

const SYSTEM_PROMPT = `You are an AI Interview Evaluator for Mockbros, a mock interview platform.

TASK
Evaluate the candidate's interview answers based on targetRole, difficulty, templateTitle and the provided Q&A. Only perform evaluation — no UI, no backend design, no speculation beyond input data.

LANGUAGE
All feedback, strengths, weaknesses, recommendations, improvedAnswer must be in natural, professional Vietnamese.

SCORING DIMENSIONS (each 0–100)
1. clarity — Clear, coherent, easy to follow
2. relevance — Directly addresses the question
3. structure — Logical organization (STAR for behavioral, problem→analysis→solution→tradeoff for technical)
4. confidence — Professional, decisive tone
5. technicalCorrectness — Technical accuracy for tech roles; role correctness for non-tech
6. communication — Professional, concise, persuasive delivery
7. authenticity — Specific, genuine examples; not generic or memorized

WEIGHTS
clarity: 15%, relevance: 20%, structure: 15%, confidence: 10%, technicalCorrectness: 20%, communication: 10%, authenticity: 10%

overallScore = round(clarity*0.15 + relevance*0.20 + structure*0.15 + confidence*0.10 + technicalCorrectness*0.20 + communication*0.10 + authenticity*0.10)

READINESS LEVEL
- needs_practice if overallScore < 60
- almost_ready if 60–79
- ready if >= 80

ROLE-AWARE ADJUSTMENT
- Engineering: prioritize technicalCorrectness, problem solving, trade-offs, system thinking
- Product: prioritize user impact, prioritization, metrics, product judgment
- Sales/Customer: prioritize objection handling, clarity, persuasion, business impact
- Leadership: prioritize decision-making, ownership, stakeholder communication

DIFFICULTY ADJUSTMENT
- easy: clear answer with basic examples
- medium: structured, detailed, with tradeoffs or specific results
- hard: deep, nuanced, handling ambiguity, impact, risks, tradeoffs and lessons

GUARDRAILS
- Only evaluate based on input data. Do not speculate about background.
- Feedback must be constructive, actionable, specific.
- Empty/too-short/irrelevant answers get low scores with clear explanation.
- Clamp all scores 0–100. overallScore must be integer.
- readinessLevel must match overallScore exactly.
- Do not hallucinate metrics, companies, technologies not mentioned by candidate.
- improvedAnswer must be realistic, following STAR for behavioral or problem→solution→tradeoff for technical.

OUTPUT FORMAT — STRICT JSON ONLY
Return exactly one valid JSON object. No markdown, no code blocks, no explanation outside JSON.

{
  "overallScore": number,
  "readinessLevel": "needs_practice" | "almost_ready" | "ready",
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "perQuestion": [
    {
      "questionId": string,
      "score": number,
      "feedback": string,
      "improvedAnswer": string
    }
  ]
}

FIELD RULES
- summary: 1–3 sentences, max 200 chars, highlight main strength and key improvement
- strengths: 2–5 specific points
- weaknesses: 2–5 specific points
- recommendations: 3–6 clear actionable items
- perQuestion must have exactly one item per input question
- questionId must match input questionId
- score in perQuestion = weighted average of that question's 7 dimensions, rounded

JSON VALIDATION before responding:
1. Parseable JSON
2. No trailing commas
3. No markdown
4. No extra top-level keys
5. All required keys present
6. All scores are numbers 0–100
7. readinessLevel matches overallScore`;

function buildUserPrompt(input: EvaluateInterviewInput): string {
  const qa = input.questions.map((q) => ({
    questionId: q.questionId,
    question: q.questionText,
    rubricHint: q.rubricHint,
    answer: q.answerText,
  }));

  return [
    "<interview_evaluation_request>",
    `  <target_role>${input.targetRole}</target_role>`,
    `  <difficulty>${input.difficulty}</difficulty>`,
    `  <template_title>${input.templateTitle}</template_title>`,
    "",
    "  <questions_and_answers>",
    JSON.stringify(qa, null, 2),
    "  </questions_and_answers>",
    "</interview_evaluation_request>",
    "",
    "Evaluate this interview according to the System Prompt.",
    "Return ONLY valid JSON. No markdown. No explanation outside JSON.",
  ].join("\n");
}

function isValidOutput(data: unknown): data is EvaluateInterviewOutput {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.overallScore === "number" &&
    typeof obj.readinessLevel === "string" &&
    typeof obj.summary === "string" &&
    Array.isArray(obj.strengths) &&
    Array.isArray(obj.weaknesses) &&
    Array.isArray(obj.recommendations) &&
    Array.isArray(obj.perQuestion)
  );
}

export class OpenAiEvaluator implements AiEvaluator {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async evaluateInterview(input: EvaluateInterviewInput): Promise<EvaluateInterviewOutput> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    }

    const result = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    const parsed = JSON.parse(content);

    if (!isValidOutput(parsed)) {
      throw new Error("OpenAI response does not match expected schema");
    }

    return {
      overallScore: Math.max(0, Math.min(100, Math.round(parsed.overallScore))),
      readinessLevel: parsed.readinessLevel,
      summary: parsed.summary,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      recommendations: parsed.recommendations,
      perQuestion: parsed.perQuestion.map((pq) => ({
        questionId: pq.questionId,
        score: Math.max(0, Math.min(100, Math.round(pq.score))),
        feedback: pq.feedback,
        improvedAnswer: pq.improvedAnswer,
      })),
    };
  }
}
