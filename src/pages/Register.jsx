import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateRegisterForm, sanitizeInput } from "../utils/validators";
import { INTERESTS } from "../data/constants";
import { EyeIcon, EyeOffIcon } from "../components/Icons";
import FormField, { INPUT_CLASS, buildInputBorder } from "../components/FormField";
import AutocompleteSelect from "../components/AutocompleteSelect";
import Modal from "../components/Modal";
import TermsContent from "../components/TermsContent";

export default function Register() {
  const { users, setUsers, setCurrentUser, currentUser, addToast } = useAppContext();
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

  function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const { errors: validationErrors, isValid } = validateRegisterForm(form);
    setErrors(validationErrors);
    if (!isValid) return;

    const emailAlreadyExists = users.some(
      (user) => user.email.toLowerCase() === form.email.toLowerCase()
    );
    if (emailAlreadyExists) {
      setAuthError("An account with this email already exists.");
      return;
    }

    setIsSubmitting(true);

    try {
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
    } finally {
      setIsSubmitting(false);
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
      <article
        className="w-full max-w-[440px] bg-surface rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        aria-label="Registration form"
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #d97706, #f59e0b)" }} aria-hidden="true" />

        <div className="p-9">
          <h1 className="font-heading text-[1.75rem] text-text-primary mb-1">Create account.</h1>
          <p className="text-text-dim text-sm mb-7">Start learning today — it&apos;s free.</p>

          {authError && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-lg px-4 py-3 text-sm mb-5"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-label="Create account">
            <FormField label="Full Name" error={errors.name}>
              <input
                id="register-name"
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Alex Jordan"
                className={INPUT_CLASS}
                style={buildInputBorder(errors.name)}
                autoComplete="name"
                maxLength={50}
                aria-required="true"
                aria-invalid={!!errors.name}
              />
            </FormField>

            <FormField label="Email" error={errors.email}>
              <input
                id="register-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="you@example.com"
                className={INPUT_CLASS}
                style={buildInputBorder(errors.email)}
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!errors.email}
              />
            </FormField>

            <FormField label="Password" error={errors.password} hint="Minimum 6 characters">
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Enter your password"
                  className={`${INPUT_CLASS} pr-12`}
                  style={buildInputBorder(errors.password)}
                  autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer leading-none p-1 text-text-dim hover:text-text-primary transition-colors flex items-center justify-center rounded"
                >
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword}>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Re-enter your password"
                  className={`${INPUT_CLASS} pr-12`}
                  style={buildInputBorder(errors.confirmPassword)}
                  autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer leading-none p-1 text-text-dim hover:text-text-primary transition-colors flex items-center justify-center rounded"
                >
                  {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </FormField>

            {/* Role Selection */}
            <FormField label="I am a..." error={errors.role}>
              <div className="flex gap-3" role="group" aria-label="Select your role">
                {["student", "instructor"].map((roleOption) => {
                  const isSelected = form.role === roleOption;
                  const roleLabel = roleOption.charAt(0).toUpperCase() + roleOption.slice(1);
                  return (
                    <button
                      key={roleOption}
                      type="button"
                      onClick={() => handleRoleChange(roleOption)}
                      aria-pressed={isSelected}
                      className="flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-lg cursor-pointer font-body text-[0.85rem] transition-all"
                      style={{
                        backgroundColor: isSelected ? "rgba(217,119,6,0.08)" : "#0c0c0e",
                        border: `1px solid ${isSelected ? "rgba(217,119,6,0.5)" : "rgba(255,255,255,0.08)"}`,
                        color: isSelected ? "#d97706" : "#6b7280",
                      }}
                    >
                      <span className="font-semibold text-[0.82rem]">{roleLabel}</span>
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
                className={INPUT_CLASS}
                style={buildInputBorder(errors.phone)}
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
                className={INPUT_CLASS}
                style={{ ...buildInputBorder(errors.bio), resize: "vertical", minHeight: "80px" }}
              />
            </FormField>

            {/* Student: Interests */}
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

            {/* Instructor: Expertise + Website */}
            {form.role === "instructor" && (
              <>
                <FormField label="Area of Expertise" error={errors.expertise} hint="Optional">
                  <input
                    id="register-expertise"
                    type="text"
                    value={form.expertise}
                    onChange={(e) => updateField("expertise", e.target.value)}
                    placeholder="e.g., Full-Stack Development"
                    className={INPUT_CLASS}
                    style={buildInputBorder(errors.expertise)}
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
                    className={INPUT_CLASS}
                    style={buildInputBorder(errors.website)}
                    autoComplete="url"
                  />
                </FormField>
              </>
            )}

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2.5 mt-1">
              <input
                id="register-terms"
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) => updateField("acceptTerms", e.target.checked)}
                className="w-[18px] h-[18px] mt-0.5 cursor-pointer shrink-0"
                style={{ accentColor: "#d97706" }}
              />
              <label htmlFor="register-terms" className="text-[0.83rem] text-text-muted leading-snug">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="bg-transparent border-none text-brand cursor-pointer font-semibold text-[0.83rem] font-body p-0 underline"
                >
                  Terms &amp; Conditions
                </button>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-[0.77rem] text-red-400 m-0" role="alert">{errors.acceptTerms}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full py-3.5 rounded-lg font-bold text-[0.93rem] font-body transition-opacity hover:opacity-90 active:opacity-80 border-none bg-brand text-base"
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-text-dim mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold no-underline text-brand">Sign in</Link>
          </p>
        </div>
      </article>

      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms & Conditions"
      >
        <TermsContent />
      </Modal>
    </main>
  );
}
