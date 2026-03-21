import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateCourseForm } from "../utils/validators";

const CATEGORIES = ["Development", "Design", "Backend", "Data Science", "DevOps", "Marketing"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const blankForm = {
  title: "",
  category: "",
  level: "",
  instructorName: "",
  description: "",
  thumbnail: "",
  tags: "",
};

export default function CourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, addCourse, updateCourse, currentUser } = useAppContext();

  const isEdit = Boolean(courseId);
  const existing = isEdit ? courses.find((item) => item.id === courseId) : null;

  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        title: existing.title,
        category: existing.category,
        level: existing.level,
        instructorName: existing.instructorName,
        description: existing.description,
        thumbnail: existing.thumbnail || "",
        tags: existing.tags?.join(", ") || "",
      });
    }
  }, [isEdit, existing]);

  if (isEdit && !existing) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-stone-100">Course not found</h1>
        <Link to="/dashboard" className="mt-5 inline-block text-amber-500 hover:text-amber-400">Back to dashboard</Link>
      </div>
    );
  }

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { errors: nextErrors, isValid } = validateCourseForm(form);
    setErrors(nextErrors);
    if (!isValid) return;

    const tags = form.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (isEdit) {
      updateCourse({ ...existing, ...form, tags });
    } else {
      addCourse({
        id: `c-${Date.now()}`,
        ...form,
        tags,
        rating: 0,
        modules: [],
        instructorName: form.instructorName || currentUser?.name || "",
      });
    }

    navigate("/dashboard");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link to="/dashboard" className="text-sm text-amber-500 hover:text-amber-400">Back to dashboard</Link>
      <h1 className="font-display mt-3 text-4xl text-stone-100">{isEdit ? "Edit course" : "Create course"}</h1>
      <p className="mt-2 text-zinc-400">Provide core course details and save to local state.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <Field label="Course title" error={errors.title}>
          <input value={form.title} onChange={(e) => setField("title", e.target.value)} className={inputClass(errors.title)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" error={errors.category}>
            <select value={form.category} onChange={(e) => setField("category", e.target.value)} className={inputClass(errors.category)}>
              <option value="">Select category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </Field>
          <Field label="Level" error={errors.level}>
            <select value={form.level} onChange={(e) => setField("level", e.target.value)} className={inputClass(errors.level)}>
              <option value="">Select level</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Instructor" error={errors.instructorName}>
          <input value={form.instructorName} onChange={(e) => setField("instructorName", e.target.value)} className={inputClass(errors.instructorName)} />
        </Field>

        <Field label="Description" error={errors.description}>
          <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} className={`${inputClass(errors.description)} min-h-32`} />
        </Field>

        <Field label="Thumbnail URL" error={errors.thumbnail}>
          <input value={form.thumbnail} onChange={(e) => setField("thumbnail", e.target.value)} className={inputClass(errors.thumbnail)} />
        </Field>

        <Field label="Tags (comma separated)">
          <input value={form.tags} onChange={(e) => setField("tags", e.target.value)} className={inputClass(false)} />
        </Field>

        <div className="flex gap-3">
          <button type="submit" className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-500">
            {isEdit ? "Save changes" : "Publish course"}
          </button>
          <button type="button" onClick={() => navigate("/dashboard")} className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-zinc-200">
            Cancel
          </button>
        </div>
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
