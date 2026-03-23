/**
 * CategoryChips — toggleable chip multi-select for category interests.
 * Props: options (string[]), selected (string[]), onChange (newSelected => void)
 */
export default function CategoryChips({ options, selected, onChange }) {
  function toggle(value) {
    const updated = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(updated);
  }

  return (
    <div style={styles.container} role="group" aria-label="Select interests">
      {options.map((option) => {
        const isActive = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            style={isActive ? { ...styles.chip, ...styles.chipActive } : styles.chip}
            aria-pressed={isActive}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.45rem",
  },
  chip: {
    padding: "0.45rem 0.85rem",
    backgroundColor: "#111114",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    color: "#9ca3af",
    fontSize: "0.83rem",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
  },
  chipActive: {
    backgroundColor: "rgba(217,119,6,0.1)",
    borderColor: "rgba(217,119,6,0.4)",
    color: "#d97706",
  },
};
