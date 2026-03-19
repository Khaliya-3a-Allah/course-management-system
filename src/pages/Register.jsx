import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateRegisterForm } from "../utils/validators";

export default function Register() {
  const { users, setUsers, setCurrentUser, currentUser } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [showPw, setShowPw] = useState(false);
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
    const { errors: errs, isValid } = validateRegisterForm(form);
    setErrors(errs);
    if (!isValid) return;

    const emailTaken = users.some(
      (u) => u.email.toLowerCase() === form.email.toLowerCase()
    );
    if (emailTaken) {
      setAuthError("An account with this email already exists.");
      return;
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      createdCourseIds: [],
      enrolledCourseIds: [],
      savedCourseIds: [],
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
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
        <div style={styles.cardAccent} />
        <div style={styles.cardInner}>
          <h1 style={styles.title}>Create account.</h1>
          <p style={styles.sub}>Start learning today — it's free.</p>

          {authError && (
            <div style={styles.authError} role="alert">{authError}</div>
          )}

          <div style={styles.form}>
            {/* Name */}
            <Field label="Full Name" error={errors.name}>
              <input
                id="reg-name"
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Alex Jordan"
                style={inputStyle(errors.name)}
                autoComplete="name"
              />
            </Field>

            {/* Email */}
            <Field label="Email" error={errors.email}>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                style={inputStyle(errors.email)}
                autoComplete="email"
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password} hint="Minimum 6 characters">
              <div style={styles.passwordWrap}>
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle(errors.password), paddingRight: "3rem" }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} style={styles.eyeBtn} aria-label="Toggle password">
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" error={errors.confirmPassword}>
              <input
                id="reg-confirm"
                type={showPw ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                placeholder="••••••••"
                style={inputStyle(errors.confirmPassword)}
                autoComplete="new-password"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </Field>

            {/* Role */}
            <Field label="I am a..." error={errors.role}>
              <div style={styles.roleRow} role="group" aria-label="Select role">
                {["student", "instructor"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set("role", r)}
                    style={form.role === r ? { ...styles.roleBtn, ...styles.roleBtnActive } : styles.roleBtn}
                    aria-pressed={form.role === r}
                  >
                    <span>{r === "student" ? "📚" : "🎓"}</span>
                    <span style={styles.roleBtnLabel}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                  </button>
                ))}
              </div>
            </Field>

            <button onClick={handleSubmit} style={styles.submitBtn}>
              Create Account
            </button>
          </div>

          <p style={styles.switchText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.switchLink}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {hint && <p style={styles.hint}>{hint}</p>}
      {children}
      {error && <p style={styles.errorText} role="alert">{error}</p>}
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
  card: { width: "100%", maxWidth: "440px", backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden" },
  cardAccent: { height: "4px", background: "linear-gradient(90deg, #d97706, #f59e0b)" },
  cardInner: { padding: "2.25rem" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", color: "#f5f2ec", margin: "0 0 0.3rem" },
  sub: { color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.75rem" },
  authError: { backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#f87171", fontSize: "0.85rem", marginBottom: "1.25rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#d1cfc8", letterSpacing: "0.03em" },
  hint: { fontSize: "0.73rem", color: "#4b5563", margin: "0 0 0.15rem" },
  errorText: { fontSize: "0.77rem", color: "#ef4444", margin: 0 },
  passwordWrap: { position: "relative" },
  eyeBtn: { position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "0.95rem", lineHeight: 1, padding: "0.2rem" },
  roleRow: { display: "flex", gap: "0.75rem" },
  roleBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem", padding: "0.85rem", backgroundColor: "#0c0c0e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#6b7280", transition: "all 0.15s" },
  roleBtnActive: { borderColor: "rgba(217,119,6,0.5)", backgroundColor: "rgba(217,119,6,0.08)", color: "#d97706" },
  roleBtnLabel: { fontWeight: 600, fontSize: "0.82rem" },
  submitBtn: { padding: "0.85rem", backgroundColor: "#d97706", color: "#0c0c0e", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.93rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: "0.25rem" },
  switchText: { textAlign: "center", fontSize: "0.85rem", color: "#6b7280", marginTop: "1.5rem" },
  switchLink: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
};
