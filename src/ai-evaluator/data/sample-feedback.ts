import type { EvaluateInterviewOutput } from "../types";

export const sampleAnswers = [
  {
    questionId: "se-001",
    questionText: "Tell me about a technical project you are proud of. What tradeoffs did you make?",
    answerText: "I built a dashboard for my team using React and Node.js. We needed real-time data updates, so I chose WebSocket over polling because it reduced latency by 70%. The tradeoff was increased server complexity, but we managed it with a message queue. The dashboard helped the team reduce response time to incidents from 30 minutes to under 5 minutes.",
  },
  {
    questionId: "se-002",
    questionText: "Describe a time you had to debug a difficult production issue. What was your approach?",
    answerText: "We had a memory leak in production that caused our Node.js service to crash every 6 hours. I started by analyzing heap snapshots and found that event listeners were not being cleaned up in a specific module. I traced the root cause to a subscription that was created on every request but never unsubscribed. After fixing it, memory usage dropped by 40% and the crashes stopped completely. I also added monitoring alerts to catch similar issues early.",
  },
  {
    questionId: "se-003",
    questionText: "How would you design a system that needs to handle 10x traffic growth? Walk me through your thought process.",
    answerText: "I would start by profiling the current system to find bottlenecks. Usually the database is the first constraint, so I would add read replicas and caching with Redis for hot data. For the API layer, I would use horizontal scaling behind a load balancer. If we have CPU-intensive tasks, I would move them to a queue with workers. I would also set up auto-scaling rules based on CPU and request latency metrics. The tradeoff is increased infrastructure cost and operational complexity, so I would roll out changes gradually and measure impact at each stage.",
  },
];

export const sampleFeedback: EvaluateInterviewOutput = {
  overallScore: 82,
  readinessLevel: "ready",
  summary: "Ứng viên trả lời chất lượng cao với ví dụ cụ thể, số liệu rõ ràng và tư duy có cấu trúc. Cần bổ sung thêm trade-off analysis ở câu hỏi thiết kế hệ thống.",
  dimensionScores: {
    clarity: 85,
    relevance: 88,
    structure: 80,
    confidence: 82,
    technicalCorrectness: 84,
    communication: 80,
    authenticity: 78,
  },
  strengths: [
    "Câu trả lời có số liệu cụ thể (giảm 70% latency, giảm 40% memory usage, từ 30 phút xuống 5 phút).",
    "Thể hiện tư duy có hệ thống: profiling trước, tìm root cause, đo lường sau fix.",
    "Nêu rõ trade-off trong các quyết định kỹ thuật.",
    "Ví dụ thực tế phản ánh kinh nghiệm làm việc thực sự.",
  ],
  weaknesses: [
    "Câu hỏi thiết kế hệ thống còn liệt kê giải pháp chung, chưa đi sâu vào kiến trúc cụ thể.",
    "Chưa đề cập đến database sharding, CDN hoặc edge caching cho traffic 10x.",
    "Thiếu đề cập đến testing strategy khi scale (load testing, chaos engineering).",
  ],
  recommendations: [
    "Với câu hỏi system design, hãy bắt đầu bằng ước tính traffic/throughput cụ thể trước khi đề xuất giải pháp.",
    "Bổ sung kinh nghiệm với caching strategies cụ thể (cache invalidation, TTL, cache-aside pattern).",
    "Thêm phần monitoring và observability vào câu trả lời system design.",
    "Luyện tập trình bày theo flow: requirements → constraints → high-level design → deep dive → tradeoffs.",
  ],
  perQuestion: [
    {
      questionId: "se-001",
      question: "Tell me about a technical project you are proud of. What tradeoffs did you make?",
      score: 84,
      dimensionScores: {
        clarity: 86, relevance: 90, structure: 82, confidence: 84,
        technicalCorrectness: 86, communication: 82, authenticity: 80,
      },
      feedback: "Câu trả lời rất tốt: nêu rõ bối cảnh, quyết định kỹ thuật (WebSocket vs polling), trade-off (server complexity), và kết quả đo lường được (30 phút → 5 phút). Để hoàn thiện, có thể thêm quy mô team và thách thức trong quá trình triển khai.",
      improvedAnswer: "Tôi xây dựng một dashboard real-time cho team operations gồm 8 người. Yêu cầu là hiển thị dữ liệu incident trong vòng vài giây. Tôi chọn WebSocket thay vì polling vì giảm 70% latency và giảm tải server. Trade-off là tăng complexity ở server, nên tôi dùng Redis Pub/Sub để quản lý connections. Kết quả: thời gian phản hồi incident giảm từ 30 phút xuống dưới 5 phút, team satisfaction score tăng [nêu số liệu cụ thể nếu có].",
    },
    {
      questionId: "se-002",
      question: "Describe a time you had to debug a difficult production issue. What was your approach?",
      score: 86,
      dimensionScores: {
        clarity: 88, relevance: 90, structure: 84, confidence: 84,
        technicalCorrectness: 88, communication: 82, authenticity: 82,
      },
      feedback: "Câu trả lời xuất sắc với quy trình debug rõ ràng: heap snapshot → tìm root cause → fix → monitoring. Số liệu giảm 40% memory rất thuyết phục. Để nâng cấp thêm, có thể đề cập thời gian xử lý và cách communicate với team/stakeholders.",
      improvedAnswer: "Service Node.js của chúng tôi crash mỗi 6 tiếng do memory leak. Tôi nhận trách nhiệm xử lý và bắt đầu bằng phân tích heap snapshots trên staging. Phát hiện event listeners không được cleanup trong module notification. Root cause: mỗi request tạo subscription mới nhưng không unsubscribe. Tôi fix bằng cách thêm cleanup logic và viết integration test cho luồng này. Kết quả: memory usage giảm 40%, zero crash trong 3 tháng tiếp theo. Tôi cũng thiết lập alert khi memory vượt 80% threshold.",
    },
    {
      questionId: "se-003",
      question: "How would you design a system that needs to handle 10x traffic growth? Walk me through your thought process.",
      score: 78,
      dimensionScores: {
        clarity: 82, relevance: 84, structure: 74, confidence: 78,
        technicalCorrectness: 80, communication: 76, authenticity: 72,
      },
      feedback: "Câu trả lời nêu được nhiều hướng tiếp cận đúng (caching, horizontal scaling, queue). Tuy nhiên còn ở mức liệt kê giải pháp, chưa đi sâu vào kiến trúc cụ thể hoặc ước tính capacity. Nên bắt đầu bằng back-of-envelope calculation.",
      improvedAnswer: "Đầu tiên tôi sẽ ước tính: nếu hiện tại hệ thống xử lý 1000 RPS, 10x nghĩa là 10,000 RPS. Tôi sẽ profiling để tìm bottleneck. Thường database là constraint đầu tiên — tôi sẽ thêm read replicas cho read-heavy queries và Redis cache cho hot data với TTL phù hợp. API layer: horizontal scaling sau load balancer, stateless services. CPU-intensive tasks (AI scoring): chuyển sang message queue với auto-scaling workers. CDN cho static assets. Monitoring: set up dashboards cho latency p99, error rate, và auto-scaling triggers. Trade-off: chi phí infrastructure tăng ~3x cho 10x traffic, nhưng có thể tối ưu dần. Rollout theo từng giai đoạn, load test trước mỗi phase.",
    },
  ],
};
