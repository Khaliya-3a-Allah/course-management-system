import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateLoginForm } from "../utils/validators";
import { generateVerificationCode } from "../utils/codeGenerator";
import LoginForm from "../components/LoginForm";
import TwoFactorForm from "../components/TwoFactorForm";

export default function Login() {
  const { users, setCurrentUser, currentUser, addToast } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  // 2FA state
  const [pendingUser, setPendingUser] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");

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

  function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const { errors: validationErrors, isValid } = validateLoginForm(form);
    setErrors(validationErrors);
    if (!isValid) return;

    setIsSubmitting(true);

    const matchedUser = users.find(
      (user) =>
        user.email.toLowerCase() === form.email.toLowerCase() &&
        user.password === form.password
    );

    if (!matchedUser) {
      setAuthError("Incorrect email or password. Try alex@example.com / password123");
      setIsSubmitting(false);
      return;
    }

    // Credentials valid — enter 2FA step
    const code = generateVerificationCode();
    setPendingUser(matchedUser);
    setVerificationCode(code);
    setIsSubmitting(false);
    addToast(`Your verification code is: ${code}`, "info");
  }

  function handleVerified() {
    setCurrentUser(pendingUser);
    addToast(`Welcome back, ${pendingUser.name}!`, "success");
    navigate("/dashboard");
  }

  function handleResendCode() {
    const newCode = generateVerificationCode();
    setVerificationCode(newCode);
    addToast(`New verification code: ${newCode}`, "info");
  }

  function handleBackToLogin(errorMessage) {
    setPendingUser(null);
    setVerificationCode("");
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
      {pendingUser ? (
        <TwoFactorForm
          userEmail={pendingUser.email}
          verificationCode={verificationCode}
          onVerified={handleVerified}
          onResendCode={handleResendCode}
          onBack={handleBackToLogin}
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
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0c0c0e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    fontFamily: "'DM Sans', sans-serif",
  },
};
