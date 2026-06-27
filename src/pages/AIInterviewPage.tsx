import { useState } from "react";
import { industries, allRoles } from "../data/industries";
import { Breadcrumb } from "../components/Breadcrumb";

type Message = {
  role: "ai" | "user";
  content: string;
};

export function AIInterviewPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);

  const AI_QUESTIONS = [
    "Hãy giới thiệu về bản thân bạn và kinh nghiệm liên quan đến vị trí này.",
    "Bạn có thể kể về một dự án hoặc thành tích bạn tự hào nhất?",
    "Bạn xử lý áp lực và deadline như thế nào trong công việc?",
  ];

  const handleStart = () => {
    const role = allRoles.find((r) => r.slug === selectedRole);
    setStarted(true);
    setMessages([
      {
        role: "ai",
        content: `Xin chào! Tôi là AI phỏng vấn của Mockbros. Hôm nay chúng ta sẽ phỏng vấn cho vị trí ${role?.name || "chung"}. ${AI_QUESTIONS[0]}`,
      },
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    const aiQuestionIndex = newMessages.filter((m) => m.role === "ai").length;

    if (aiQuestionIndex < AI_QUESTIONS.length) {
      newMessages.push({
        role: "ai",
        content: `Cảm ơn câu trả lời! ${AI_QUESTIONS[aiQuestionIndex]}`,
      });
    } else {
      newMessages.push({
        role: "ai",
        content: "Cảm ơn bạn đã hoàn thành buổi phỏng vấn! Dưới đây là nhận xét của tôi.",
      });
      setFinished(true);
    }

    setMessages(newMessages);
    setInput("");
  };

  if (!started) {
    return (
      <div className="container">
        <Breadcrumb items={[
          { label: "Phỏng vấn thử", path: "/mock-interview" },
          { label: "Phỏng vấn AI" },
        ]} />
        <div className="test-layout">
          <h1 style={{ marginBottom: 16 }}>Phỏng vấn AI</h1>
          <p style={{ color: "var(--color-muted)", marginBottom: 32, lineHeight: 1.7 }}>
            Luyện phỏng vấn với AI. Chọn nghề để AI đặt câu hỏi phù hợp.
          </p>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Chọn nghề (tuỳ chọn)</label>
            <select
              className="search-input"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">-- Phỏng vấn chung --</option>
              {industries.map((industry) => (
                <optgroup key={industry.id} label={industry.name}>
                  {industry.roles.filter((r) => r.hasDictionary).map((role) => (
                    <option key={role.id} value={role.slug}>{role.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleStart}>
            Bắt đầu phỏng vấn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="test-layout">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2>Phỏng vấn AI</h2>
          {!finished && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFinished(true)}>
              Kết thúc phỏng vấn
            </button>
          )}
        </div>

        <div className="chat-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              {msg.content}
            </div>
          ))}
        </div>

        {finished ? (
          <div className="result-panel" style={{ marginTop: 32 }}>
            <h3>Nhận xét tổng hợp</h3>
            <div className="result-item">
              <span style={{ fontWeight: 600 }}>Điểm mạnh:</span>
              <span>Bạn trả lời rõ ràng, mạch lạc và có cấu trúc tốt.</span>
            </div>
            <div className="result-item">
              <span style={{ fontWeight: 600 }}>Cần cải thiện:</span>
              <span>Hãy bổ sung thêm ví dụ cụ thể và số liệu để câu trả lời thuyết phục hơn.</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={() => { setStarted(false); setMessages([]); setFinished(false); setInput(""); }}
            >
              Phỏng vấn lại
            </button>
          </div>
        ) : (
          <div className="chat-input-bar">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim()}>
              Gửi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
