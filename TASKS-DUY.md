# Mockbros Hackathon Tasks - Duy

## Context

Mockbros is a mock interview product. The hackathon demo needs AI to turn interview answers into useful feedback.

Core demo flow:

1. Candidate chooses interview type.
2. Candidate answers 3 questions.
3. Backend sends questions and answers to AI evaluator.
4. AI returns structured feedback.
5. UI displays score, strengths, weaknesses, recommendations, and improved answers.

Deadline: **15:45 today**.

Your job is to make the AI/data part credible, stable, and easy for backend/UI to consume.

## Role

You have a data science background. Own:

- Interview question dataset.
- Evaluation rubric.
- Prompt design.
- Structured AI output.
- Mock evaluator fallback.
- Real LLM integration if time allows.

For hackathon reliability, always build a deterministic mock or sample-output fallback before real AI integration.

## Hard Scope

Must build:

- Small question dataset.
- Scoring rubric.
- AI prompt.
- JSON output schema.
- Mock evaluator.
- Optional real LLM evaluator.

Do not build today:

- Model training.
- Fine-tuning.
- Vector database.
- Speech-to-text.
- Sentiment analysis from video/audio.
- Complex psychometric scoring.

## Deliverable 1: Interview Question Dataset

Create a small but realistic dataset.

Required interview types:

1. Software Engineer
2. Product Manager
3. Sales
4. General Behavioral

Each type needs 3 questions.

Each question should include:

- `id`
- `interviewType`
- `targetRole`
- `difficulty`
- `questionText`
- `rubricHint`
- `strongAnswerSignals`
- `weakAnswerSignals`

Example:

```json
{
  "id": "se-001",
  "interviewType": "software_engineer",
  "targetRole": "Software Engineer",
  "difficulty": "junior",
  "questionText": "Tell me about a technical project you are proud of. What tradeoffs did you make?",
  "rubricHint": "Look for clear context, technical ownership, tradeoff reasoning, and measurable outcome.",
  "strongAnswerSignals": [
    "Explains project context clearly",
    "Names specific technical decisions",
    "Discusses tradeoffs",
    "Mentions outcome or impact"
  ],
  "weakAnswerSignals": [
    "Only describes technology names",
    "No explanation of personal contribution",
    "No tradeoff or result"
  ]
}
```

Acceptance:

- Dataset has at least 12 questions.
- Questions are realistic and easy to answer in a demo.
- Backend can seed or import the dataset.

## Deliverable 2: Evaluation Rubric

Define the scoring dimensions.

Use these dimensions:

- `clarity`
- `relevance`
- `structure`
- `confidence`
- `technicalCorrectness`
- `communication`
- `authenticity`

Score each dimension from `0` to `100`.

Define readiness levels:

- `needs_practice`: overall score below 60.
- `almost_ready`: overall score from 60 to 79.
- `ready`: overall score 80 and above.

Overall score formula:

```text
overallScore = weighted average of all dimension scores
```

Recommended weights:

- clarity: 15%
- relevance: 20%
- structure: 15%
- confidence: 10%
- technicalCorrectness: 20%
- communication: 10%
- authenticity: 10%

For non-technical interviews, `technicalCorrectness` means role correctness.

Acceptance:

- Rubric is documented.
- Backend/UI can explain score simply.
- Rubric does not pretend to be scientifically validated.

## Deliverable 3: AI Output JSON Schema

Define the exact output shape expected by backend.

Required schema:

```json
{
  "overallScore": 74,
  "readinessLevel": "almost_ready",
  "summary": "The candidate gives relevant examples but should add clearer impact metrics and more structured answers.",
  "dimensionScores": {
    "clarity": 78,
    "relevance": 82,
    "structure": 68,
    "confidence": 72,
    "technicalCorrectness": 76,
    "communication": 75,
    "authenticity": 80
  },
  "strengths": [
    "You gave a relevant example from past experience.",
    "You explained your actions clearly."
  ],
  "weaknesses": [
    "The answer needs a stronger measurable result.",
    "The structure could be easier to follow."
  ],
  "recommendations": [
    "Use the STAR structure: Situation, Task, Action, Result.",
    "Add one metric or concrete outcome to each answer."
  ],
  "perQuestion": [
    {
      "questionId": "se-001",
      "score": 76,
      "feedback": "Your answer is relevant, but the impact is not specific enough.",
      "improvedAnswer": "A stronger answer would briefly describe the project, your decision, the tradeoff, and the measurable result."
    }
  ]
}
```

Rules:

- Output must be valid JSON.
- No markdown in JSON values.
- Scores must be integers from 0 to 100.
- `readinessLevel` must be one of:
  - `needs_practice`
  - `almost_ready`
  - `ready`

Acceptance:

- Backend can parse output without cleanup.
- UI can render output directly.

## Deliverable 4: Prompt Design

Write a prompt for the evaluator.

Prompt requirements:

- Ask for strict JSON only.
- Include interview role and difficulty.
- Include all questions and answers.
- Include rubric dimensions.
- Ask for actionable feedback.
- Ask for improved answer examples.
- Avoid harsh or insulting language.
- Avoid making hiring guarantees.

