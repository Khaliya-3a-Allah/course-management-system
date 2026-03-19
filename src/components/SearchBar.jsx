export default function SearchBar({ value, onChange, placeholder = "Search courses..." }) {
  return (
    <div style={styles.wrap}>
      <span style={styles.icon} aria-hidden="true">🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
        aria-label="Search courses"
      />
      {value && (
        <button onClick={() => onChange("")} style={styles.clear} aria-label="Clear search">✕</button>
      )}
    </div>
  );
}

const styles = {
  wrap: { position: "relative", display: "flex", alignItems: "center", width: "100%" },
  icon: { position: "absolute", left: "0.9rem", fontSize: "0.85rem", pointerEvents: "none" },
  input: { width: "100%", padding: "0.75rem 2.5rem 0.75rem 2.5rem", backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem", outline: "none", boxSizing: "border-box" },
  clear: { position: "absolute", right: "0.9rem", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.85rem", padding: "0.25rem", lineHeight: 1 },
};
