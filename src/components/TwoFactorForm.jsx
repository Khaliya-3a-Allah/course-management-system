import { useState } from "react";
import { validateTwoFactorCode } from "../utils/validators";

const MAX_ATTEMPTS = 5;

export default function TwoFactorForm({ userEmail, onSubmitCode, onBack }) {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const attemptsRemaining = MAX_ATTEMPTS - attempts;
  const isLockedOut = attempts >= MAX_ATTEMPTS;

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || isLockedOut) return;

    const validationError = validateTwoFactorCode(inputCode);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await onSubmitCode(inputCode.trim());
      if (result?.success) return;

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= MAX_ATTEMPTS) {
        onBack("Too many failed attempts. Please sign in again.");
        return;
      }

      const message =
        result?.message ||
        `Incorrect code. ${MAX_ATTEMPTS - nextAttempts} attempt${
          MAX_ATTEMPTS - nextAttempts === 1 ? "" : "s"
        } remaining.`;
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article
      className="w-full max-w-[420px] bg-surface rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      aria-label="Two-factor verification"
    >
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg, #d97706, #f59e0b)" }}
        aria-hidden="true"
      />

      <div className="p-9">
        <h1 className="font-heading text-[1.75rem] text-text-primary mb-1">Verify your identity.</h1>
        <p className="text-text-dim text-sm mb-1">
          Signed in as <strong className="text-text-secondary">{userEmail}</strong>
        </p>
        <p className="text-[0.78rem] text-text-faint mb-6">
          Open your authenticator app and enter the current 6-digit code.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="two-factor-code"
              className="text-[0.82rem] font-semibold text-text-secondary tracking-wide"
            >
              Verification Code
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
              style={styles.codeInput}
              autoFocus
            />
            {error && (
              <p
                id="two-factor-error"
                className="text-[0.77rem] text-red-400 m-0"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          {attempts > 0 && !isLockedOut && (
            <span
              aria-live="polite"
              aria-atomic="true"
              className="text-[0.78rem] text-text-dim"
            >
              {attemptsRemaining} of {MAX_ATTEMPTS} attempts left
            </span>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLockedOut}
            className="w-full py-3.5 rounded-lg font-bold text-[0.93rem] cursor-pointer font-body transition-opacity hover:opacity-90 active:opacity-80 border-none bg-brand text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying…" : "Verify"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => onBack()}
          className="block w-full mt-4 p-2 bg-transparent border-none text-text-dim text-[0.83rem] font-body text-center cursor-pointer transition-colors hover:text-text-primary"
        >
          Back to sign in
        </button>
      </div>

      <style>{focusStyles}</style>
    </article>
  );
}

const focusStyles = `
  #two-factor-code:focus {
    border-color: rgba(217, 119, 6, 0.5) !important;
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
  }
`;

const styles = {
  codeInput: {
    width: "100%",
    padding: "1rem",
    backgroundColor: "#0c0c0e",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "8px",
    color: "#e8e6e0",
    fontFamily: "'DM Sans', monospace",
    fontSize: "1.5rem",
    letterSpacing: "0.6em",
    textAlign: "center",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
};
