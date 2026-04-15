import { useState } from "react";
import { validateTwoFactorCode } from "../utils/validators";

const MAX_ATTEMPTS = 5;

/**
 * TwoFactorForm — second step of login for users with TOTP enabled.
 * The 6-digit code is entered from the user's authenticator app (Google
 * Authenticator / Authy / 1Password / etc.) and verified server-side via
 * onSubmitCode. The component owns no secret; all verification is remote.
 */
export default function TwoFactorForm({ userEmail, onSubmitCode, onBack }) {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

<<<<<<< Updated upstream
  // Reset local state when a new code is generated (resend)
  useEffect(() => {
    if (verificationCode !== codeRef.current) {
      codeRef.current = verificationCode;
      setInputCode("");
      setError("");
      setSecondsLeft(CODE_EXPIRY_SECONDS);
    }
  }, [verificationCode]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const isExpired = secondsLeft === 0;
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    <div style={styles.card}>
      <div style={styles.cardAccent} />
      <div style={styles.cardInner}>
        <h1 style={styles.title}>Verify your identity.</h1>
        <p style={styles.subtitle}>
          We sent a 6-digit code to <strong style={styles.emailHighlight}>{userEmail}</strong>
        </p>
        <p style={styles.hint}>Check the notification in the top-right corner.</p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label htmlFor="two-factor-code" style={styles.label}>Verification Code</label>
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
              <p style={styles.errorText} role="alert">{error}</p>
            )}
          </div>

          {/* Timer and attempts */}
          <div style={styles.infoRow}>
            <span style={isExpired ? styles.timerExpired : styles.timer}>
              {isExpired ? "Code expired" : `Expires in ${formatTime(secondsLeft)}`}
            </span>
            {attempts > 0 && (
              <span style={styles.attemptsText}>
                {attemptsRemaining} of {MAX_ATTEMPTS} attempts left
              </span>
            )}
          </div>

          <button type="submit" style={styles.verifyButton}>
            Verify
=======
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
>>>>>>> Stashed changes
          </button>
        </form>

        <button
          type="button"
<<<<<<< Updated upstream
          onClick={handleResend}
          disabled={resendCooldown > 0}
          style={{
            ...styles.resendButton,
            opacity: resendCooldown > 0 ? 0.4 : 1,
            cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
          }}
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Resend code"}
        </button>

        <button
          type="button"
          onClick={() => onBack()}
          style={styles.backButton}
=======
          onClick={() => onBack()}
          className="block w-full mt-4 p-2 bg-transparent border-none text-text-dim text-[0.83rem] font-body text-center cursor-pointer transition-colors hover:text-text-primary"
>>>>>>> Stashed changes
        >
          Back to sign in
        </button>
      </div>

      <style>{focusStyles}</style>
    </div>
  );
}

const focusStyles = `
  #two-factor-code:focus {
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
  subtitle: {
    color: "#6b7280",
    fontSize: "0.9rem",
    marginBottom: "0.25rem",
  },
  emailHighlight: { color: "#d1cfc8" },
  hint: {
    color: "#4b5563",
    fontSize: "0.78rem",
    marginBottom: "1.5rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#d1cfc8",
    letterSpacing: "0.03em",
  },
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
  errorText: { fontSize: "0.77rem", color: "#ef4444", margin: 0 },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  timer: { fontSize: "0.78rem", color: "#6b7280" },
  timerExpired: { fontSize: "0.78rem", color: "#ef4444", fontWeight: 600 },
  attemptsText: { fontSize: "0.78rem", color: "#6b7280" },
  verifyButton: {
    padding: "0.85rem",
    backgroundColor: "#d97706",
    color: "#0c0c0e",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "0.93rem",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.1s",
  },
  resendButton: {
    display: "block",
    width: "100%",
    background: "none",
    border: "none",
    color: "#d97706",
    fontSize: "0.85rem",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "1rem",
    padding: "0.5rem",
    textAlign: "center",
  },
  backButton: {
    display: "block",
    width: "100%",
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: "0.83rem",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "0.5rem",
    padding: "0.5rem",
    cursor: "pointer",
    textAlign: "center",
    transition: "color 0.15s",
  },
};
