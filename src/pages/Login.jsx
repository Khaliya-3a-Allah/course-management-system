import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateLoginForm } from "../utils/validators";
import { describeLoginError, describeTwoFactorError } from "../utils/authErrors";
import LoginForm from "../components/LoginForm";
import TwoFactorForm from "../components/TwoFactorForm";

export default function Login() {
  const { login, completeTwoFactor, currentUser, addToast } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  const [challenge, setChallenge] = useState(null);

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

    try {
      const result = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (result.twoFactorRequired) {
        setChallenge({
          token: result.challengeToken,
          email: result.email,
        });
        return;
      }

      addToast(`Welcome back, ${result.user.name}!`, "success");
      navigate("/dashboard");
    } catch (error) {
      setAuthError(describeLoginError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTwoFactorSubmit(code) {
    try {
      const result = await completeTwoFactor({
        challengeToken: challenge.token,
        code,
      });
      addToast(`Welcome back, ${result.user.name}!`, "success");
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      return { success: false, message: describeTwoFactorError(error) };
    }
  }

  function handleBackToLogin(errorMessage) {
    setChallenge(null);
    if (errorMessage) {
      addToast(errorMessage, "error");
    }
  }

  return (
    <div
      style={{
        ...styles.page,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {challenge ? (
        <TwoFactorForm
          userEmail={challenge.email}
          onSubmitCode={handleTwoFactorSubmit}
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
