import { useState } from "react";
import { RoleItem } from "./RoleItem";
import type { Industry } from "../data/types";

type Props = {
  industry: Industry;
  defaultOpen?: boolean;
};

export function IndustryGroup({ industry, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`industry-group ${open ? "open" : ""}`}>
      <button
        className="industry-group-header"
        onClick={() => setOpen(!open)}
      >
        <span>{industry.name}</span>
        <span className="role-count">{industry.roles.length} nghề</span>
        <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div className="industry-roles">
        {industry.roles.map((role) => (
          <RoleItem key={role.id} role={role} />
        ))}
      </div>
    </div>
  );
}
