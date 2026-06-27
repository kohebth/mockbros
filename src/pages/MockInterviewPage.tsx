import { useNavigate } from "react-router-dom";

const INTERVIEW_MODES = [
  {
    id: "entry",
    title: "Test thử đầu vào",
    subtitle: "EQ / IQ",
    description: "Đánh giá năng lực tổng quát về trí tuệ cảm xúc và tư duy logic.",
    path: "/mock-interview/entry-test",
    emoji: "🧠",
  },
  {
    id: "professional",
    title: "Test thử chuyên môn",
    subtitle: "Theo nghề",
    description: "Kiểm tra kiến thức chuyên môn theo ngành nghề bạn quan tâm.",
    path: "/mock-interview/professional-test",
    emoji: "📝",
  },
  {
    id: "ai",
    title: "Phỏng vấn AI",
    subtitle: "Luyện tập thực tế",
    description: "Luyện phỏng vấn với AI, nhận phản hồi chi tiết và gợi ý cải thiện.",
    path: "/mock-interview/ai",
    emoji: "🤖",
  },
];

export function MockInterviewPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="page-header">
        <h1>Phỏng vấn thử</h1>
        <p>Chọn hình thức luyện tập phù hợp với bạn</p>
      </div>
      <div className="card-grid">
        {INTERVIEW_MODES.map((mode) => (
          <div
            key={mode.id}
            className="card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(mode.path)}
          >
            <div className="card-icon">{mode.emoji}</div>
            <h3>{mode.title}</h3>
            <p style={{ fontWeight: 600, color: "var(--color-secondary)", marginBottom: 4 }}>
              {mode.subtitle}
            </p>
            <p>{mode.description}</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 20, width: "100%" }}>
              Bắt đầu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
