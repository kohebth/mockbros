#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "Checking health"
curl -fsS "$BASE_URL/health"
echo

echo "Listing templates"
templates_json="$(curl -fsS "$BASE_URL/interview-templates")"
echo "$templates_json"
template_id="$(node -e "const data = JSON.parse(process.argv[1]); console.log(data.templates[0].id)" "$templates_json")"

echo "Creating interview"
session_json="$(curl -fsS -X POST "$BASE_URL/interviews" \
  -H 'content-type: application/json' \
  -d "{\"templateId\":\"$template_id\",\"userName\":\"Demo Candidate\",\"userEmail\":\"demo@mockbros.test\"}")"
echo "$session_json"
session_id="$(node -e "const data = JSON.parse(process.argv[1]); console.log(data.sessionId)" "$session_json")"

echo "Starting interview"
start_json="$(curl -fsS -X POST "$BASE_URL/interviews/$session_id/start")"
echo "$start_json"

answers_payload="$(node -e '
const data = JSON.parse(process.argv[1]);
const answers = data.questions.map((question) => ({
  questionId: question.id,
  answerText: `For this question, I would explain the situation, my personal action, the tradeoff I made because of time and user impact, and the result the team achieved.`
}));
console.log(JSON.stringify({ answers }));
' "$start_json")"

echo "Saving answers"
curl -fsS -X POST "$BASE_URL/interviews/$session_id/answers" \
  -H 'content-type: application/json' \
  -d "$answers_payload"
echo

echo "Submitting interview"
curl -fsS -X POST "$BASE_URL/interviews/$session_id/submit"
echo

echo "Fetching feedback"
curl -fsS "$BASE_URL/interviews/$session_id/feedback"
echo
