import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateCourseForm } from "../utils/validators";
import { CATEGORIES, LEVELS } from "../data/constants";

const emptyForm = {
  title: "", category: "", level: "",
  instructorName: "", description: "", thumbnail: "", tags: "",
};

export default function CourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, addCourse, updateCourse, currentUser } = useAppContext();

  const isEdit = Boolean(courseId);
  const existing = isEdit ? courses.find((c) => c.id === courseId) : null;

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        title: existing.title || "",
        category: existing.category || "",
        level: existing.level || "",
        instructorName: existing.instructorName || "",
        description: existing.description || "",
        thumbnail: existing.thumbnail || "",
        tags: existing.tags?.join(", ") || "",
      });
    }
  }, [isEdit, existing]);

  if (isEdit && !existing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-base gap-4">
        <h2 className="font-heading text-[1.5rem] text-text-primary">Course Not Found</h2>
        <Link to="/dashboard" className="no-underline font-semibold" style={{ color: "#d97706" }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const { errors: errs, isValid } = validateCourseForm(form);
    setErrors(errs);
    if (!isValid) return;

    const tagsArr = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    if (isEdit) {
      updateCourse({ ...existing, ...form, tags: tagsArr });
    } else {
      addCourse({
        id: `c-${Date.now()}`,
        ...form,
        tags: tagsArr,
        rating: 0,
        modules: [],
        instructorName: form.instructorName || currentUser?.name || "",
      });
    }

    setSubmitted(true);
    setTimeout(() => navigate("/dashboard"), 1200);
  };

  return (
    <main
      className="min-h-screen bg-base text-[#e8e6e0] font-body pb-16"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div className="max-w-[680px] mx-auto px-6 pt-10">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="no-underline text-[0.85rem] font-semibold inline-block mb-6"
          style={{ color: "#d97706" }}
        >
          ← Back to Dashboard
        </Link>

        <h1 className="font-heading text-[2rem] text-text-primary mb-1">
          {isEdit ? "Edit Course" : "Create New Course"}
        </h1>
        <p className="text-text-dim text-[0.92rem] mb-8">
          {isEdit ? "Update your course details below." : "Fill in the details to publish a new course."}
        </p>

        {/* Success banner */}
        {submitted && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg px-5 py-3.5 text-[0.9rem] mb-6 border"
            style={{
              backgroundColor: "rgba(34,197,94,0.1)",
              borderColor: "rgba(34,197,94,0.3)",
              color: "#22c55e",
            }}
          >
            ✓ Course {isEdit ? "updated" : "created"} successfully! Redirecting…
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5" aria-label={isEdit ? "Edit course" : "Create course"}>

          {/* Title */}
          <Field label="Course Title *" htmlFor="f-title" error={errors.title}>
            <input
              id="f-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. React from Zero to Hero"
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-err" : undefined}
              className="w-full px-4 py-3 rounded-lg text-[0.92rem] text-[#e8e6e0] outline-none border transition-colors"
              style={{
                backgroundColor: "#111114",
                borderColor: errors.title ? "#ef4444" : "rgba(255,255,255,0.09)",
              }}
            />
            {errors.title && <p id="title-err" role="alert" className="text-[0.78rem] text-red-400 m-0">{errors.title}</p>}
          </Field>

          {/* Category + Level row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category *" htmlFor="f-category" error={errors.category}>
              <select
                id="f-category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.category}
                className="w-full px-4 py-3 rounded-lg text-[0.92rem] text-[#e8e6e0] outline-none border transition-colors cursor-pointer"
                style={{
                  backgroundColor: "#111114",
                  borderColor: errors.category ? "#ef4444" : "rgba(255,255,255,0.09)",
                }}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p role="alert" className="text-[0.78rem] text-red-400 m-0">{errors.category}</p>}
            </Field>

            <Field label="Level *" htmlFor="f-level" error={errors.level}>
              <select
                id="f-level"
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.level}
                className="w-full px-4 py-3 rounded-lg text-[0.92rem] text-[#e8e6e0] outline-none border transition-colors cursor-pointer"
                style={{
                  backgroundColor: "#111114",
                  borderColor: errors.level ? "#ef4444" : "rgba(255,255,255,0.09)",
                }}
              >
                <option value="">Select level</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.level && <p role="alert" className="text-[0.78rem] text-red-400 m-0">{errors.level}</p>}
            </Field>
          </div>

          {/* Instructor */}
          <Field label="Instructor Name *" htmlFor="f-instructor" error={errors.instructorName}>
            <input
              id="f-instructor"
              value={form.instructorName}
              onChange={(e) => set("instructorName", e.target.value)}
              placeholder="e.g. Sarah Chen"
              aria-required="true"
              aria-invalid={!!errors.instructorName}
              className="w-full px-4 py-3 rounded-lg text-[0.92rem] text-[#e8e6e0] outline-none border transition-colors"
              style={{
                backgroundColor: "#111114",
                borderColor: errors.instructorName ? "#ef4444" : "rgba(255,255,255,0.09)",
              }}
            />
            {errors.instructorName && <p role="alert" className="text-[0.78rem] text-red-400 m-0">{errors.instructorName}</p>}
          </Field>

          {/* Description */}
          <Field label="Description *" htmlFor="f-desc" error={errors.description}>
            <textarea
              id="f-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe what students will learn..."
              aria-required="true"
              aria-invalid={!!errors.description}
              rows={5}
              className="w-full px-4 py-3 rounded-lg text-[0.92rem] text-[#e8e6e0] outline-none border transition-colors resize-y"
              style={{
                backgroundColor: "#111114",
                borderColor: errors.description ? "#ef4444" : "rgba(255,255,255,0.09)",
                minHeight: "120px",
              }}
            />
            {errors.description && <p role="alert" className="text-[0.78rem] text-red-400 m-0">{errors.description}</p>}
          </Field>

          {/* Thumbnail */}
          <Field label="Thumbnail URL" htmlFor="f-thumb" hint="Optional — paste a direct image URL" error={errors.thumbnail}>
            <input
              id="f-thumb"
              value={form.thumbnail}
              onChange={(e) => set("thumbnail", e.target.value)}
              placeholder="https://example.com/image.jpg"
              aria-invalid={!!errors.thumbnail}
              className="w-full px-4 py-3 rounded-lg text-[0.92rem] text-[#e8e6e0] outline-none border transition-colors"
              style={{
                backgroundColor: "#111114",
                borderColor: errors.thumbnail ? "#ef4444" : "rgba(255,255,255,0.09)",
              }}
            />
            {errors.thumbnail && <p role="alert" className="text-[0.78rem] text-red-400 m-0">{errors.thumbnail}</p>}
          </Field>

          {/* Tags */}
          <Field label="Tags" htmlFor="f-tags" hint="Comma-separated, e.g. React, JavaScript, Frontend">
            <input
              id="f-tags"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="React, JavaScript, Frontend"
              className="w-full px-4 py-3 rounded-lg text-[0.92rem] text-[#e8e6e0] outline-none border transition-colors"
              style={{
                backgroundColor: "#111114",
                borderColor: "rgba(255,255,255,0.09)",
              }}
            />
          </Field>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={submitted}
              className="px-8 py-3.5 rounded-lg font-bold text-[0.92rem] cursor-pointer border-none transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "#d97706", color: "#0c0c0e" }}
            >
              {submitted ? "Saving…" : isEdit ? "Save Changes" : "Publish Course"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3.5 rounded-lg text-[0.92rem] cursor-pointer border text-text-muted"
              style={{ backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.1)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[0.82rem] font-semibold text-text-secondary tracking-wide"
      >
        {label}
      </label>
      {hint && <p className="text-[0.75rem] text-text-faint m-0">{hint}</p>}
      {children}
    </div>
  );
}