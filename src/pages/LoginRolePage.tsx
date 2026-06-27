import { useMemo, useState } from "react";
import { BriefcaseBusiness, Check, FileUser, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

type UserRole = "applicant" | "hiring-company";

const ROLE_OPTIONS: Array<{
  id: UserRole;
  title: string;
  label: string;
  description: string;
  benefits: string[];
  nextPath: string;
}> = [
  {
    id: "applicant",
    title: "Ứng viên",
    label: "Tôi muốn luyện tập và ứng tuyển",
    description: "Chuẩn bị CV, luyện phỏng vấn và theo dõi mức độ sẵn sàng cho vị trí mục tiêu.",
    benefits: ["Từ điển năng lực theo nghề", "Phỏng vấn thử với AI", "Phân tích CV"],
    nextPath: "/mock-interview",
  },
  {
    id: "hiring-company",
    title: "Doanh nghiệp tuyển dụng",
    label: "Tôi muốn đánh giá ứng viên",
    description: "Tạo bài đánh giá, quản lý phiên phỏng vấn và xem tín hiệu năng lực của ứng viên.",
    benefits: ["Bộ câu hỏi theo vai trò", "Đánh giá năng lực ứng viên", "Theo dõi kết quả tuyển dụng"],
    nextPath: "/dictionary",
  },
];

export function LoginRolePage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("applicant");

  const selectedOption = useMemo(
    () => ROLE_OPTIONS.find((option) => option.id === selectedRole) ?? ROLE_OPTIONS[0],
    [selectedRole],
  );

  const handleContinue = () => {
    window.localStorage.setItem("mockbros:user-role", selectedRole);
    navigate(selectedOption.nextPath);
  };

  return (
    <div className="container">
      <div className="login-role-layout">
        <div className="login-role-intro">
          <span className="section-note">Đăng nhập Mockbros</span>
          <h1>Chọn vai trò của bạn</h1>
          <p>
            Mockbros sẽ cá nhân hóa trải nghiệm theo mục tiêu của bạn ngay sau khi đăng nhập.
          </p>
        </div>

        <div className="role-select-grid" role="radiogroup" aria-label="Chọn vai trò người dùng">
          {ROLE_OPTIONS.map((option) => {
            const isSelected = option.id === selectedRole;
            const Icon = option.id === "applicant" ? FileUser : BriefcaseBusiness;

            return (
              <button
                key={option.id}
                type="button"
                className={`role-select-card ${isSelected ? "selected" : ""}`}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedRole(option.id)}
              >
                <span className="role-select-check" aria-hidden="true">
                  {isSelected && <Check size={16} strokeWidth={3} />}
                </span>
                <span className="role-select-icon">
                  <Icon size={26} strokeWidth={2.2} />
                </span>
                <span className="role-select-title">{option.title}</span>
                <span className="role-select-label">{option.label}</span>
                <span className="role-select-description">{option.description}</span>
                <span className="role-select-benefits">
                  {option.benefits.map((benefit) => (
                    <span key={benefit}>{benefit}</span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="login-role-actions">
          <button className="btn btn-primary" type="button" onClick={handleContinue}>
            <LogIn size={18} />
            Tiếp tục với vai trò {selectedOption.title}
          </button>
        </div>
      </div>
    </div>
  );
}