Prompt template:

```text
You are an interview coach for Mockbros.

Evaluate the candidate's mock interview answers.

Interview:
- Role: {{targetRole}}
- Difficulty: {{difficulty}}
- Template: {{templateTitle}}

Scoring dimensions:
- clarity
- relevance
- structure
- confidence
- technicalCorrectness
- communication
- authenticity

Return strict JSON only using this shape:
{{jsonSchema}}

Questions and answers:
{{questionsAndAnswers}}

Evaluation rules:
- Scores must be integers from 0 to 100.
- Feedback must be specific and actionable.
- Do not include markdown.
- Do not claim the candidate will pass or fail a real interview.
- If an answer is empty or too short, score it low and explain what is missing.
```

Acceptance:

- Prompt returns parseable JSON in test runs.
- Prompt works with at least one real LLM if credentials are available.
- Prompt has fallback sample output if LLM fails.

## Deliverable 5: Mock AI Evaluator

Build a deterministic evaluator for demo fallback.

Input:

```json
{
  "templateTitle": "Software Engineer Interview",
  "targetRole": "Software Engineer",
  "difficulty": "junior",
  "questions": [
    {
      "questionId": "se-001",
      "questionText": "Tell me about a technical project...",
      "rubricHint": "Look for clear context...",
      "answerText": "I built..."
    }
  ]
}
```

Output:

- Must match the AI output JSON schema.

Simple scoring logic:

- Empty answer: 25-35.
- Very short answer under 40 words: 45-60.
- Medium answer with concrete words like "because", "tradeoff", "result", "team", "user", "impact": 65-80.
- Strong answer with metrics or clear structure: 80-90.

Implementation options:

- TypeScript function used directly by backend.
- Small HTTP service.
- JSON sample fixture if time is very short.

Recommended: TypeScript function or plain JSON fixture because it is easiest for backend integration.

Acceptance:

- Mock evaluator always returns valid JSON.
- Same input returns same output.
- Backend demo works even without real LLM.

## Deliverable 6: Real LLM Evaluator, If Time Allows

Only start this after mock evaluator works.

Options:

- OpenAI-compatible API.
- Gemini.
- Any available LLM API.

Requirements:

- Use the prompt template.
- Validate parsed JSON.
- Clamp scores to 0-100.
- If parsing fails, return mock evaluator output.
- If API fails, return mock evaluator output.

Acceptance:

- Real AI improves quality when available.
- Real AI failure does not break the demo.
- No API keys are committed.

## Deliverable 7: Sample Demo Feedback

Prepare one polished example for Software Engineer.

Include:

- 3 sample user answers.
- 1 full feedback JSON.
- 1 short explanation of how scoring works.

The sample should be useful for:

- Backend fallback.
- UI fallback.
- Pitch demo if API breaks.

Acceptance:

- Huy can use it in UI.
- Backend can store it as fixture.
- You can explain the scoring in 30 seconds.

## Deliverable 8: Backend Integration Contract

Give backend owner this exact interface.

```ts
export type EvaluateInterviewInput = {
  templateTitle: string;
  targetRole: string;
  difficulty: string;
  questions: Array<{
    questionId: string;
    questionText: string;
    rubricHint?: string;
    answerText: string;
  }>;
};

export type EvaluateInterviewOutput = {
  overallScore: number;
  readinessLevel: "needs_practice" | "almost_ready" | "ready";
  summary: string;
  dimensionScores: {
    clarity: number;
    relevance: number;
    structure: number;
    confidence: number;
    technicalCorrectness: number;
    communication: number;
    authenticity: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  perQuestion: Array<{
    questionId: string;
    score: number;
    feedback: string;
    improvedAnswer: string;
  }>;
};
```

Acceptance:

- Backend receives either a TypeScript function, HTTP endpoint, or JSON fixture using this shape.
- No extra transformation is required by backend beyond validation.

## Coordination With Backend

Tell backend owner:

- Whether you are providing a TypeScript module, HTTP service, or JSON fixture.
- Exact file path or endpoint.
- Required env vars if using real LLM.
- Expected latency.
- Fallback behavior.

Recommended decision:

```text
Use mock evaluator as default. Real LLM is optional and only enabled by env var.
```

## Coordination With Huy

Give Huy:

- Score labels.
- Explanation of readiness levels.
- Example feedback report.
- Explanation of recommendations.

Suggested readiness labels:

- `needs_practice`: "Needs Practice"
- `almost_ready`: "Almost Ready"
- `ready`: "Ready"

## Final Duy Checklist

- [ ] 12-question dataset is ready.
- [ ] Rubric is documented.
- [ ] JSON output schema is final.
- [ ] Prompt template is ready.
- [ ] Mock evaluator is ready.
- [ ] Real LLM evaluator is optional and guarded by fallback.
- [ ] Sample feedback JSON is ready.
- [ ] Backend integration contract is shared.
- [ ] Huy has scoring explanation for UI and pitch.
