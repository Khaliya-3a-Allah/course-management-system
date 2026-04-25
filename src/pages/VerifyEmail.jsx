import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerificationCode, currentUser, addToast } = useAppContext();

  const email = location.state?.email || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [visible, setVisible] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (currentUser) { navigate("/dashboard"); return; }
    if (!email) { navigate("/register"); return; }
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [currentUser, email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleInput = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every((d) => d) ) handleVerify(next.join(""));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setCode(next);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
    e.preventDefault();
  };

  const handleVerify = async (codeStr) => {
    const finalCode = codeStr ?? code.join("");
    if (finalCode.length < 6) { setError("Please enter the full 6-digit code."); return; }
    setIsVerifying(true);
    setError("");
    try {
      await verifyEmail({ email, code: finalCode });
      addToast("Email verified! Welcome to Courseware.", "success");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError("");
    try {
      await resendVerificationCode({ email });
      addToast("A new code has been sent to your email.", "success");
      setResendCooldown(60);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
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
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #d97706, #f59e0b)" }} />

        <div className="p-9">
          <div className="text-center mb-8">
            <span className="text-[2.5rem] block mb-4">📬</span>
            <h1 className="font-heading text-[1.6rem] text-text-primary mb-2">Check your email</h1>
            <p className="text-text-dim text-[0.9rem] leading-relaxed m-0">
              We sent a 6-digit code to<br />
              <strong className="text-text-primary">{email}</strong>
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg px-4 py-3 text-[0.85rem] mb-5 text-center"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
            >
              {error}
            </div>
          )}

          <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-[1.4rem] font-bold rounded-xl border outline-none transition-all"
                style={{
                  background: "var(--color-base)",
                  color: "var(--color-text-primary)",
                  borderColor: digit ? "rgba(217,119,6,0.6)" : error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.12)",
                  boxShadow: digit ? "0 0 0 2px rgba(217,119,6,0.15)" : "none",
                }}
                aria-label={`Digit ${i + 1}`}
                disabled={isVerifying}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={isVerifying || code.some((d) => !d)}
            className="w-full py-3.5 rounded-lg font-bold text-[0.92rem] border-none mb-4"
            style={{
              backgroundColor: "#d97706",
              color: "#0c0c0e",
              opacity: isVerifying || code.some((d) => !d) ? 0.5 : 1,
              cursor: isVerifying || code.some((d) => !d) ? "not-allowed" : "pointer",
            }}
          >
            {isVerifying ? "Verifying…" : "Verify Email"}
          </button>

          <p className="text-center text-[0.84rem] text-text-dim m-0">
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="bg-transparent border-none font-semibold text-[0.84rem] cursor-pointer p-0"
              style={{
                color: resendCooldown > 0 ? "#6b7280" : "#d97706",
                cursor: resendCooldown > 0 || isResending ? "not-allowed" : "pointer",
              }}
            >
              {isResending ? "Sending…" : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </button>
          </p>
        </div>
      </article>
    </main>
  );
}
