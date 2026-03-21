import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateRegisterForm } from "../utils/validators";

export default function Register() {
  const navigate = useNavigate();
  const { users, setUsers, setCurrentUser, currentUser } = useAppContext();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setAuthError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { errors: nextErrors, isValid } = validateRegisterForm(form);
    setErrors(nextErrors);
    if (!isValid) return;

    const exists = users.some((user) => user.email.toLowerCase() === form.email.toLowerCase());
    if (exists) {
      setAuthError("An account with this email already exists.");
      return;
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      createdCourseIds: [],
      enrolledCourseIds: [],
      savedCourseIds: [],
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-7">
        <h1 className="font-display text-3xl text-stone-100">Create account</h1>
        <p className="mt-1 text-sm text-zinc-400">Register to save and enroll in courses.</p>

        {authError && <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{authError}</p>}

        <div className="mt-5 space-y-4">
          <Field label="Name" error={errors.name}>
            <input value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass(errors.name)} />
          </Field>

          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputClass(errors.email)} />
          </Field>

          <Field label="Password" error={errors.password}>
            <input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} className={inputClass(errors.password)} />
          </Field>

          <Field label="Confirm password" error={errors.confirmPassword}>
            <input type="password" value={form.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} className={inputClass(errors.confirmPassword)} />
          </Field>

          <Field label="Role" error={errors.role}>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["student", "Student"],
                ["instructor", "Instructor"],
              ].map(([roleValue, label]) => (
                <button
                  key={roleValue}
                  type="button"
                  onClick={() => setField("role", roleValue)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                    form.role === roleValue
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                      : "border-white/10 text-zinc-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <button type="submit" className="mt-5 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-500">
          Create account
        </button>

        <p className="mt-4 text-center text-sm text-zinc-400">
          Already registered? <Link to="/login" className="text-amber-500 hover:text-amber-400">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-zinc-200">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function inputClass(hasError) {
  return `w-full rounded-lg border bg-zinc-950 px-3 py-2.5 text-sm text-stone-200 outline-none transition ${
    hasError ? "border-rose-500/60" : "border-white/10 focus:border-amber-500/60"
  }`;
}
