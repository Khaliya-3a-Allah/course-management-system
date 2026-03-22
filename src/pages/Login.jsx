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

  const handleSubmit = (e) => {
    e?.preventDefault();
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
    <main
      className="min-h-screen bg-base flex items-center justify-center p-8 font-body"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <article
        className="w-full max-w-[420px] bg-surface rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        aria-label="Login form"
      >
        {/* Amber accent bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #d97706, #f59e0b)" }} aria-hidden="true" />

        <div className="p-9">
          <h1 className="font-heading text-[1.75rem] text-text-primary mb-1">Welcome back.</h1>
          <p className="text-text-dim text-sm mb-7">Sign in to continue learning.</p>

          {authError && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-lg px-4 py-3 text-sm mb-5"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-label="Sign in">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-[0.82rem] font-semibold text-text-secondary tracking-wide">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-err" : undefined}
                className="w-full px-4 py-3 rounded-lg text-[0.93rem] text-text-primary bg-base outline-none transition-colors font-body"
                style={{ border: `1px solid ${errors.email ? "#ef4444" : "rgba(255,255,255,0.09)"}` }}
              />
              {errors.email && <p id="email-err" role="alert" className="text-[0.77rem] text-red-400 m-0">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-[0.82rem] font-semibold text-text-secondary tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "pw-err" : undefined}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full px-4 py-3 pr-12 rounded-lg text-[0.93rem] text-text-primary bg-base outline-none transition-colors font-body"
                  style={{ border: `1px solid ${errors.password ? "#ef4444" : "rgba(255,255,255,0.09)"}` }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[0.95rem] leading-none p-1 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && <p id="pw-err" role="alert" className="text-[0.77rem] text-red-400 m-0">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="mt-1 w-full py-3.5 rounded-lg font-bold text-[0.93rem] cursor-pointer font-body transition-opacity hover:opacity-90 active:opacity-80 border-none"
              style={{ backgroundColor: "#d97706", color: "#0c0c0e" }}
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-text-dim mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold no-underline" style={{ color: "#d97706" }}>Register →</Link>
          </p>

          <aside
            className="mt-5 px-3 py-3 rounded-lg text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
            aria-label="Demo credentials"
          >
            <p className="text-[0.75rem] text-text-faint m-0">
              Demo:{" "}
              <code className="rounded px-1.5 py-0.5 font-mono text-text-muted" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>alex@example.com</code>
              {" "}/{" "}
              <code className="rounded px-1.5 py-0.5 font-mono text-text-muted" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>password123</code>
            </p>
          </aside>
        </div>
      </article>
    </main>
  );
}