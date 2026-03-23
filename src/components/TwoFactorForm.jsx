import { useState, useEffect, useRef } from "react";
import { validateTwoFactorCode } from "../utils/validators";

const MAX_ATTEMPTS = 5;
const CODE_EXPIRY_SECONDS = 60;
const RESEND_COOLDOWN_SECONDS = 10;

/**
 * TwoFactorForm — 2FA verification step for login.
 * Displays a code input with countdown timer, attempt tracking, and resend.
 */
export default function TwoFactorForm({
  userEmail,
  verificationCode,
  onVerified,
  onResendCode,
  onBack,
}) {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(CODE_EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeRef = useRef(verificationCode);

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
  const attemptsRemaining = MAX_ATTEMPTS - attempts;

  function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateTwoFactorCode(inputCode);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (isExpired) {
      setError("Code has expired. Please resend a new code.");
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (inputCode.trim() === verificationCode) {
      onVerified();
      return;
    }

    if (newAttempts >= MAX_ATTEMPTS) {
      onBack("Too many failed attempts. Please sign in again.");
      return;
    }

    setError(`Incorrect code. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining.`);
  }

  function handleResend() {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    onResendCode();
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  }

  return (
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
          </button>
        </form>

        <button
          type="button"
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
