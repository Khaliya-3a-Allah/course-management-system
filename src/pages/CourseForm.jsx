import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateCourseForm, validateModules, sanitizeInput } from "../utils/validators";
import { INTERESTS, LEVELS } from "../data/constants";
import FormField, { INPUT_CLASS, buildInputBorder } from "../components/FormField";
import AutocompleteInput from "../components/AutocompleteInput";
import CurriculumBuilder from "../components/curriculum/CurriculumBuilder";

const emptyForm = {
  title: "", category: "", level: "",
  description: "", thumbnail: "", tags: "",
};

export default function CourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, addCourse, updateCourse, currentUser } = useAppContext();

  const isEdit = Boolean(courseId);
  const existing = isEdit ? courses.find((c) => c.id === courseId) : null;

  const [form, setForm] = useState(emptyForm);
  const [modules, setModules] = useState([]);
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
        description: existing.description || "",
        thumbnail: existing.thumbnail || "",
        tags: existing.tags?.join(", ") || "",
      });
      setModules(
        (existing.modules || []).map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((les) => ({ ...les })),
        }))
      );
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

  const handleModulesChange = (newModules) => {
    setModules(newModules);
    if (errors.modules) {
      setErrors((prev) => {
        const { modules: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    const { errors: formErrs, isValid: formValid } = validateCourseForm(form);
    const { errors: modErrs, isValid: modsValid } = validateModules(modules);

    const allErrors = { ...formErrs };
    if (Object.keys(modErrs).length > 0) {
      allErrors.modules = modErrs;
    }

    setErrors(allErrors);
    if (!formValid || !modsValid) return;

    const sanitizedForm = {
      title: sanitizeInput(form.title),
      category: form.category,
      level: form.level,
      description: sanitizeInput(form.description),
      thumbnail: form.thumbnail.trim(),
      tags: form.tags,
    };
    const tagsArr = sanitizedForm.tags.split(",").map((t) => sanitizeInput(t)).filter(Boolean);
    const newCourseId = isEdit ? existing.id : `c-${Date.now()}`;

    const finalModules = modules.map((mod) => ({
      ...mod,
      title: sanitizeInput(mod.title),
      courseId: newCourseId,
      lessons: mod.lessons.map((les) => ({
        ...les,
        title: sanitizeInput(les.title),
        contentPreview: sanitizeInput(les.contentPreview),
        moduleId: mod.id,
      })),
    }));

    if (isEdit) {
      updateCourse({
        ...existing,
        ...sanitizedForm,
        tags: tagsArr,
        modules: finalModules,
      });
    } else {
      addCourse({
        id: newCourseId,
        ...sanitizedForm,
        tags: tagsArr,
        rating: 0,
        modules: finalModules,
        instructorName: currentUser?.name || "Unknown",
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
          <FormField label="Course Title *" htmlFor="f-title" error={errors.title}>
            <input
              id="f-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. React from Zero to Hero"
              aria-required="true"
              aria-invalid={!!errors.title}
              className={INPUT_CLASS}
              style={buildInputBorder(errors.title)}
            />
          </FormField>

          {/* Category */}
          <FormField label="Category *" error={errors.category}>
            <AutocompleteInput
              options={INTERESTS}
              value={form.category}
              onChange={(val) => set("category", val)}
              placeholder="Type to search categories..."
              label="Select category"
              error={errors.category}
            />
          </FormField>

          {/* Level */}
          <FormField label="Level *" htmlFor="f-level" error={errors.level}>
            <select
              id="f-level"
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.level}
              className={`${INPUT_CLASS} cursor-pointer`}
              style={buildInputBorder(errors.level)}
            >
              <option value="">Select level</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </FormField>

          {/* Description */}
          <FormField label="Description *" htmlFor="f-desc" error={errors.description}>
            <textarea
              id="f-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe what students will learn..."
              aria-required="true"
              aria-invalid={!!errors.description}
              rows={5}
              className={`${INPUT_CLASS} resize-y`}
              style={{ ...buildInputBorder(errors.description), minHeight: "120px" }}
            />
          </FormField>

          {/* Thumbnail */}
          <FormField label="Thumbnail URL" htmlFor="f-thumb" hint="Optional — paste a direct image URL" error={errors.thumbnail}>
            <input
              id="f-thumb"
              value={form.thumbnail}
              onChange={(e) => set("thumbnail", e.target.value)}
              placeholder="https://example.com/image.jpg"
              aria-invalid={!!errors.thumbnail}
              className={INPUT_CLASS}
              style={buildInputBorder(errors.thumbnail)}
            />
          </FormField>

          {/* Tags */}
          <FormField label="Tags" htmlFor="f-tags" hint="Comma-separated, e.g. React, JavaScript, Frontend">
            <input
              id="f-tags"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="React, JavaScript, Frontend"
              className={INPUT_CLASS}
              style={buildInputBorder(false)}
            />
          </FormField>

          {/* Curriculum */}
          <CurriculumBuilder
            modules={modules}
            onModulesChange={handleModulesChange}
            errors={errors.modules || {}}
          />

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
