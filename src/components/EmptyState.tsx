import { useNavigate } from "react-router-dom";

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  actionPath?: string;
  suggestions?: Array<{ label: string; path: string }>;
};

export function EmptyState({ title, message, actionLabel, actionPath, suggestions }: Props) {
  const navigate = useNavigate();

  return (
    <div className="empty-state">
      <div className="empty-state-icon">📭</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && actionPath && (
        <button
          className="btn btn-primary"
          style={{ marginTop: 20 }}
          onClick={() => navigate(actionPath)}
        >
          {actionLabel}
        </button>
      )}
      {suggestions && suggestions.length > 0 && (
        <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {suggestions.map((s) => (
            <button
              key={s.path}
              className="btn btn-sm btn-secondary"
              onClick={() => navigate(s.path)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
