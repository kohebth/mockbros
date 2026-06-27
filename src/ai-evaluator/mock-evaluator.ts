import type {
  EvaluateInterviewInput,
  EvaluateInterviewOutput,
  DimensionScores,
  PerQuestionResult,
} from "./types";
import { DIMENSION_KEYS } from "./types";
import {
  calculateWeightedScore,
  getReadinessLevel,
  clampScore,
  averageDimensionScores,
} from "./rubric";

const STRONG_KEYWORDS = [
  "because",
  "tradeoff",
  "trade-off",
  "result",
  "impact",
  "metric",
  "percent",
  "%",
  "reduced",
  "increased",
  "improved",
  "measured",
  "roi",
  "revenue",
  "conversion",
];

const MEDIUM_KEYWORDS = [
  "team",
  "user",
  "customer",
  "decided",
  "approach",
  "challenge",
  "solution",
  "learned",
  "process",
  "strategy",
  "priority",
  "feedback",
];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function matchKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw)).length;
}

function classifyAnswer(
  answerText: string
): "empty" | "short" | "medium" | "strong" {
  const trimmed = answerText.trim();
  if (trimmed.length === 0) return "empty";

  const wordCount = countWords(trimmed);
  if (wordCount < 40) return "short";

  const strongHits = matchKeywords(trimmed, STRONG_KEYWORDS);
  const mediumHits = matchKeywords(trimmed, MEDIUM_KEYWORDS);

  if (strongHits >= 2 || (strongHits >= 1 && wordCount > 100)) return "strong";
  if (mediumHits >= 2 || wordCount > 60) return "medium";
  return "short";
}

const SCORE_RANGES: Record<
  "empty" | "short" | "medium" | "strong",
  [number, number]
> = {
  empty: [25, 35],
  short: [45, 60],
  medium: [65, 80],
  strong: [80, 90],
};

function randomInRange(min: number, max: number, seed: number): number {
  const hash = Math.abs(Math.sin(seed) * 10000);
  return Math.round(min + (hash % 1000) / 1000 * (max - min));
}

function generateDimensionScores(
  classification: "empty" | "short" | "medium" | "strong",
  seed: number
): DimensionScores {
  const [min, max] = SCORE_RANGES[classification];
  const scores = {} as DimensionScores;

  DIMENSION_KEYS.forEach((key, i) => {
    const offset = ((seed + i * 7) % 11) - 5;
    scores[key] = clampScore(randomInRange(min, max, seed + i) + offset);
  });

  return scores;
}

function generateFeedback(
  classification: "empty" | "short" | "medium" | "strong",
  questionText: string
): string {
  const feedbackMap = {
    empty:
      "Câu trả lời không có nội dung để đánh giá. Bạn cần chuẩn bị kỹ hơn cho câu hỏi này, nêu ít nhất một ví dụ cụ thể từ kinh nghiệm thực tế hoặc tình huống giả định có cấu trúc rõ ràng.",
    short:
      "Câu trả lời quá ngắn và thiếu chi tiết. Bạn nên phát triển thêm bằng cách nêu bối cảnh cụ thể, hành động bạn đã thực hiện và kết quả đạt được.",
    medium:
      "Câu trả lời có nội dung phù hợp nhưng có thể cải thiện bằng cách bổ sung số liệu cụ thể, trade-off trong quá trình ra quyết định và kết quả đo lường được.",
    strong:
      "Câu trả lời có cấu trúc tốt, nêu được ví dụ cụ thể và thể hiện tư duy rõ ràng. Để hoàn thiện hơn, hãy cân nhắc bổ sung thêm impact hoặc bài học rút ra.",
  };
  return feedbackMap[classification];
}

function generateImprovedAnswer(
  classification: "empty" | "short" | "medium" | "strong",
  questionText: string
): string {
  if (classification === "empty" || classification === "short") {
    return `Với câu hỏi "${questionText.substring(0, 50)}...", một câu trả lời tốt nên theo cấu trúc STAR: (1) Situation - mô tả bối cảnh cụ thể, (2) Task - nhiệm vụ bạn chịu trách nhiệm, (3) Action - các bước bạn đã thực hiện, (4) Result - kết quả đạt được với số liệu cụ thể nếu có.`;
  }
  if (classification === "medium") {
    return `Câu trả lời hiện tại đã có hướng đi đúng. Để nâng cấp, hãy bổ sung: (1) bối cảnh rõ ràng hơn về quy mô dự án hoặc team, (2) quy trình ra quyết định và trade-off bạn đã cân nhắc, (3) kết quả với số liệu cụ thể như "[nêu % cải thiện hoặc số liệu đo lường được]".`;
  }
  return `Câu trả lời đã rất tốt. Để đạt điểm cao nhất, hãy cân nhắc thêm: (1) so sánh giải pháp bạn chọn với các phương án thay thế, (2) rủi ro bạn đã lường trước và cách xử lý, (3) bài học rút ra có thể áp dụng cho các tình huống tương tự trong tương lai.`;
}

