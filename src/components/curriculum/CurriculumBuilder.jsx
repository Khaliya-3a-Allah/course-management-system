import ModuleEditor from "./ModuleEditor";

/**
 * Manages the course curriculum — a list of modules, each containing lessons.
 * All state lives in the parent; this component communicates changes upward via onModulesChange.
 */
export default function CurriculumBuilder({ modules, onModulesChange, errors = {} }) {
  const handleAddModule = () => {
    const newModule = {
      id: `mod-${crypto.randomUUID()}`,
      title: "",
      courseId: "",
      lessons: [],
    };
    onModulesChange([...modules, newModule]);
  };

  const handleUpdateModule = (index, updatedModule) => {
    const next = modules.map((m, i) => (i === index ? updatedModule : m));
    onModulesChange(next);
  };

  const handleRemoveModule = (index) => {
    onModulesChange(modules.filter((_, i) => i !== index));
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="curriculum-heading">
      {/* Section divider */}
      <hr
        className="border-none h-px my-2"
        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          id="curriculum-heading"
          className="font-heading text-[1.25rem] text-text-primary m-0"
        >
          Course Curriculum
        </h2>
        <button
          type="button"
          onClick={handleAddModule}
          className="text-[0.85rem] font-bold cursor-pointer bg-transparent rounded-lg px-4 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:outline-none"
          style={{
            color: "#d97706",
            border: "1px solid rgba(217,119,6,0.3)",
          }}
        >
          + Add Module
        </button>
      </div>

      {Object.keys(errors).length > 0 && (
        <p className="text-[0.82rem] text-red-400 m-0" role="alert">
          Some modules or lessons have validation errors. Please review below.
        </p>
      )}

      {modules.length === 0 && (
        <p className="text-[0.85rem] text-text-faint italic m-0">
          Add at least one module to create a course curriculum.
        </p>
      )}

      {/* Module list */}
      {modules.map((mod, index) => (
        <ModuleEditor
          key={mod.id}
          module={mod}
          moduleIndex={index}
          onUpdate={(updated) => handleUpdateModule(index, updated)}
          onRemove={() => handleRemoveModule(index)}
          errors={errors[index] || {}}
        />
      ))}
    </section>
  );
}
