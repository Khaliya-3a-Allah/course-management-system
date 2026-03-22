const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function FilterPanel({ courses, filters, onChange }) {
  const categories = [...new Set(courses.map((c) => c.category))];

  const toggle = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  const isActive = (key, value) => (filters[key] || []).includes(value);

  const hasFilters =
    (filters.category?.length > 0) || (filters.level?.length > 0);

  return (
    <aside
      className="flex flex-col gap-5 min-w-[200px]"
      aria-label="Filter courses"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-[0.7rem] tracking-widest uppercase font-bold text-text-dim">
          Filters
        </span>
        {hasFilters && (
          <button
            onClick={() => onChange({ category: [], level: [] })}
            className="border-none text-[0.78rem] font-semibold cursor-pointer p-0 hover:opacity-80 transition-opacity text-brand bg-transparent"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category group */}
      <fieldset className="flex flex-col gap-1.5 border-none p-0 m-0">
        <legend className="text-[0.72rem] tracking-widest uppercase font-bold text-text-faint mb-1.5">
          Category
        </legend>
        <ul className="list-none flex flex-col gap-1.5" role="list">
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => toggle("category", cat)}
                aria-pressed={isActive("category", cat)}
                className={`w-full px-3.5 py-2 rounded-md text-[0.83rem] cursor-pointer text-left border transition-all ${
                  isActive("category", cat)
                    ? "bg-[rgba(217,119,6,0.1)] border-[rgba(217,119,6,0.4)] text-brand"
                    : "bg-sidebar border-[rgba(255,255,255,0.08)] text-text-muted"
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      {/* Level group */}
      <fieldset className="flex flex-col gap-1.5 border-none p-0 m-0">
        <legend className="text-[0.72rem] tracking-widest uppercase font-bold text-text-faint mb-1.5">
          Level
        </legend>
        <ul className="list-none flex flex-col gap-1.5" role="list">
          {LEVELS.map((lvl) => (
            <li key={lvl}>
              <button
                onClick={() => toggle("level", lvl)}
                aria-pressed={isActive("level", lvl)}
                className={`w-full px-3.5 py-2 rounded-md text-[0.83rem] cursor-pointer text-left border transition-all ${
                  isActive("level", lvl)
                    ? "bg-[rgba(217,119,6,0.1)] border-[rgba(217,119,6,0.4)] text-brand"
                    : "bg-sidebar border-[rgba(255,255,255,0.08)] text-text-muted"
                }`}
              >
                {lvl}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>
    </aside>
  );
}