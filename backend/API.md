# Mockbros Backend API

Base URL for local development:

```text
http://localhost:3000
```

## Health

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "mockbros-api"
}
```

## List Interview Templates

```http
GET /interview-templates
```

Returns available interview templates.

## Get Interview Template Detail

```http
GET /interview-templates/:id
```

Returns the selected template and its questions.

## Create Interview

```http
POST /interviews
content-type: application/json
```

```json
{
  "templateId": "uuid",
  "userName": "Demo Candidate",
  "userEmail": "demo@mockbros.test"
}
```

## Start Interview

```http
POST /interviews/:id/start
```

Moves the session to `in_progress` and returns the questions.

## Save Answers

```http
POST /interviews/:id/answers
content-type: application/json
```

```json
{
  "answers": [
    {
      "questionId": "uuid",
      "answerText": "My answer..."
    }
  ]
}
```

## Submit Interview

```http
POST /interviews/:id/submit
```

Calls the AI evaluator, stores feedback, and marks the session `completed`.

## Get Feedback

```http
GET /interviews/:id/feedback
```

Returns overall score, readiness level, summary, strengths, weaknesses, recommendations, and per-question feedback.
