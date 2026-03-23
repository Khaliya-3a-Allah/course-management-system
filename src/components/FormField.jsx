/**
 * Reusable form field wrapper — renders label, optional hint,
 * child input, and inline error in a consistent layout.
 */
export default function FormField({ label, error, hint, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {hint && <p style={styles.hint}>{hint}</p>}
      {children}
      {error && (
        <p style={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Builds a styled input object with conditional error border.
 * Shared by Register, Login, and other form pages.
 */
export function buildInputStyle(hasError) {
  return {
    width: "100%",
    padding: "0.8rem 1rem",
    backgroundColor: "#0c0c0e",
    border: `1px solid ${hasError ? "#ef4444" : "rgba(255,255,255,0.09)"}`,
    borderRadius: "8px",
    color: "#e8e6e0",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.93rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
}

const styles = {
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#d1cfc8",
    letterSpacing: "0.03em",
  },
  hint: {
    fontSize: "0.73rem",
    color: "#4b5563",
    margin: "0 0 0.15rem",
  },
  errorText: {
    fontSize: "0.77rem",
    color: "#ef4444",
    margin: 0,
  },
};
