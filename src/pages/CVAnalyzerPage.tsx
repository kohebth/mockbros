import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { allRoles } from "../data/industries";

type AnalysisState = "empty" | "uploading" | "uploaded" | "analyzing" | "result" | "error";

export function CVAnalyzerPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<AnalysisState>("empty");
  const [fileName, setFileName] = useState("");
  const [cvText, setCvText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setState("uploaded");
    }
  };

  const handleAnalyze = () => {
    setState("analyzing");
    setTimeout(() => setState("result"), 2000);
  };

  const hasInput = state === "uploaded" || cvText.trim().length > 0;

  const matchedRoles = allRoles.filter((r) => r.hasDictionary).slice(0, 3);

  return (
    <div className="container">
      <div className="page-header">
        <h1>CV của bạn</h1>
        <p>Phân tích CV của ứng viên bằng AI và khớp với khung năng lực</p>
      </div>

      {state !== "result" && (
        <>
          <div
            className={`upload-zone ${state === "uploaded" ? "has-file" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div style={{ fontSize: "2.5rem" }}>📄</div>
            {state === "uploaded" ? (
              <>
                <h3>{fileName}</h3>
                <p>Click để chọn file khác</p>
              </>
            ) : (
              <>
                <h3>Tải lên CV của bạn</h3>
                <p>Hỗ trợ định dạng PDF, DOCX, TXT</p>
              </>
            )}
          </div>

          <div style={{ textAlign: "center", padding: "16px 0", color: "var(--color-muted)", fontWeight: 500 }}>
            hoặc
          </div>

          <textarea
            className="search-input"
            style={{ width: "100%", minHeight: 160, resize: "vertical", marginBottom: 24 }}
            placeholder="Dán nội dung CV của bạn vào đây..."
            value={cvText}
            onChange={(e) => { setCvText(e.target.value); if (e.target.value.trim()) setState("uploaded"); }}
          />

          <button
            className="btn btn-primary"
            disabled={!hasInput || state === "analyzing"}
            onClick={handleAnalyze}
            style={{ width: "100%" }}
          >
            {state === "analyzing" ? "Đang phân tích..." : "Phân tích CV bằng AI"}
          </button>

          {state === "analyzing" && (
            <div style={{ marginTop: 32 }}>
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" style={{ width: "80%" }} />
              <div className="skeleton skeleton-card" style={{ marginTop: 16, height: 120 }} />
            </div>
          )}
        </>
      )}

      {state === "result" && (
        <>
          <div className="result-panel" style={{ marginBottom: 24 }}>
            <h3>Kết quả phân tích CV</h3>
            <div className="result-item">
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Điểm mạnh</div>
                <div style={{ color: "var(--color-muted)" }}>
                  CV có cấu trúc rõ ràng, trình bày kinh nghiệm làm việc và kỹ năng phù hợp.
                </div>
              </div>
            </div>
            <div className="result-item">
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Cần cải thiện</div>
                <div style={{ color: "var(--color-muted)" }}>
                  Nên bổ sung thêm số liệu cụ thể về thành tích và chứng chỉ chuyên môn.
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: 16 }}>Nghề phù hợp</h3>
          <div className="card-grid">
            {matchedRoles.map((role) => (
              <div key={role.id} className="card">
                <h3>{role.name}</h3>
                <span className="badge badge-available" style={{ marginBottom: 12 }}>Có từ điển năng lực</span>
                <p>Xem khung năng lực và luyện phỏng vấn cho vị trí này.</p>
                <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/dictionary/${role.slug}`)}>
                    Xem từ điển
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate("/mock-interview/professional-test")}>
                    Làm test
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "32px 0", display: "flex", gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => { setState("empty"); setFileName(""); setCvText(""); }}>
              Phân tích CV khác
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/mock-interview/ai")}>
              Luyện phỏng vấn AI
            </button>
          </div>
        </>
      )}

      {state === "error" && (
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <p style={{ color: "var(--color-error)", fontWeight: 600 }}>Có lỗi xảy ra khi phân tích CV. Vui lòng thử lại.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleAnalyze}>
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
}
