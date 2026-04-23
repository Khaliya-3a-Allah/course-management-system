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

  useEffect(() => {
    if (verificationCode !== codeRef.current) {
      codeRef.current = verificationCode;
      setInputCode("");
      setError("");
      setSecondsLeft(CODE_EXPIRY_SECONDS);
    }
  }, [verificationCode]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

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
    <article
      className="w-full max-w-[420px] bg-surface rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      aria-label="Two-factor verification"
    >
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #d97706, #f59e0b)" }} aria-hidden="true" />

      <div className="p-9">
        <h1 className="font-heading text-[1.75rem] text-text-primary mb-1">Verify your identity.</h1>
        <p className="text-text-dim text-sm mb-1">
          We sent a 6-digit code to <strong className="text-text-secondary">{userEmail}</strong>
        </p>
        <p className="text-[0.78rem] text-text-faint mb-6">Check the notification in the top-right corner.</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="two-factor-code" className="text-[0.82rem] font-semibold text-text-secondary tracking-wide">
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

          {/* Timer and attempts */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span
              aria-live="polite"
              aria-atomic="true"
              className={`text-[0.78rem] ${isExpired ? "text-red-400 font-semibold" : "text-text-dim"}`}
            >
              {isExpired ? "Code expired" : `Expires in ${formatTime(secondsLeft)}`}
            </span>
            {attempts > 0 && (
              <span aria-live="polite" aria-atomic="true" className="text-[0.78rem] text-text-dim">
                {attemptsRemaining} of {MAX_ATTEMPTS} attempts left
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg font-bold text-[0.93rem] cursor-pointer font-body transition-opacity hover:opacity-90 active:opacity-80 border-none bg-brand text-base"
          >
            Verify
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="block w-full mt-4 p-2 bg-transparent border-none text-brand text-[0.85rem] font-semibold font-body text-center"
          style={{
            opacity: resendCooldown > 0 ? 0.4 : 1,
            cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
          }}
        >
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
        </button>

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
