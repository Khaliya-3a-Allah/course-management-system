import FormField, { INPUT_CLASS, buildInputBorder } from "../FormField";
import LessonEditor from "./LessonEditor";
import { useState } from "react";

/**
 * Renders a single module's title input and its list of lessons.
 * Provides add/remove controls for lessons within the module.
 */
export default function ModuleEditor({ module, moduleIndex, onUpdate, onRemove, errors = {} }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTitleChange = (value) => {
    onUpdate({ ...module, title: value });
  };

  const handleAddLesson = () => {
    const newLesson = {
      id: `les-${crypto.randomUUID()}`,
      title: "",
      moduleId: module.id,
      duration: "",
      contentPreview: "",
      videoUrl: "",
    };
    onUpdate({ ...module, lessons: [...module.lessons, newLesson] });
  };

  const handleUpdateLesson = (lessonIndex, updatedLesson) => {
    const nextLessons = module.lessons.map((l, i) =>
      i === lessonIndex ? updatedLesson : l
    );
    onUpdate({ ...module, lessons: nextLessons });
  };

  const handleRemoveLesson = (lessonIndex) => {
    onUpdate({
      ...module,
      lessons: module.lessons.filter((_, i) => i !== lessonIndex),
    });
  };

  const label = `Module ${moduleIndex + 1}`;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{
        backgroundColor: "#16161a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      aria-label={`${label}: ${module.title || "Untitled"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsCollapsed((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 bg-transparent border-none p-0 text-left cursor-pointer rounded focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:outline-none"
          aria-expanded={!isCollapsed}
        >
          <span className="text-[0.82rem] text-brand" aria-hidden="true">
            {isCollapsed ? "+" : "-"}
          </span>
          <span
            className="font-heading text-[1.1rem] font-bold truncate"
            style={{ color: "rgba(217,119,6,0.7)" }}
          >
            {label}{module.title ? `: ${module.title}` : ""}
          </span>
          <span className="shrink-0 rounded-full border border-[rgba(255,255,255,0.08)] px-2 py-0.5 text-[0.72rem] text-text-dim">
            {module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCollapsed((value) => !value)}
            className="text-[0.78rem] font-semibold cursor-pointer bg-transparent rounded-md px-3 py-1.5 text-text-dim border border-[rgba(255,255,255,0.08)] focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:outline-none"
          >
            {isCollapsed ? "Expand" : "Collapse"}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-[0.8rem] font-medium cursor-pointer bg-transparent border-none rounded focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:outline-none"
            style={{ color: "#ef4444" }}
            aria-label={`Remove module ${moduleIndex + 1}`}
          >
            Remove Module
          </button>
        </div>
      </div>

      {isCollapsed && (
        <p className="text-[0.82rem] text-text-dim m-0">
          {module.title || "Untitled module"} - {module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"}
        </p>
      )}

      {!isCollapsed && (
        <>

      {/* Module Title */}
      <FormField label="Module Title *" htmlFor={`mod-title-${module.id}`} error={errors.title}>
        <input
          id={`mod-title-${module.id}`}
          value={module.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. Getting Started"
          aria-required="true"
          aria-invalid={!!errors.title}
          className={INPUT_CLASS}
          style={buildInputBorder(errors.title)}
        />
      </FormField>

      {/* Lessons */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[0.82rem] font-semibold text-text-secondary">
            Lessons ({module.lessons.length})
          </span>
          <button
            type="button"
            onClick={handleAddLesson}
            className="text-[0.82rem] font-semibold cursor-pointer bg-transparent rounded-md px-3 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:outline-none"
            style={{
              color: "#d97706",
              border: "1px solid rgba(217,119,6,0.3)",
            }}
          >
            + Add Lesson
          </button>
        </div>

        {module.lessons.length === 0 && (
          <p className="text-[0.8rem] text-text-faint italic m-0">
            No lessons yet. Add a lesson to build your module content.
          </p>
        )}

        {module.lessons.map((lesson, lessonIndex) => (
          <LessonEditor
            key={lesson.id}
            lesson={lesson}
            lessonIndex={lessonIndex}
            onUpdate={(updated) => handleUpdateLesson(lessonIndex, updated)}
            onRemove={() => handleRemoveLesson(lessonIndex)}
            errors={errors.lessons?.[lessonIndex] || {}}
          />
        ))}
      </div>
        </>
      )}
    </div>
  );
}
