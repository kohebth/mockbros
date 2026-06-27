import { useNavigate } from "react-router-dom";
import type { Role } from "../data/types";

type Props = {
  role: Role;
};

export function RoleItem({ role }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (role.hasDictionary) {
      navigate(`/dictionary/${role.slug}`);
    }
  };

  return (
    <button
      className={`role-item ${role.hasDictionary ? "available" : "unavailable"}`}
      onClick={handleClick}
      disabled={!role.hasDictionary}
      title={role.hasDictionary ? `Xem từ điển năng lực: ${role.name}` : "Đang cập nhật"}
    >
      {role.name}
      {role.hasDictionary && <span className="badge badge-available">Có từ điển</span>}
      {!role.hasDictionary && <span className="badge badge-coming">Đang cập nhật</span>}
    </button>
  );
}
