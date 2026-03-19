import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateLoginForm } from "../utils/validators";

export default function Login() {
  const { users, setCurrentUser, currentUser } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (currentUser) { navigate("/dashboard"); return; }
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [currentUser, navigate]);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    setAuthError("");
  };

  const handleSubmit = () => {
    const { errors: errs, isValid } = validateLoginForm(form);
    setErrors(errs);
    if (!isValid) return;

    const matched = users.find(
      (u) => u.email.toLowerCase() === form.email.toLowerCase() && u.password === form.password
    );

    if (!matched) {
      setAuthError("Incorrect email or password. Try alex@example.com / password123");
      return;
    }

    setCurrentUser(matched);
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        ...styles.page,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div style={styles.card}>
        {/* Decorative top */}
        <div style={styles.cardAccent} />

        <div style={styles.cardInner}>
          <h1 style={styles.title}>Welcome back.</h1>
          <p style={styles.sub}>Sign in to continue learning.</p>

          {authError && (
            <div style={styles.authError} role="alert">{authError}</div>
          )}

          <div style={styles.form}>
            {/* Email */}
            <div style={styles.field}>
              <label htmlFor="login-email" style={styles.label}>Email</label>
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                style={inputStyle(errors.email)}
                autoComplete="email"
                aria-describedby={errors.email ? "email-err" : undefined}
              />
              {errors.email && <p id="email-err" style={styles.errorText} role="alert">{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={styles.field}>
              <label htmlFor="login-password" style={styles.label}>Password</label>
              <div style={styles.passwordWrap}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle(errors.password), paddingRight: "3rem" }}
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  aria-describedby={errors.password ? "pw-err" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={styles.eyeBtn}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && <p id="pw-err" style={styles.errorText} role="alert">{errors.password}</p>}
            </div>

            <button onClick={handleSubmit} style={styles.submitBtn}>
              Sign In
            </button>
          </div>

          <p style={styles.switchText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.switchLink}>Register →</Link>
          </p>

          {/* Demo hint */}
          <div style={styles.demoHint}>
            <p style={styles.demoText}>
              Demo credentials: <code style={styles.code}>alex@example.com</code> / <code style={styles.code}>password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = (hasError) => ({
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
  transition: "border-color 0.2s",
});

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0c0c0e", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "'DM Sans', sans-serif" },
  card: { width: "100%", maxWidth: "420px", backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden" },
  cardAccent: { height: "4px", background: "linear-gradient(90deg, #d97706, #f59e0b)" },
  cardInner: { padding: "2.25rem" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", color: "#f5f2ec", margin: "0 0 0.3rem" },
  sub: { color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.75rem" },
  authError: { backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#f87171", fontSize: "0.85rem", marginBottom: "1.25rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#d1cfc8", letterSpacing: "0.03em" },
  passwordWrap: { position: "relative" },
  eyeBtn: { position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "0.95rem", lineHeight: 1, padding: "0.2rem" },
  errorText: { fontSize: "0.77rem", color: "#ef4444", margin: 0 },
  submitBtn: { padding: "0.85rem", backgroundColor: "#d97706", color: "#0c0c0e", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.93rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: "0.25rem", transition: "opacity 0.2s" },
  switchText: { textAlign: "center", fontSize: "0.85rem", color: "#6b7280", marginTop: "1.5rem" },
  switchLink: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
  demoHint: { marginTop: "1.25rem", padding: "0.75rem", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" },
  demoText: { fontSize: "0.75rem", color: "#4b5563", margin: 0, textAlign: "center" },
  code: { backgroundColor: "rgba(255,255,255,0.06)", padding: "0.1rem 0.35rem", borderRadius: "4px", color: "#9ca3af", fontFamily: "monospace" },
};
