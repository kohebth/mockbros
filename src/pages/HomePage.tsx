import { useNavigate } from "react-router-dom";
import { industries } from "../data/industries";
import { IndustryGroup } from "../components/IndustryGroup";
import { EmptyState } from "../components/EmptyState";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>
            Chuẩn bị sẵn sàng cho <span className="accent">sự nghiệp</span> của bạn
          </h1>
          <p className="hero-subtitle">
            Mockbros giúp ứng viên tra cứu khung năng lực theo nghề, luyện phỏng vấn với AI
            và phân tích CV để sẵn sàng cho mọi cơ hội việc làm.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate("/dictionary")}>
              Khám phá từ điển năng lực
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/mock-interview")}>
              Luyện phỏng vấn thử
            </button>
          </div>
        </div>
      </section>

      <section className="section" id="industry-catalog">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Danh mục ngành</h2>
            <div className="section-note">
              ✦ Đã có từ điển năng lực cho nghề
            </div>
          </div>
          {industries.map((industry) => (
            <IndustryGroup key={industry.id} industry={industry} />
          ))}
        </div>
      </section>

      <section className="section" id="featured-tests">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Bài test nổi bật</h2>
          </div>
          <EmptyState
            title="Chưa có bài test nổi bật"
            message="Các bài test sẽ được hiển thị khi đã có đầy đủ câu hỏi. Hãy quay lại sau!"
            actionLabel="Xem phỏng vấn thử"
            actionPath="/mock-interview"
          />
        </div>
      </section>

      <section className="section" id="job-opportunity">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Tìm kiếm cơ hội</h2>
          </div>
          <div className="card-grid">
            {[
              { name: "LinkedIn", url: "https://linkedin.com/jobs" },
              { name: "TopCV", url: "https://topcv.vn" },
              { name: "VietnamWorks", url: "https://vietnamworks.com" },
            ].map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
                style={{ textDecoration: "none" }}
              >
                <h3>{platform.name}</h3>
                <p>Tìm kiếm cơ hội việc làm trên {platform.name}</p>
                <div style={{ marginTop: "auto", paddingTop: 16, color: "var(--color-accent)", fontWeight: 700, fontSize: "0.85rem" }}>
                  Truy cập ↗
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
