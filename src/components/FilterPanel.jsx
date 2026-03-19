const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function FilterPanel({ courses, filters, onChange }) {
  const categories = [...new Set(courses.map((c) => c.category))];

  const toggle = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  const isActive = (key, value) => (filters[key] || []).includes(value);

  const hasFilters =
    (filters.category?.length > 0) || (filters.level?.length > 0);

  return (
    <aside style={styles.panel} aria-label="Filter courses">
      <div style={styles.header}>
        <span style={styles.headerLabel}>Filters</span>
        {hasFilters && (
          <button
            onClick={() => onChange({ category: [], level: [] })}
            style={styles.clearAll}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div style={styles.group}>
        <p style={styles.groupLabel}>Category</p>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => toggle("category", cat)}
            style={isActive("category", cat) ? { ...styles.chip, ...styles.chipActive } : styles.chip}
            aria-pressed={isActive("category", cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Level */}
      <div style={styles.group}>
        <p style={styles.groupLabel}>Level</p>
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => toggle("level", lvl)}
            style={isActive("level", lvl) ? { ...styles.chip, ...styles.chipActive } : styles.chip}
            aria-pressed={isActive("level", lvl)}
          >
            {lvl}
          </button>
        ))}
      </div>
    </aside>
  );
}

const styles = {
  panel: { display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: "200px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerLabel: { fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", fontWeight: 700 },
  clearAll: { background: "none", border: "none", color: "#d97706", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: 0 },
  group: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  groupLabel: { fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#4b5563", fontWeight: 700, margin: "0 0 0.35rem" },
  chip: { padding: "0.45rem 0.85rem", backgroundColor: "#111114", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#9ca3af", fontSize: "0.83rem", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" },
  chipActive: { backgroundColor: "rgba(217,119,6,0.1)", borderColor: "rgba(217,119,6,0.4)", color: "#d97706" },
};
