import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { EmptyState } from "../components/EmptyState";

const DEMO_QUESTIONS = [
  {
    id: "1",
    question: "Khi gặp xung đột trong nhóm, bạn thường xử lý như thế nào?",
    options: [
      "Lắng nghe tất cả các bên trước khi đưa ra ý kiến",
      "Tránh xung đột và để mọi thứ tự giải quyết",
      "Tìm giải pháp thỏa hiệp để cả hai bên đều chấp nhận",
      "Báo cáo với cấp trên để họ xử lý",
    ],
  },
  {
    id: "2",
    question: "Dãy số sau tuân theo quy luật nào: 2, 6, 18, 54, ?",
    options: ["108", "162", "148", "128"],
  },
  {
    id: "3",
    question: "Bạn nhận được nhiều công việc khẩn cấp cùng lúc, bạn sẽ?",
    options: [
      "Ưu tiên theo deadline và mức độ ảnh hưởng",
      "Làm theo thứ tự nhận được",
      "Hỏi sếp cái nào làm trước",
      "Cố gắng làm hết cùng lúc",
    ],
  },
];

export function EntryTestPage() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const hasQuestions = DEMO_QUESTIONS.length > 0;

  if (!hasQuestions) {
    return (
      <div className="container">
        <Breadcrumb items={[
          { label: "Phỏng vấn thử", path: "/mock-interview" },
          { label: "Test EQ / IQ" },
        ]} />
        <EmptyState
          title="Chưa có câu hỏi"
          message="Ngân hàng câu hỏi EQ/IQ đang được cập nhật."
          actionLabel="Quay lại"
          actionPath="/mock-interview"
        />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="container">
        <Breadcrumb items={[
          { label: "Phỏng vấn thử", path: "/mock-interview" },
          { label: "Test EQ / IQ" },
        ]} />
        <div className="test-layout">
          <h1 style={{ marginBottom: 16 }}>Test thử đầu vào: EQ / IQ</h1>
          <p style={{ color: "var(--color-muted)", marginBottom: 32, lineHeight: 1.7 }}>
            Bài test đánh giá năng lực tổng quát về trí tuệ cảm xúc (EQ) và tư duy logic (IQ).
            Hoàn thành {DEMO_QUESTIONS.length} câu hỏi để nhận kết quả.
          </p>
          <button className="btn btn-primary" onClick={() => setStarted(true)}>
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const score = Object.keys(answers).length;
    return (
      <div className="container">
        <div className="test-layout">
          <div className="result-panel">
            <h3>Kết quả bài test EQ / IQ</h3>
            <p style={{ fontSize: "2.5rem", fontWeight: 800, margin: "16px 0" }}>
              {Math.round((score / DEMO_QUESTIONS.length) * 100)}%
            </p>
            <p>Bạn đã hoàn thành {score}/{DEMO_QUESTIONS.length} câu hỏi.</p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => { setStarted(false); setSubmitted(false); setAnswers({}); setCurrentQ(0); }}>
                Làm lại
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/mock-interview")}>
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = DEMO_QUESTIONS[currentQ];

  return (
    <div className="container">
      <div className="test-layout">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${((currentQ + 1) / DEMO_QUESTIONS.length) * 100}%` }} />
        </div>
        <div className="question-card">
          <div className="question-number">Câu {currentQ + 1} / {DEMO_QUESTIONS.length}</div>
          <h3>{q.question}</h3>
          <div className="option-list">
            {q.options.map((opt, idx) => (
              <div
                key={idx}
                className={`option-item ${answers[q.id] === idx ? "selected" : ""}`}
                onClick={() => setAnswers({ ...answers, [q.id]: idx })}
              >
                <div className="option-radio" />
                {opt}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 16 }}>
          <button
            className="btn btn-ghost"
            disabled={currentQ === 0}
            onClick={() => setCurrentQ(currentQ - 1)}
          >
            ← Câu trước
          </button>
          {currentQ < DEMO_QUESTIONS.length - 1 ? (
            <button
              className="btn btn-primary"
              disabled={answers[q.id] === undefined}
              onClick={() => setCurrentQ(currentQ + 1)}
            >
              Câu tiếp →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={Object.keys(answers).length < DEMO_QUESTIONS.length}
              onClick={() => setSubmitted(true)}
            >
              Nộp bài
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
