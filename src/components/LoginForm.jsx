import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "./Icons";
import FormField, { INPUT_CLASS, buildInputBorder } from "./FormField";
import EmailAutocompleteInput from "./EmailAutocompleteInput";

/**
 * LoginForm — credentials entry form (email + password).
 * Extracted from Login.jsx to support 2FA flow.
 */
export default function LoginForm({ form, onFieldChange, onSubmit, errors, authError, isSubmitting }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <article
      className="w-full max-w-[420px] bg-surface rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      aria-label="Login form"
    >
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

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" aria-label="Sign in">
          <FormField label="Email" htmlFor="login-email" error={errors.email}>
            <EmailAutocompleteInput
              id="login-email"
              value={form.email}
              onChange={(e) => onFieldChange("email", e.target.value)}
              placeholder="you@example.com"
              className={INPUT_CLASS}
              style={buildInputBorder(errors.email)}
              autoComplete="email"
              ariaRequired="true"
              ariaInvalid={!!errors.email}
              ariaDescribedby={errors.email ? "login-email-error" : undefined}
            />
          </FormField>

          <FormField label="Password" htmlFor="login-password" error={errors.password}>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => onFieldChange("password", e.target.value)}
                placeholder="Enter your password"
                className={`${INPUT_CLASS} pr-12`}
                style={buildInputBorder(errors.password)}
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "login-password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer leading-none p-1 text-text-dim hover:text-text-primary transition-colors flex items-center justify-center rounded"
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full py-3.5 rounded-lg font-bold text-[0.93rem] font-body transition-opacity hover:opacity-90 active:opacity-80 border-none bg-brand text-base"
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-text-dim mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold no-underline text-brand">Register</Link>
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
  );
}
