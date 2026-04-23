import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateLoginForm } from "../utils/validators";
import LoginForm from "../components/LoginForm";
import TwoFactorForm from "../components/TwoFactorForm";

export default function Login() {
  const { currentUser, login, completeTwoFactor, addToast } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [isVerifying2fa, setIsVerifying2fa] = useState(false);

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

  return (
    <main
      className="min-h-screen bg-base flex items-center justify-center p-8 font-body"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
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
        />
      )}
    </main>
  );
}
