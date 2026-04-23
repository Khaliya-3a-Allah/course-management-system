import { useState } from "react";
import { validateTwoFactorCode } from "../utils/validators";

/**
 * TwoFactorForm — TOTP verification step during login.
 */
export default function TwoFactorForm({
  userEmail,
  onVerify,
  onBack,
  isSubmitting = false,
}) {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateTwoFactorCode(inputCode);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      await onVerify(inputCode.trim());
    } catch (verifyError) {
      setError(verifyError.message || "Invalid authentication code.");
    }
  }

  return (
    <article
      className="w-full max-w-[420px] bg-surface rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      aria-label="Two-factor verification"
    >
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #d97706, #f59e0b)" }} aria-hidden="true" />

      <div className="p-9">
        <h1 className="font-heading text-[1.75rem] text-text-primary mb-1">Verify your identity.</h1>
        <p className="text-text-dim text-sm mb-1">
          Enter the 6-digit code from your authenticator app for <strong className="text-text-secondary">{userEmail}</strong>
        </p>
        <p className="text-[0.78rem] text-text-faint mb-6">Codes refresh every 30 seconds in your TOTP app.</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="two-factor-code" className="text-[0.82rem] font-semibold text-text-secondary tracking-wide">
              Authenticator Code
            </label>
            <input
              id="two-factor-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              autoComplete="one-time-code"
              value={inputCode}
              onChange={(e) => {
                const filtered = e.target.value.replace(/\D/g, "");
                setInputCode(filtered);
                if (error) setError("");
              }}
              placeholder="000000"
              className="w-full p-4 rounded-lg text-text-primary bg-base outline-none transition-colors font-body text-2xl tracking-[0.6em] text-center"
              style={{ border: "1px solid rgba(255,255,255,0.09)" }}
              aria-invalid={!!error}
              aria-describedby={error ? "two-factor-error" : undefined}
              autoFocus
            />
            {error && (
              <p id="two-factor-error" className="text-[0.77rem] text-red-400 m-0" role="alert">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-lg font-bold text-[0.93rem] cursor-pointer font-body transition-opacity hover:opacity-90 active:opacity-80 border-none bg-brand text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => onBack()}
          className="block w-full mt-2 p-2 bg-transparent border-none text-text-dim text-[0.83rem] font-body text-center cursor-pointer transition-colors hover:text-text-primary"
        >
          Back to sign in
        </button>
      </div>
    </article>
  );
}
