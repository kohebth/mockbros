import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  path?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: Props) {
  return (
    <nav className="breadcrumb">
      {items.map((item, idx) => (
        <span key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {idx > 0 && <span className="separator">/</span>}
          {item.path ? (
            <Link to={item.path}>{item.label}</Link>
          ) : (
            <span className="current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
