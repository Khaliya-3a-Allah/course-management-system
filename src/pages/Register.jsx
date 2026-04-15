import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
<<<<<<< Updated upstream
import { validateRegisterForm, sanitizeInput } from "../utils/validators";
import { CATEGORIES, INTERESTS } from "../data/constants";
=======
import { validateRegisterForm, getPasswordStrength } from "../utils/validators";
import { INTERESTS } from "../data/constants";
>>>>>>> Stashed changes
import { EyeIcon, EyeOffIcon } from "../components/Icons";
import FormField, { buildInputStyle } from "../components/FormField";
import AutocompleteSelect from "../components/AutocompleteSelect";
import Modal from "../components/Modal";
import TermsContent from "../components/TermsContent";

export default function Register() {
  const { register, currentUser, addToast } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    phone: "",
    bio: "",
    interests: [],
    expertise: "",
    website: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  function handleRoleChange(newRole) {
    setForm((prev) => ({
      ...prev,
      role: newRole,
      interests: [],
      expertise: "",
      website: "",
    }));
    setErrors((prev) => ({ ...prev, role: "", expertise: "", website: "" }));
    setAuthError("");
  }

  function scrollToFirstError(validationErrors) {
    formRootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const fieldOrder = [
      "name",
      "email",
      "password",
      "confirmPassword",
      "role",
      "phone",
      "bio",
      "expertise",
      "website",
      "acceptTerms",
    ];
    const firstInvalid = fieldOrder.find((key) => validationErrors[key]);
    const elementMap = {
      name: "register-name",
      email: "register-email",
      password: "register-password",
      confirmPassword: "register-confirm-password",
      phone: "register-phone",
      bio: "register-bio",
      expertise: "register-expertise",
      website: "register-website",
      acceptTerms: "register-terms",
    };

    if (firstInvalid === "role") {
      const roleButtons = document.querySelectorAll("button[aria-pressed]");
      roleButtons[0]?.focus();
    } else if (firstInvalid && elementMap[firstInvalid]) {
      const target = document.getElementById(elementMap[firstInvalid]);
      target?.focus();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const { errors: validationErrors, isValid } = validateRegisterForm(form);
    setErrors(validationErrors);
<<<<<<< Updated upstream
    if (!isValid) return;

    const emailAlreadyExists = users.some(
      (user) => user.email.toLowerCase() === form.email.toLowerCase()
    );
    if (emailAlreadyExists) {
      setAuthError("An account with this email already exists.");
=======
    if (!isValid) {
      scrollToFirstError(validationErrors);
>>>>>>> Stashed changes
      return;
    }

    setIsSubmitting(true);
    try {
<<<<<<< Updated upstream
    const baseUser = {
      id: `u-${Date.now()}`,
      name: sanitizeInput(form.name),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      phone: sanitizeInput(form.phone),
      bio: sanitizeInput(form.bio),
      createdCourseIds: [],
      enrolledCourseIds: [],
      savedCourseIds: [],
    };

    const newUser =
      form.role === "student"
        ? { ...baseUser, interests: form.interests.filter((i) => INTERESTS.includes(i)) }
        : {
            ...baseUser,
            expertise: sanitizeInput(form.expertise),
            website: form.website.trim(),
          };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast("Account created successfully!", "success");
    navigate("/dashboard");
=======
      await register(form);
      addToast("Account created successfully!", "success");
      navigate("/dashboard");
    } catch (error) {
      setAuthError(describeRegisterError(error));
>>>>>>> Stashed changes
    } finally {
      setIsSubmitting(false);
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
      <div style={styles.card}>
        <div style={styles.cardAccent} />
        <div style={styles.cardInner}>
          <h1 style={styles.title}>Create account.</h1>
          <p style={styles.subtitle}>Start learning today — it's free.</p>

          {authError && (
            <div style={styles.authError} role="alert">{authError}</div>
          )}

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            <FormField label="Full Name" error={errors.name}>
              <input
                id="register-name"
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Alex Jordan"
                style={buildInputStyle(errors.name)}
                autoComplete="name"
                maxLength={50}
              />
            </FormField>

            <FormField label="Email" error={errors.email}>
              <input
                id="register-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="you@example.com"
                style={buildInputStyle(errors.email)}
                autoComplete="email"
              />
            </FormField>

            <FormField label="Password" error={errors.password} hint="Minimum 6 characters">
              <div style={styles.passwordWrapper}>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Enter your password"
                  style={{ ...buildInputStyle(errors.password), paddingRight: "3rem" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={styles.eyeButton}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword}>
              <div style={styles.passwordWrapper}>
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Re-enter your password"
                  style={{ ...buildInputStyle(errors.confirmPassword), paddingRight: "3rem" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  style={styles.eyeButton}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </FormField>

            <FormField label="I am a..." error={errors.role}>
              <div style={styles.roleRow} role="group" aria-label="Select role">
                {["student", "instructor"].map((roleOption) => {
                  const isSelected = form.role === roleOption;
                  const label = roleOption.charAt(0).toUpperCase() + roleOption.slice(1);
                  const emoji = roleOption === "student" ? "\uD83D\uDCDA" : "\uD83C\uDF93";
                  return (
                    <button
                      key={roleOption}
                      type="button"
                      onClick={() => handleRoleChange(roleOption)}
                      style={isSelected ? { ...styles.roleButton, ...styles.roleButtonActive } : styles.roleButton}
                      aria-pressed={isSelected}
                    >
                      <span>{emoji}</span>
                      <span style={styles.roleButtonLabel}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </FormField>

            <FormField label="Phone Number" error={errors.phone} hint="Optional">
              <input
                id="register-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+961 71 123 456"
                style={buildInputStyle(errors.phone)}
                autoComplete="tel"
              />
            </FormField>

            <FormField label="About Me" error={errors.bio} hint="Optional — max 300 characters">
              <textarea
                id="register-bio"
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                maxLength={300}
                style={{ ...buildInputStyle(errors.bio), resize: "vertical", minHeight: "80px" }}
              />
            </FormField>

            {form.role === "student" && (
              <FormField label="Interests" hint="Optional — select up to 10 topics">
                <AutocompleteSelect
                  options={INTERESTS}
                  selected={form.interests}
                  onChange={(updated) => updateField("interests", updated)}
                  placeholder="Type to search interests..."
                  maxSelections={10}
                  label="Select interests"
                />
              </FormField>
            )}

            {form.role === "instructor" && (
              <>
                <FormField label="Area of Expertise" error={errors.expertise} hint="Optional">
                  <input
                    id="register-expertise"
                    type="text"
                    value={form.expertise}
                    onChange={(e) => updateField("expertise", e.target.value)}
                    placeholder="e.g., Full-Stack Development"
                    style={buildInputStyle(errors.expertise)}
                    maxLength={100}
                  />
                </FormField>
                <FormField label="Portfolio / Website" error={errors.website} hint="Optional">
                  <input
                    id="register-website"
                    type="url"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://yoursite.com"
                    style={buildInputStyle(errors.website)}
                    autoComplete="url"
                  />
                </FormField>
              </>
            )}

<<<<<<< Updated upstream
            {/* Terms & Conditions */}
            <div style={styles.termsRow}>
=======
            <div className="flex items-start gap-2.5 mt-1">
>>>>>>> Stashed changes
              <input
                id="register-terms"
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) => updateField("acceptTerms", e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="register-terms" style={styles.termsLabel}>
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  style={styles.termsLink}
                >
                  Terms &amp; Conditions
                </button>
              </label>
            </div>
            {errors.acceptTerms && (
              <p style={styles.errorText} role="alert">{errors.acceptTerms}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>

      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms & Conditions"
      >
        <TermsContent />
      </Modal>

      <style>{focusStyles}</style>
    </div>
  );
}

<<<<<<< Updated upstream
const focusStyles = `
  #register-name:focus,
  #register-email:focus,
  #register-password:focus,
  #register-confirm-password:focus,
  #register-phone:focus,
  #register-bio:focus,
  #register-expertise:focus,
  #register-website:focus {
    border-color: rgba(217, 119, 6, 0.5) !important;
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
  }
`;

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
  card: {
    width: "100%",
    maxWidth: "440px",
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
  subtitle: { color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.75rem" },
  authError: {
    backgroundColor: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    color: "#f87171",
    fontSize: "0.85rem",
    marginBottom: "1.25rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  passwordWrapper: { position: "relative" },
  eyeButton: {
    position: "absolute",
    right: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    lineHeight: 1,
    padding: "0.3rem",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    transition: "color 0.15s",
  },
  roleRow: { display: "flex", gap: "0.75rem" },
  roleButton: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.85rem",
    backgroundColor: "#0c0c0e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.85rem",
    color: "#6b7280",
    transition: "all 0.15s",
  },
  roleButtonActive: {
    borderColor: "rgba(217,119,6,0.5)",
    backgroundColor: "rgba(217,119,6,0.08)",
    color: "#d97706",
  },
  roleButtonLabel: { fontWeight: 600, fontSize: "0.82rem" },
  termsRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    marginTop: "0.25rem",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "#d97706",
    marginTop: "2px",
    cursor: "pointer",
    flexShrink: 0,
  },
  termsLabel: { fontSize: "0.83rem", color: "#9ca3af", lineHeight: 1.4 },
  termsLink: {
    background: "none",
    border: "none",
    color: "#d97706",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.83rem",
    fontFamily: "'DM Sans', sans-serif",
    padding: 0,
    textDecoration: "underline",
  },
  errorText: { fontSize: "0.77rem", color: "#ef4444", margin: 0 },
  submitButton: {
    padding: "0.85rem",
    backgroundColor: "#d97706",
    color: "#0c0c0e",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "0.93rem",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "0.25rem",
    transition: "opacity 0.2s, transform 0.1s",
  },
  switchText: {
    textAlign: "center",
    fontSize: "0.85rem",
    color: "#6b7280",
    marginTop: "1.5rem",
  },
  switchLink: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
};
=======
function describeRegisterError(error) {
  if (error?.status === 0) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (error?.status === 409) {
    return "An account with this email already exists.";
  }
  if (error?.status === 400) {
    return error.message || "Please correct the highlighted fields and try again.";
  }
  if (error?.status >= 500) {
    return "The server is having trouble right now. Please try again in a moment.";
  }
  return error?.message || "Sign-up failed. Please try again.";
}
>>>>>>> Stashed changes
