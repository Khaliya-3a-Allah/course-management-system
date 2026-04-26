import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAppContext } from "../context/AppContext";
import { validateTwoFactorCode } from "../utils/validators";
import { RESOURCE_STATUS } from "../utils/status";
import {
  describeTwoFactorEnableError,
  describeTwoFactorDisableError,
} from "../utils/authErrors";

/**
 * TwoFactorEnroll — renders the TOTP enrollment flow: (1) fetch a fresh
 * secret + otpauth URL from the server, (2) display a QR + manual-entry
 * secret, (3) verify the current code to flip twoFactorEnabled to true.
 *
 * Also supports disabling 2FA via password + current code re-auth.
 */
export default function TwoFactorEnroll() {
  const {
    currentUser,
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor,
    addToast,
  } = useAppContext();

  const [enrollment, setEnrollment] = useState(null); // { otpauthUrl, secret }
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [status, setStatus] = useState(RESOURCE_STATUS.IDLE);

  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disableError, setDisableError] = useState("");
  const [showDisable, setShowDisable] = useState(false);

  const isEnabled = Boolean(currentUser?.twoFactorEnabled);
  const isBusy = status === RESOURCE_STATUS.LOADING;

  async function handleStartEnrollment() {
    setStatus(RESOURCE_STATUS.LOADING);
    setCodeError("");
    try {
      const data = await setupTwoFactor();
      setEnrollment({ otpauthUrl: data.otpauthUrl, secret: data.secret });
    } catch (error) {
      addToast(
        error.message || "Could not start 2FA enrollment. Please try again.",
        "error"
      );
    } finally {
      setStatus(RESOURCE_STATUS.IDLE);
    }
  }

  async function handleVerifyEnrollment(event) {
    event.preventDefault();
    const validationError = validateTwoFactorCode(code);
    if (validationError) {
      setCodeError(validationError);
      return;
    }

    setStatus(RESOURCE_STATUS.LOADING);
    setCodeError("");
    try {
      await enableTwoFactor({ code: code.trim() });
      addToast("Two-factor authentication enabled.", "success");
      setEnrollment(null);
      setCode("");
      setStatus(RESOURCE_STATUS.SUCCESS);
    } catch (error) {
      setCodeError(describeTwoFactorEnableError(error));
      setStatus(RESOURCE_STATUS.ERROR);
    }
  }

  async function handleDisable(event) {
    event.preventDefault();

    if (!disablePassword) {
      setDisableError("Password is required to disable 2FA.");
      return;
    }
    const codeValidation = validateTwoFactorCode(disableCode);
    if (codeValidation) {
      setDisableError(codeValidation);
      return;
    }

    setStatus(RESOURCE_STATUS.LOADING);
    setDisableError("");
    try {
      await disableTwoFactor({
        password: disablePassword,
        code: disableCode.trim(),
      });
      addToast("Two-factor authentication disabled.", "success");
      setShowDisable(false);
      setDisablePassword("");
      setDisableCode("");
      setStatus(RESOURCE_STATUS.SUCCESS);
    } catch (error) {
      setDisableError(describeTwoFactorDisableError(error));
      setStatus(RESOURCE_STATUS.ERROR);
    }
  }

  return (
    <section
      className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 md:p-6"
      aria-labelledby="two-factor-heading"
    >
      <header className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2
            id="two-factor-heading"
            className="font-['Playfair_Display',serif] text-[1.25rem] text-[#f5f2ec] mb-1"
          >
            Two-Factor Authentication
          </h2>
          <p className="text-[0.86rem] text-[#9ca3af]">
            {isEnabled
              ? "Your account is protected with TOTP 2FA."
              : "Protect your account by requiring a 6-digit code at sign-in."}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[0.72rem] font-bold uppercase tracking-wider border ${
            isEnabled
              ? "bg-[rgba(34,197,94,0.12)] text-[#22c55e] border-[rgba(34,197,94,0.3)]"
              : "bg-[rgba(255,255,255,0.05)] text-[#9ca3af] border-[rgba(255,255,255,0.1)]"
          }`}
        >
          {isEnabled ? "Enabled" : "Disabled"}
        </span>
      </header>

      {!isEnabled && !enrollment && (
        <button
          type="button"
          onClick={handleStartEnrollment}
          disabled={isBusy}
          className="px-5 py-2.5 rounded-lg font-bold text-[0.88rem] cursor-pointer border-none bg-[#d97706] text-[#0c0c0e] disabled:opacity-50"
        >
          {isBusy ? "Preparing…" : "Enable 2FA"}
        </button>
      )}

      {!isEnabled && enrollment && (
        <div className="flex flex-col gap-4">
          <p className="text-[0.88rem] text-[#d1cfc8]">
            Scan this QR code with Google Authenticator, Authy, or any TOTP-compatible app, then enter the current 6-digit code below.
          </p>

          <div className="flex flex-col md:flex-row items-start gap-5">
            <div
              className="p-3 rounded-lg bg-white"
              aria-label="Scan this QR code with your authenticator app"
            >
              <QRCodeSVG value={enrollment.otpauthUrl} size={160} level="M" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[0.78rem] text-[#6b7280] uppercase tracking-wider mb-1">
                Or enter the key manually
              </p>
              <code
                className="block px-3 py-2 rounded-lg text-[0.85rem] break-all font-mono border border-[rgba(255,255,255,0.1)] bg-[#121216] text-[#e8e6e0]"
              >
                {enrollment.secret}
              </code>
            </div>
          </div>

          <form onSubmit={handleVerifyEnrollment} className="flex flex-col gap-3" noValidate>
            <label
              htmlFor="enroll-code"
              className="text-[0.82rem] font-semibold text-[#d1cfc8] tracking-wide"
            >
              6-Digit Code
            </label>
            <input
              id="enroll-code"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ""));
                if (codeError) setCodeError("");
              }}
              placeholder="000000"
              className="w-full max-w-[260px] px-4 py-3 rounded-lg text-[1.2rem] tracking-[0.4em] text-center border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
              aria-invalid={!!codeError}
              aria-describedby={codeError ? "enroll-code-error" : undefined}
            />
            {codeError && (
              <p id="enroll-code-error" role="alert" className="text-[0.78rem] text-[#ef4444]">
                {codeError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isBusy}
                className="px-5 py-2.5 rounded-lg font-bold text-[0.88rem] cursor-pointer border-none bg-[#d97706] text-[#0c0c0e] disabled:opacity-50"
              >
                {isBusy ? "Verifying…" : "Verify & Enable"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnrollment(null);
                  setCode("");
                  setCodeError("");
                }}
                className="px-5 py-2.5 rounded-lg font-medium text-[0.88rem] cursor-pointer border border-[rgba(255,255,255,0.12)] text-[#e8e6e0] bg-transparent"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isEnabled && !showDisable && (
        <button
          type="button"
          onClick={() => setShowDisable(true)}
          className="px-5 py-2.5 rounded-lg font-semibold text-[0.88rem] cursor-pointer border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] text-[#ef4444]"
        >
          Disable 2FA
        </button>
      )}

      {isEnabled && showDisable && (
        <form onSubmit={handleDisable} noValidate className="flex flex-col gap-3">
          <p className="text-[0.86rem] text-[#d1cfc8]">
            Enter your password and a current 6-digit code to turn off 2FA.
          </p>
          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            Password
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => {
                setDisablePassword(e.target.value);
                if (disableError) setDisableError("");
              }}
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
              autoComplete="current-password"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
            Current 6-digit Code
            <input
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              value={disableCode}
              onChange={(e) => {
                setDisableCode(e.target.value.replace(/\D/g, ""));
                if (disableError) setDisableError("");
              }}
              className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0] tracking-[0.3em]"
            />
          </label>
          {disableError && (
            <p role="alert" className="text-[0.78rem] text-[#ef4444]">
              {disableError}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isBusy}
              className="px-5 py-2.5 rounded-lg font-bold text-[0.88rem] cursor-pointer border-none bg-[#ef4444] text-white disabled:opacity-50"
            >
              {isBusy ? "Disabling…" : "Confirm Disable"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDisable(false);
                setDisablePassword("");
                setDisableCode("");
                setDisableError("");
              }}
              className="px-5 py-2.5 rounded-lg font-medium text-[0.88rem] cursor-pointer border border-[rgba(255,255,255,0.12)] text-[#e8e6e0] bg-transparent"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
