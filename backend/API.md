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


## Live Interactive Interview WebSocket

Connect to:

```text
ws://localhost:3000/interviews/:id/live
```

The session must already exist. On connect, the backend starts the interview if needed and sends `session_state` followed by the current `question`.

### Server Events

- `session_state`: current session, question count, answered count, and questions.
- `question`: current question to answer.
- `transcript_partial`: echo of a partial transcript sent by the client.
- `transcribing`: backend is sending final audio to STT.
- `transcript_final`: STT produced a final transcript from audio.
- `answer_saved`: answer transcript was persisted.
- `evaluating`: all questions are answered and feedback generation started.
- `completed`: feedback report is ready.
- `error`: request or processing error.

### Client Events

Send JSON messages.

Partial transcript, useful when the frontend uses browser Web Speech API:

```json
{
  "type": "answer_partial",
  "questionId": "uuid",
  "text": "partial transcript"
}
```

Final transcript:

```json
{
  "type": "answer_final",
  "questionId": "uuid",
  "text": "final answer transcript"
}
```

Final audio for backend STT:

```json
{
  "type": "audio_final",
  "questionId": "uuid",
  "audioBase64": "base64 encoded audio blob",
  "mimeType": "audio/webm"
}
```

The default `STT_PROVIDER=mock` returns a deterministic mock transcript. Set `STT_PROVIDER=http` and `STT_SERVICE_URL=http://localhost:4100` to call an external service at `POST /transcribe`.
