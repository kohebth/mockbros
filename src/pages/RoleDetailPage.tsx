import { useParams, useNavigate } from "react-router-dom";
import { findRoleBySlug, findIndustryByRoleSlug, availableRoleSlugs } from "../data/industries";
import { Breadcrumb } from "../components/Breadcrumb";
import { EmptyState } from "../components/EmptyState";

const ROLE_PLACEHOLDER_CONTENT: Record<string, { overview: string; competencies: string[]; skills: string[] }> = {
  "brand-executive": {
    overview: "Brand Executive chịu trách nhiệm xây dựng và phát triển thương hiệu, đảm bảo tính nhất quán trong mọi hoạt động truyền thông và marketing.",
    competencies: ["Quản lý thương hiệu", "Lập kế hoạch marketing", "Phân tích thị trường", "Quản lý chiến dịch", "Kỹ năng giao tiếp"],
    skills: ["Brand Strategy", "Market Research", "Creative Brief", "Campaign Management", "Stakeholder Communication"],
  },
  "backend-developer": {
    overview: "Backend Developer thiết kế, xây dựng và bảo trì phần server-side của ứng dụng web, đảm bảo hiệu suất, bảo mật và khả năng mở rộng.",
    competencies: ["Thiết kế hệ thống", "Quản lý cơ sở dữ liệu", "API Development", "Bảo mật ứng dụng", "Tối ưu hiệu suất"],
    skills: ["Node.js / Java / Python", "SQL & NoSQL", "RESTful API", "Docker & CI/CD", "System Design"],
  },
  "java-developer": {
    overview: "Java Developer chuyên phát triển ứng dụng dùng Java/JVM, từ enterprise systems đến microservices và Android applications.",
    competencies: ["Java Core & OOP", "Spring Framework", "Microservices Architecture", "Testing & QA", "Performance Tuning"],
    skills: ["Java 17+", "Spring Boot", "Hibernate/JPA", "JUnit & Mockito", "Maven/Gradle"],
  },
  "data-scientist": {
    overview: "Data Scientist phân tích dữ liệu phức tạp, xây dựng mô hình machine learning và cung cấp insights để hỗ trợ ra quyết định kinh doanh.",
    competencies: ["Statistical Analysis", "Machine Learning", "Data Visualization", "Business Acumen", "Communication"],
    skills: ["Python / R", "TensorFlow / PyTorch", "SQL", "Tableau / Power BI", "A/B Testing"],
  },
};

export function RoleDetailPage() {
  const { roleSlug } = useParams<{ roleSlug: string }>();
  const navigate = useNavigate();
  const role = findRoleBySlug(roleSlug || "");
  const industry = findIndustryByRoleSlug(roleSlug || "");

  if (!role || !role.hasDictionary) {
    return (
      <div className="container">
        <Breadcrumb items={[
          { label: "Trang chủ", path: "/" },
          { label: "Từ điển năng lực", path: "/dictionary" },
          { label: role?.name || "Không tìm thấy" },
        ]} />
        <EmptyState
          title="Chưa có dữ liệu cho nghề này"
          message="Nội dung từ điển năng lực cho nghề này đang được cập nhật. Hãy thử các nghề đã có từ điển năng lực."
          suggestions={availableRoleSlugs.map((slug) => {
            const r = findRoleBySlug(slug);
            return { label: r?.name || slug, path: `/dictionary/${slug}` };
          })}
        />
      </div>
    );
  }

  const content = ROLE_PLACEHOLDER_CONTENT[role.slug];

  return (
    <div className="container">
      <Breadcrumb items={[
        { label: "Trang chủ", path: "/" },
        { label: "Từ điển năng lực", path: "/dictionary" },
        { label: industry?.name || "", path: "/dictionary" },
        { label: role.name },
      ]} />

      <div className="page-header" style={{ borderBottom: "none", marginBottom: 0 }}>
        <div className="role-detail-header">
          <h1>{role.name}</h1>
          <span className="badge badge-available">Đã có từ điển năng lực</span>
        </div>
        {content && <p>{content.overview}</p>}
      </div>

      <div className="role-detail-content">
        <div>
          {content && (
            <>
              <div className="competency-section">
                <h3>Năng lực cốt lõi</h3>
                {content.competencies.map((c) => (
                  <div className="competency-item" key={c}>{c}</div>
                ))}
              </div>
              <div className="competency-section">
                <h3>Kỹ năng yêu cầu</h3>
                {content.skills.map((s) => (
                  <div className="competency-item" key={s}>{s}</div>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-icon">📝</div>
            <h3>Test chuyên môn</h3>
            <p>Kiểm tra kiến thức chuyên môn cho vị trí {role.name}</p>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 16, width: "100%" }}
              onClick={() => navigate("/mock-interview/professional-test")}
            >
              Làm test chuyên môn
            </button>
          </div>
          <div className="card">
            <div className="card-icon">🤖</div>
            <h3>Phỏng vấn AI</h3>
            <p>Luyện phỏng vấn với AI cho vị trí {role.name}</p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 16, width: "100%" }}
              onClick={() => navigate("/mock-interview/ai")}
            >
              Bắt đầu phỏng vấn
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "40px 0", display: "flex", gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => navigate("/dictionary")}>
          ← Quay lại danh mục
        </button>
      </div>
    </div>
  );
}
