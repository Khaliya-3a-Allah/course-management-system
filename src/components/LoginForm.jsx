import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "./Icons";
import FormField, { buildInputStyle } from "./FormField";

/**
 * LoginForm — credentials entry form (email + password).
 * Extracted from Login.jsx to support 2FA flow.
 */
export default function LoginForm({ form, onFieldChange, onSubmit, errors, authError, isSubmitting }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={styles.card}>
      <div style={styles.cardAccent} />
      <div style={styles.cardInner}>
        <h1 style={styles.title}>Welcome back.</h1>
        <p style={styles.subtitle}>Sign in to continue learning.</p>

        {authError && (
          <div style={styles.authError} role="alert">{authError}</div>
        )}

        <form onSubmit={onSubmit} style={styles.form} noValidate>
          <FormField label="Email" error={errors.email}>
            <input
              id="login-email"
              type="email"
              value={form.email}
              onChange={(e) => onFieldChange("email", e.target.value)}
              placeholder="you@example.com"
              style={buildInputStyle(errors.email)}
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" error={errors.password}>
            <div style={styles.passwordWrapper}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => onFieldChange("password", e.target.value)}
                placeholder="Enter your password"
                style={{ ...buildInputStyle(errors.password), paddingRight: "3rem" }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={styles.eyeButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.switchText}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={styles.switchLink}>Register</Link>
        </p>

        <div style={styles.demoHint}>
          <p style={styles.demoText}>
            Demo credentials:{" "}
            <code style={styles.code}>alex@example.com</code> /{" "}
            <code style={styles.code}>password123</code>
          </p>
        </div>
      </div>

      <style>{focusStyles}</style>
    </div>
  );
}

const focusStyles = `
  #login-email:focus,
  #login-password:focus {
    border-color: rgba(217, 119, 6, 0.5) !important;
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
  }
`;

const styles = {
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#16161a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  cardAccent: {
    height: "4px",
    background: "linear-gradient(90deg, #d97706, #f59e0b)",
  },
  cardInner: { padding: "2.25rem" },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.75rem",
    color: "#f5f2ec",
    margin: "0 0 0.3rem",
  },
  subtitle: { color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.75rem" },
  authError: {
    backgroundColor: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    color: "#f87171",
    fontSize: "0.85rem",
    marginBottom: "1.25rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1.1rem" },
  passwordWrapper: { position: "relative" },
  eyeButton: {
    position: "absolute",
    right: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    lineHeight: 1,
    padding: "0.3rem",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    transition: "color 0.15s",
  },
  submitButton: {
    padding: "0.85rem",
    backgroundColor: "#d97706",
    color: "#0c0c0e",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "0.93rem",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "0.25rem",
    transition: "opacity 0.2s, transform 0.1s",
  },
  switchText: {
    textAlign: "center",
    fontSize: "0.85rem",
    color: "#6b7280",
    marginTop: "1.5rem",
  },
  switchLink: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
  demoHint: {
    marginTop: "1.25rem",
    padding: "0.75rem",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  demoText: {
    fontSize: "0.75rem",
    color: "#4b5563",
    margin: 0,
    textAlign: "center",
  },
  code: {
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "0.1rem 0.35rem",
    borderRadius: "4px",
    color: "#9ca3af",
    fontFamily: "monospace",
  },
};