function generateStrengths(
  classifications: Array<"empty" | "short" | "medium" | "strong">
): string[] {
  const strengths: string[] = [];
  const hasStrong = classifications.includes("strong");
  const hasMedium = classifications.includes("medium");
  const nonEmpty = classifications.filter((c) => c !== "empty").length;

  if (hasStrong)
    strengths.push(
      "Một số câu trả lời thể hiện chiều sâu kinh nghiệm với ví dụ cụ thể và kết quả rõ ràng."
    );
  if (hasMedium)
    strengths.push(
      "Ứng viên nêu được các hướng tiếp cận phù hợp với vai trò được phỏng vấn."
    );
  if (nonEmpty > 0)
    strengths.push("Ứng viên đã trả lời và tham gia vào buổi phỏng vấn.");
  if (hasStrong || hasMedium)
    strengths.push("Cách diễn đạt tương đối rõ ràng và dễ theo dõi.");

  return strengths.length >= 2
    ? strengths.slice(0, 4)
    : [
        "Ứng viên đã tham gia buổi phỏng vấn.",
        "Có nỗ lực trả lời các câu hỏi được đặt ra.",
      ];
}

function generateWeaknesses(
  classifications: Array<"empty" | "short" | "medium" | "strong">
): string[] {
  const weaknesses: string[] = [];
  const hasEmpty = classifications.includes("empty");
  const hasShort = classifications.includes("short");
  const allBelowStrong = classifications.every((c) => c !== "strong");

  if (hasEmpty)
    weaknesses.push(
      "Một hoặc nhiều câu hỏi không được trả lời, thiếu nội dung để đánh giá."
    );
  if (hasShort)
    weaknesses.push(
      "Một số câu trả lời quá ngắn, thiếu chi tiết và bối cảnh cụ thể."
    );
  if (allBelowStrong)
    weaknesses.push(
      "Các câu trả lời chưa có số liệu hoặc kết quả đo lường được để tăng tính thuyết phục."
    );
  weaknesses.push(
    "Cần cải thiện cấu trúc câu trả lời, đặc biệt là theo mô hình STAR cho câu hỏi hành vi."
  );

  return weaknesses.slice(0, 4);
}

function generateRecommendations(): string[] {
  return [
    "Sử dụng cấu trúc STAR (Situation, Task, Action, Result) cho mọi câu hỏi hành vi.",
    "Bổ sung số liệu cụ thể vào câu trả lời, ví dụ: tỷ lệ cải thiện, số lượng người dùng, thời gian tiết kiệm.",
    "Luyện tập trả lời trong 2-3 phút mỗi câu để đảm bảo đủ chi tiết mà không lan man.",
    "Chuẩn bị 3-5 câu chuyện từ kinh nghiệm thực tế có thể tái sử dụng cho nhiều loại câu hỏi.",
  ];
}

function generateSummary(
  overallScore: number,
  readinessLevel: string
): string {
  if (overallScore < 60)
    return "Ứng viên cần luyện tập thêm. Các câu trả lời còn thiếu chi tiết và cấu trúc, cần bổ sung ví dụ cụ thể và kết quả đo lường được.";
  if (overallScore < 80)
    return "Ứng viên thể hiện kiến thức phù hợp nhưng cần cải thiện cấu trúc trả lời và bổ sung số liệu cụ thể để tăng tính thuyết phục.";
  return "Ứng viên trả lời tốt với ví dụ cụ thể và cấu trúc rõ ràng. Tiếp tục duy trì và bổ sung thêm chiều sâu phân tích.";
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function mockEvaluate(
  input: EvaluateInterviewInput
): EvaluateInterviewOutput {
  const perQuestionResults: PerQuestionResult[] = input.questions.map(
    (q, i) => {
      const classification = classifyAnswer(q.answerText);
      const seed = hashString(q.questionId + q.answerText + i);
      const dimensionScores = generateDimensionScores(classification, seed);
      const score = calculateWeightedScore(dimensionScores);

      return {
        questionId: q.questionId || `q${i + 1}`,
        question: q.questionText,
        score,
        dimensionScores,
        feedback: generateFeedback(classification, q.questionText),
        improvedAnswer: generateImprovedAnswer(classification, q.questionText),
      };
    }
  );

  const classifications = input.questions.map((q) =>
    classifyAnswer(q.answerText)
  );
  const allDimensionScores = perQuestionResults.map((r) => r.dimensionScores);
  const dimensionScores = averageDimensionScores(allDimensionScores);
  const overallScore = calculateWeightedScore(dimensionScores);
  const readinessLevel = getReadinessLevel(overallScore);

  return {
    overallScore,
    readinessLevel,
    summary: generateSummary(overallScore, readinessLevel),
    dimensionScores,
    strengths: generateStrengths(classifications),
    weaknesses: generateWeaknesses(classifications),
    recommendations: generateRecommendations(),
    perQuestion: perQuestionResults,
  };
}
