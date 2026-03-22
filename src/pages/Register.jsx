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

  const handleSubmit = (e) => {
    e?.preventDefault();
    const { errors: errs, isValid } = validateRegisterForm(form);
    setErrors(errs);
    if (!isValid) return;

    const emailTaken = users.some((u) => u.email.toLowerCase() === form.email.toLowerCase());
    if (emailTaken) { setAuthError("An account with this email already exists."); return; }

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
    <main
      className="min-h-screen bg-base flex items-center justify-center p-8 font-body"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <article
        className="w-full max-w-[440px] bg-surface rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        aria-label="Registration form"
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #d97706, #f59e0b)" }} aria-hidden="true" />

        <div className="p-9">
          <h1 className="font-heading text-[1.75rem] text-text-primary mb-1">Create account.</h1>
          <p className="text-text-dim text-sm mb-7">Start learning today — it's free.</p>

          {authError && (
            <div role="alert" aria-live="assertive" className="rounded-lg px-4 py-3 text-sm mb-5"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-label="Create account">

            {/* Name */}
            <Field label="Full Name" htmlFor="reg-name" error={errors.name} errorId="name-err">
              <input id="reg-name" type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Alex Jordan" autoComplete="name" aria-required="true" aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-err" : undefined}
                className="w-full px-4 py-3 rounded-lg text-[0.93rem] text-text-primary bg-base outline-none transition-colors font-body"
                style={{ border: `1px solid ${errors.name ? "#ef4444" : "rgba(255,255,255,0.09)"}` }} />
            </Field>

            {/* Email */}
            <Field label="Email" htmlFor="reg-email" error={errors.email} errorId="reg-email-err">
              <input id="reg-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com" autoComplete="email" aria-required="true" aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "reg-email-err" : undefined}
                className="w-full px-4 py-3 rounded-lg text-[0.93rem] text-text-primary bg-base outline-none transition-colors font-body"
                style={{ border: `1px solid ${errors.email ? "#ef4444" : "rgba(255,255,255,0.09)"}` }} />
            </Field>

            {/* Password */}
            <Field label="Password" htmlFor="reg-password" hint="Minimum 6 characters" error={errors.password} errorId="reg-pw-err">
              <div className="relative">
                <input id="reg-password" type={showPw ? "text" : "password"} value={form.password}
                  onChange={(e) => set("password", e.target.value)} placeholder="••••••••" autoComplete="new-password"
                  aria-required="true" aria-invalid={!!errors.password} aria-describedby={errors.password ? "reg-pw-err" : undefined}
                  className="w-full px-4 py-3 pr-12 rounded-lg text-[0.93rem] text-text-primary bg-base outline-none transition-colors font-body"
                  style={{ border: `1px solid ${errors.password ? "#ef4444" : "rgba(255,255,255,0.09)"}` }} />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"} aria-pressed={showPw}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[0.95rem] leading-none p-1 text-text-muted hover:text-text-primary transition-colors">
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </Field>

            {/* Confirm password */}
            <Field label="Confirm Password" htmlFor="reg-confirm" error={errors.confirmPassword} errorId="confirm-err">
              <input id="reg-confirm" type={showPw ? "text" : "password"} value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)} placeholder="••••••••" autoComplete="new-password"
                aria-required="true" aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "confirm-err" : undefined}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full px-4 py-3 rounded-lg text-[0.93rem] text-text-primary bg-base outline-none transition-colors font-body"
                style={{ border: `1px solid ${errors.confirmPassword ? "#ef4444" : "rgba(255,255,255,0.09)"}` }} />
            </Field>

            {/* Role */}
            <fieldset className="flex flex-col gap-1.5 border-none p-0 m-0">
              <legend className="text-[0.82rem] font-semibold text-text-secondary tracking-wide mb-1.5">I am a...</legend>
              <div className="flex gap-3" role="group" aria-label="Select your role">
                {["student", "instructor"].map((r) => (
                  <button key={r} type="button" onClick={() => set("role", r)}
                    aria-pressed={form.role === r}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-lg cursor-pointer font-body text-[0.85rem] transition-all border"
                    style={{
                      backgroundColor: form.role === r ? "rgba(217,119,6,0.08)" : "#0c0c0e",
                      borderColor: form.role === r ? "rgba(217,119,6,0.5)" : "rgba(255,255,255,0.08)",
                      color: form.role === r ? "#d97706" : "#6b7280",
                    }}>
                    <span aria-hidden="true">{r === "student" ? "📚" : "🎓"}</span>
                    <span className="font-semibold text-[0.82rem]">{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                  </button>
                ))}
              </div>
              {errors.role && <p role="alert" className="text-[0.77rem] text-red-400 m-0">{errors.role}</p>}
            </fieldset>

            <button type="submit"
              className="mt-1 w-full py-3.5 rounded-lg font-bold text-[0.93rem] cursor-pointer font-body transition-opacity hover:opacity-90 active:opacity-80 border-none"
              style={{ backgroundColor: "#d97706", color: "#0c0c0e" }}>
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-text-dim mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold no-underline" style={{ color: "#d97706" }}>Sign in →</Link>
          </p>
        </div>
      </article>
    </main>
  );
}

function Field({ label, htmlFor, error, errorId, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[0.82rem] font-semibold text-text-secondary tracking-wide">{label}</label>
      {hint && <p className="text-[0.73rem] text-text-faint m-0">{hint}</p>}
      {children}
      {error && <p id={errorId} role="alert" className="text-[0.77rem] text-red-400 m-0">{error}</p>}
    </div>
  );
}