#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${API_URL:-http://localhost:3000}"
echo "=== Mockbros Smoke Test ==="
echo "API: $BASE_URL"
echo ""

echo "1. Health check..."
curl -sf "$BASE_URL/health" | python3 -m json.tool
echo ""

echo "2. List interview templates..."
TEMPLATES=$(curl -sf "$BASE_URL/interview-templates")
echo "$TEMPLATES" | python3 -m json.tool
TEMPLATE_ID=$(echo "$TEMPLATES" | python3 -c "import sys,json; print(json.load(sys.stdin)['templates'][0]['id'])")
echo "   Using template: $TEMPLATE_ID"
echo ""

echo "3. Get template detail..."
curl -sf "$BASE_URL/interview-templates/$TEMPLATE_ID" | python3 -m json.tool
echo ""

echo "4. Create interview session..."
SESSION=$(curl -sf -X POST "$BASE_URL/interviews" \
  -H "Content-Type: application/json" \
  -d "{\"templateId\":\"$TEMPLATE_ID\",\"userName\":\"Demo Candidate\",\"userEmail\":\"demo@mockbros.test\"}")
echo "$SESSION" | python3 -m json.tool
SESSION_ID=$(echo "$SESSION" | python3 -c "import sys,json; print(json.load(sys.stdin)['sessionId'])")
echo "   Session ID: $SESSION_ID"
echo ""

echo "5. Start interview..."
START_RESP=$(curl -sf -X POST "$BASE_URL/interviews/$SESSION_ID/start")
echo "$START_RESP" | python3 -m json.tool
QUESTIONS=$(echo "$START_RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for q in data['questions']:
    print(q['id'])
")
echo ""

echo "6. Submit answers..."
ANSWERS_JSON="["
FIRST=true
for QID in $QUESTIONS; do
  if [ "$FIRST" = true ]; then
    FIRST=false
  else
    ANSWERS_JSON="$ANSWERS_JSON,"
  fi
  ANSWERS_JSON="$ANSWERS_JSON{\"questionId\":\"$QID\",\"answerText\":\"In my previous role, I led a team of 5 engineers to build a microservices platform. We faced tradeoffs between consistency and availability, and chose eventual consistency with compensating transactions. The project reduced deployment time by 60% and improved system reliability from 99.5% to 99.9%.\"}"
done
ANSWERS_JSON="$ANSWERS_JSON]"

curl -sf -X POST "$BASE_URL/interviews/$SESSION_ID/answers" \
  -H "Content-Type: application/json" \
  -d "{\"answers\":$ANSWERS_JSON}" | python3 -m json.tool
echo ""

echo "7. Submit interview for evaluation..."
SUBMIT_RESP=$(curl -sf -X POST "$BASE_URL/interviews/$SESSION_ID/submit")
echo "$SUBMIT_RESP" | python3 -m json.tool
echo ""

echo "8. Get feedback report..."
curl -sf "$BASE_URL/interviews/$SESSION_ID/feedback" | python3 -m json.tool
echo ""

echo "=== Smoke Test PASSED ==="
