import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateCourseForm } from "../utils/validators";

const CATEGORIES = ["Development", "Design", "Backend", "Data Science", "DevOps", "Marketing"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const emptyForm = {
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
      <div style={styles.notFound}>
        <h2 style={styles.nfTitle}>Course Not Found</h2>
        <Link to="/dashboard" style={styles.nfLink}>← Back to Dashboard</Link>
      </div>
    );
  }

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = () => {
    const { errors: errs, isValid } = validateCourseForm(form);
    setErrors(errs);
    if (!isValid) return;

    const tagsArr = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

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
    <div
      style={{
        ...styles.page,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div style={styles.container}>
        {/* Back */}
        <Link to="/dashboard" style={styles.back}>← Back to Dashboard</Link>

        <h1 style={styles.pageTitle}>
          {isEdit ? "Edit Course" : "Create New Course"}
        </h1>
        <p style={styles.pageSub}>
          {isEdit ? "Update your course details below." : "Fill in the details to publish a new course."}
        </p>

        {submitted && (
          <div style={styles.successBanner} role="status">
            ✓ Course {isEdit ? "updated" : "created"} successfully! Redirecting…
          </div>
        )}

        <div style={styles.form}>
          {/* Title */}
          <Field label="Course Title *" error={errors.title}>
            <input
              style={inputStyle(errors.title)}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. React from Zero to Hero"
              aria-label="Course title"
              aria-describedby={errors.title ? "title-err" : undefined}
            />
          </Field>

          {/* Category + Level row */}
          <div style={styles.row}>
            <Field label="Category *" error={errors.category}>
              <select
                style={inputStyle(errors.category)}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                aria-label="Category"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Level *" error={errors.level}>
              <select
                style={inputStyle(errors.level)}
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
                aria-label="Level"
              >
                <option value="">Select level</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
          </div>

          {/* Instructor */}
          <Field label="Instructor Name *" error={errors.instructorName}>
            <input
              style={inputStyle(errors.instructorName)}
              value={form.instructorName}
              onChange={(e) => set("instructorName", e.target.value)}
              placeholder="e.g. Sarah Chen"
              aria-label="Instructor name"
            />
          </Field>

          {/* Description */}
          <Field label="Description *" error={errors.description}>
            <textarea
              style={{ ...inputStyle(errors.description), minHeight: "120px", resize: "vertical" }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe what students will learn..."
              aria-label="Course description"
            />
          </Field>

          {/* Thumbnail */}
          <Field label="Thumbnail URL" error={errors.thumbnail} hint="Optional — paste a direct image URL">
            <input
              style={inputStyle(errors.thumbnail)}
              value={form.thumbnail}
              onChange={(e) => set("thumbnail", e.target.value)}
              placeholder="https://example.com/image.jpg"
              aria-label="Thumbnail URL"
            />
          </Field>

          {/* Tags */}
          <Field label="Tags" hint="Comma-separated, e.g. React, JavaScript, Frontend">
            <input
              style={inputStyle(false)}
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="React, JavaScript, Frontend"
              aria-label="Tags"
            />
          </Field>

          {/* Actions */}
          <div style={styles.actions}>
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={submitted}>
              {submitted ? "Saving…" : isEdit ? "Save Changes" : "Publish Course"}
            </button>
            <button onClick={() => navigate("/dashboard")} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {hint && <p style={styles.hint}>{hint}</p>}
      {children}
      {error && <p style={styles.errorText} role="alert">{error}</p>}
    </div>
  );
}

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "0.75rem 1rem",
  backgroundColor: "#111114",
  border: `1px solid ${hasError ? "#ef4444" : "rgba(255,255,255,0.09)"}`,
  borderRadius: "8px",
  color: "#e8e6e0",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.92rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
});

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0c0c0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif", paddingBottom: "4rem" },
  container: { maxWidth: "680px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  back: { color: "#d97706", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, display: "inline-block", marginBottom: "1.5rem" },
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#f5f2ec", margin: "0 0 0.4rem" },
  pageSub: { color: "#6b7280", fontSize: "0.92rem", marginBottom: "2rem" },
  successBanner: { backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", padding: "0.85rem 1.25rem", color: "#22c55e", fontSize: "0.9rem", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#d1cfc8", letterSpacing: "0.03em" },
  hint: { fontSize: "0.75rem", color: "#4b5563", margin: "0 0 0.2rem" },
  errorText: { fontSize: "0.78rem", color: "#ef4444", margin: 0 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  actions: { display: "flex", gap: "0.75rem", marginTop: "0.5rem" },
  submitBtn: { padding: "0.85rem 2rem", backgroundColor: "#d97706", color: "#0c0c0e", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.2s" },
  cancelBtn: { padding: "0.85rem 1.5rem", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem", cursor: "pointer" },
  notFound: { minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#0c0c0e", gap: "1rem" },
  nfTitle: { fontFamily: "'Playfair Display', serif", color: "#f5f2ec", fontSize: "1.5rem" },
  nfLink: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
};
