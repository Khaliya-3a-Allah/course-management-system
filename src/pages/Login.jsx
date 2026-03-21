import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateLoginForm } from "../utils/validators";

export default function Login() {
  const navigate = useNavigate();
  const { users, setCurrentUser, currentUser } = useAppContext();

  const [form, setForm] = useState({ email: "", password: "" });
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
    const { errors: nextErrors, isValid } = validateLoginForm(form);
    setErrors(nextErrors);
    if (!isValid) return;

    const matchedUser = users.find(
      (user) => user.email.toLowerCase() === form.email.toLowerCase() && user.password === form.password
    );

    if (!matchedUser) {
      setAuthError("Incorrect email or password.");
      return;
    }

    setCurrentUser(matchedUser);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-7">
        <h1 className="font-display text-3xl text-stone-100">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-400">Sign in to continue learning.</p>

        {authError && <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{authError}</p>}

        <div className="mt-5 space-y-4">
          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputClass(errors.email)} />
          </Field>
          <Field label="Password" error={errors.password}>
            <input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} className={inputClass(errors.password)} />
          </Field>
        </div>

        <button type="submit" className="mt-5 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-500">
          Sign in
        </button>

        <p className="mt-4 text-center text-sm text-zinc-400">
          Need an account? <Link to="/register" className="text-amber-500 hover:text-amber-400">Register</Link>
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
