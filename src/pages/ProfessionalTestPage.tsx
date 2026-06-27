import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { industries, allRoles } from "../data/industries";
import { Breadcrumb } from "../components/Breadcrumb";
import { EmptyState } from "../components/EmptyState";

export function ProfessionalTestPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [started, setStarted] = useState(false);

  const availableRolesForTest = allRoles.filter((r) => r.hasDictionary);

  if (!started) {
    return (
      <div className="container">
        <Breadcrumb items={[
          { label: "Phỏng vấn thử", path: "/mock-interview" },
          { label: "Test chuyên môn" },
        ]} />
        <div className="test-layout">
          <h1 style={{ marginBottom: 16 }}>Test thử chuyên môn</h1>
          <p style={{ color: "var(--color-muted)", marginBottom: 32, lineHeight: 1.7 }}>
            Chọn nghề bạn muốn kiểm tra kiến thức chuyên môn.
          </p>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Chọn nghề</label>
            <select
              className="search-input"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">-- Chọn nghề --</option>
              {industries.map((industry) => (
                <optgroup key={industry.id} label={industry.name}>
                  {industry.roles.map((role) => (
                    <option key={role.id} value={role.slug} disabled={!role.hasDictionary}>
                      {role.name} {role.hasDictionary ? "✦" : "(Đang cập nhật)"}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {selectedRole && !availableRolesForTest.find((r) => r.slug === selectedRole) && (
            <div className="section-note" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", marginBottom: 16 }}>
              Nghề này chưa có câu hỏi test chuyên môn
            </div>
          )}

          <button
            className="btn btn-primary"
            disabled={!selectedRole || !availableRolesForTest.find((r) => r.slug === selectedRole)}
            onClick={() => setStarted(true)}
          >
            Bắt đầu test
          </button>
        </div>
      </div>
    );
  }

  const role = allRoles.find((r) => r.slug === selectedRole);

  return (
    <div className="container">
      <Breadcrumb items={[
        { label: "Phỏng vấn thử", path: "/mock-interview" },
        { label: "Test chuyên môn" },
      ]} />
      <div className="test-layout">
        <EmptyState
          title={`Test chuyên môn: ${role?.name || ""}`}
          message="Ngân hàng câu hỏi chuyên môn cho nghề này đang được xây dựng. Hãy quay lại sau!"
        />
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={() => setStarted(false)}>
            ← Chọn nghề khác
          </button>
          {role?.hasDictionary && (
            <button className="btn btn-secondary" onClick={() => navigate(`/dictionary/${role.slug}`)}>
              Xem từ điển năng lực
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
