import { useState, useMemo } from "react";
import { industries } from "../data/industries";
import { IndustryGroup } from "../components/IndustryGroup";
import { EmptyState } from "../components/EmptyState";

export function DictionaryPage() {
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const filteredIndustries = useMemo(() => {
    let result = industries;

    if (selectedIndustry) {
      result = result.filter((i) => i.id === selectedIndustry);
    }

    if (search.trim()) {
      const keyword = search.toLowerCase().trim();
      result = result
        .map((industry) => ({
          ...industry,
          roles: industry.roles.filter(
            (r) =>
              r.name.toLowerCase().includes(keyword) ||
              industry.name.toLowerCase().includes(keyword)
          ),
        }))
        .filter((i) => i.roles.length > 0);
    }

    return result;
  }, [search, selectedIndustry]);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Từ điển năng lực</h1>
        <p>Tra cứu khung năng lực theo ngành và nghề</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm nghề..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-chips">
        <button
          className={`filter-chip ${!selectedIndustry ? "active" : ""}`}
          onClick={() => setSelectedIndustry(null)}
        >
          Tất cả
        </button>
        {industries.map((i) => (
          <button
            key={i.id}
            className={`filter-chip ${selectedIndustry === i.id ? "active" : ""}`}
            onClick={() => setSelectedIndustry(selectedIndustry === i.id ? null : i.id)}
          >
            {i.name}
          </button>
        ))}
      </div>

      <div className="section-note" style={{ marginBottom: 24 }}>
        ✦ Đã có từ điển năng lực cho nghề
      </div>

      {filteredIndustries.length > 0 ? (
        filteredIndustries.map((industry) => (
          <IndustryGroup key={industry.id} industry={industry} defaultOpen />
        ))
      ) : (
        <EmptyState
          title="Không tìm thấy nghề"
          message={`Không có kết quả cho "${search}". Hãy thử từ khóa khác.`}
        />
      )}

      <div className="section" style={{ borderTop: "none", paddingTop: 40 }}>
        <div className="card" style={{ background: "var(--color-accent-soft)", borderColor: "var(--color-accent)" }}>
          <h3>Giới thiệu khóa học nâng cao năng lực</h3>
          <p style={{ color: "var(--color-muted)", marginTop: 8 }}>
            Nội dung khóa học đang được cập nhật. Hãy quay lại sau để khám phá các lộ trình học tập phù hợp với nghề của bạn.
          </p>
        </div>
      </div>
    </div>
  );
}
