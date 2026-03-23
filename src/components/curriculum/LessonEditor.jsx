import FormField, { INPUT_CLASS, buildInputBorder } from "../FormField";

/**
 * Renders the form fields for a single lesson within a module.
 * All updates are immutable — each change returns a new lesson object.
 */
export default function LessonEditor({ lesson, lessonIndex, onUpdate, onRemove, errors = {} }) {
  const handleChange = (key, value) => {
    onUpdate({ ...lesson, [key]: value });
  };

  const label = `Lesson ${lessonIndex + 1}`;

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3"
      style={{
        backgroundColor: "#111114",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
      aria-label={`${label}: ${lesson.title || "Untitled"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[0.82rem] font-semibold text-text-secondary">
          {label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[0.78rem] font-medium cursor-pointer bg-transparent border-none rounded focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:outline-none"
          style={{ color: "#ef4444" }}
          aria-label={`Remove lesson ${lessonIndex + 1}`}
        >
          Remove
        </button>
      </div>

      {/* Title + Duration row */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Title *" htmlFor={`les-title-${lesson.id}`} error={errors.title}>
          <input
            id={`les-title-${lesson.id}`}
            value={lesson.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g. What is React?"
            aria-required="true"
            aria-invalid={!!errors.title}
            className={INPUT_CLASS}
            style={buildInputBorder(errors.title)}
          />
        </FormField>

        <FormField label="Duration *" htmlFor={`les-dur-${lesson.id}`} error={errors.duration}>
          <input
            id={`les-dur-${lesson.id}`}
            value={lesson.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
            placeholder="e.g. 8 min"
            aria-required="true"
            aria-invalid={!!errors.duration}
            className={INPUT_CLASS}
            style={buildInputBorder(errors.duration)}
          />
        </FormField>
      </div>

      {/* Content Preview */}
      <FormField label="Content Preview" htmlFor={`les-preview-${lesson.id}`} hint="Brief description of lesson content">
        <textarea
          id={`les-preview-${lesson.id}`}
          value={lesson.contentPreview}
          onChange={(e) => handleChange("contentPreview", e.target.value)}
          placeholder="Describe what students will learn in this lesson..."
          rows={2}
          className={`${INPUT_CLASS} resize-y`}
          style={{ ...buildInputBorder(false), minHeight: "60px" }}
        />
      </FormField>

      {/* Video URL */}
      <FormField label="Video URL" htmlFor={`les-video-${lesson.id}`} hint="Optional" error={errors.videoUrl}>
        <input
          id={`les-video-${lesson.id}`}
          value={lesson.videoUrl}
          onChange={(e) => handleChange("videoUrl", e.target.value)}
          placeholder="https://example.com/video.mp4"
          aria-invalid={!!errors.videoUrl}
          className={INPUT_CLASS}
          style={buildInputBorder(errors.videoUrl)}
        />
      </FormField>
    </div>
  );
}
