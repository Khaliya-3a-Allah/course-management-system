import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateEmail, validateLoginForm, validatePassword, validatePasswordMatch, validateTwoFactorCode } from "../utils/validators";
import LoginForm from "../components/LoginForm";
import TwoFactorForm from "../components/TwoFactorForm";
import Modal from "../components/Modal";

export default function Login() {
  const { currentUser, login, completeTwoFactor, requestPasswordReset, resetPassword, addToast } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [isVerifying2fa, setIsVerifying2fa] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const [resetForm, setResetForm] = useState({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [resetErrors, setResetErrors] = useState({});
  const [resetStatus, setResetStatus] = useState("");
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
      return;
    }
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
    setAuthError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const { errors: validationErrors, isValid } = validateLoginForm(form);
    setErrors(validationErrors);
    if (!isValid) return;

    setIsSubmitting(true);
    setAuthError("");

    try {
      const result = await login({ email: form.email, password: form.password });

      if (result?.emailVerificationRequired) {
        navigate("/verify-email", { state: { email: result.email } });
        return;
      }

      if (result?.twoFactorRequired) {
        setPendingChallenge({
          challengeToken: result.challengeToken,
          email: result.email || form.email,
        });
        addToast("Enter the 6-digit code from your authenticator app.", "info", 6000);
        return;
      }

      addToast("Welcome back!", "success");
      navigate("/dashboard");
    } catch (error) {
      setAuthError(error.message || "Incorrect email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(code) {
    if (!pendingChallenge?.challengeToken || isVerifying2fa) return;

    setIsVerifying2fa(true);
    try {
      await completeTwoFactor({
        challengeToken: pendingChallenge.challengeToken,
        code,
      });
      setPendingChallenge(null);
      addToast("Two-factor verification successful.", "success");
    } finally {
      setIsVerifying2fa(false);
    }
  }

  function handleBackToLogin(errorMessage) {
    setPendingChallenge(null);
    if (errorMessage) {
      addToast(errorMessage, "error");
    }
  }

  function openPasswordReset() {
    setResetForm((prev) => ({ ...prev, email: form.email || prev.email }));
    setResetErrors({});
    setResetStatus("");
    setResetStep("email");
    setResetModalOpen(true);
  }

  function updateResetField(key, value) {
    setResetForm((prev) => ({ ...prev, [key]: value }));
    if (resetErrors[key]) {
      setResetErrors((prev) => ({ ...prev, [key]: "" }));
    }
    setResetStatus("");
  }

  async function handleRequestReset(event) {
    event.preventDefault();
    const emailError = validateEmail(resetForm.email);
    setResetErrors({ email: emailError });
    if (emailError) return;

    setIsResetSubmitting(true);
    try {
      await requestPasswordReset({ email: resetForm.email });
      setResetStep("code");
      setResetStatus("Check your email for a 6-digit reset code.");
    } catch (error) {
      setResetStatus(error?.message || "Could not send reset code.");
    } finally {
      setIsResetSubmitting(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    const nextErrors = {
      code: validateTwoFactorCode(resetForm.code),
      password: validatePassword(resetForm.password),
      confirmPassword: validatePasswordMatch(resetForm.password, resetForm.confirmPassword),
    };
    setResetErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsResetSubmitting(true);
    try {
      await resetPassword({
        email: resetForm.email,
        code: resetForm.code,
        password: resetForm.password,
      });
      setResetModalOpen(false);
      setResetStep("email");
      setForm((prev) => ({ ...prev, email: resetForm.email, password: "" }));
      addToast("Password reset successfully. Sign in with your new password.", "success", 6000);
    } catch (error) {
      setResetStatus(error?.message || "Could not reset password.");
    } finally {
      setIsResetSubmitting(false);
    }
  }

  return (
    <main
      className={`min-h-screen bg-base flex items-center justify-center p-8 font-body transition-[opacity,transform] duration-500 ease-in-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[14px]"}`}
    >
      {pendingChallenge ? (
        <TwoFactorForm
          userEmail={pendingChallenge.email}
          onVerify={handleVerify}
          onBack={handleBackToLogin}
          isSubmitting={isVerifying2fa}
        />
      ) : (
        <LoginForm
          form={form}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          errors={errors}
          authError={authError}
          isSubmitting={isSubmitting}
          onForgotPassword={openPasswordReset}
        />
      )}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={resetStep === "email" ? "Reset Password" : "Enter Email Code"}
      >
        {resetStatus && (
          <p className="mb-4 rounded-lg border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] px-3 py-2 text-[0.85rem] text-[#f6c56b]">
            {resetStatus}
          </p>
        )}

        {resetStep === "email" ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
              Account Email
              <input
                type="email"
                value={resetForm.email}
                onChange={(event) => updateResetField("email", event.target.value)}
                className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
                autoComplete="email"
              />
              {resetErrors.email && <span className="text-[#ef4444] text-[0.74rem]">{resetErrors.email}</span>}
            </label>
            <button
              type="submit"
              disabled={isResetSubmitting}
              className="w-full py-3 rounded-lg font-bold text-[0.9rem] border-none text-[#0c0c0e] bg-[#d97706] disabled:opacity-60"
            >
              {isResetSubmitting ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
              6-Digit Code
              <input
                value={resetForm.code}
                onChange={(event) => updateResetField("code", event.target.value)}
                className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
                inputMode="numeric"
                maxLength={6}
              />
              {resetErrors.code && <span className="text-[#ef4444] text-[0.74rem]">{resetErrors.code}</span>}
            </label>
            <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
              New Password
              <input
                type="password"
                value={resetForm.password}
                onChange={(event) => updateResetField("password", event.target.value)}
                className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
                autoComplete="new-password"
              />
              {resetErrors.password && <span className="text-[#ef4444] text-[0.74rem]">{resetErrors.password}</span>}
            </label>
            <label className="flex flex-col gap-1.5 text-[0.82rem] text-[#9ca3af]">
              Confirm Password
              <input
                type="password"
                value={resetForm.confirmPassword}
                onChange={(event) => updateResetField("confirmPassword", event.target.value)}
                className="w-full rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.12)] bg-[#121216] text-[#e8e6e0]"
                autoComplete="new-password"
              />
              {resetErrors.confirmPassword && <span className="text-[#ef4444] text-[0.74rem]">{resetErrors.confirmPassword}</span>}
            </label>
            <button
              type="submit"
              disabled={isResetSubmitting}
              className="w-full py-3 rounded-lg font-bold text-[0.9rem] border-none text-[#0c0c0e] bg-[#d97706] disabled:opacity-60"
            >
              {isResetSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </Modal>
    </main>
  );
}
