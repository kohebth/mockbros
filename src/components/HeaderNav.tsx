import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/", label: "Trang chủ" },
  { path: "/dictionary", label: "Từ điển năng lực" },
  { path: "/mock-interview", label: "Phỏng vấn thử" },
  { path: "/faq", label: "FAQ" },
  { path: "/cv", label: "CV của bạn" },
  { path: "/login", label: "Đăng nhập" },
];

export function HeaderNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="header">
      <div className="container header-inner">
        <NavLink to="/" className="header-logo">
          <img src="/mockbros_logo.png" alt="Mockbros" />
        </NavLink>
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive || (item.path !== "/" && location.pathname.startsWith(item.path)) ? "active" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span />
        </button>
      </div>
    </header>
  );
}
