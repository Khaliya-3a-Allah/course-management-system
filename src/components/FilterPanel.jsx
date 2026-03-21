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
    <aside className="flex min-w-52 flex-col gap-5" aria-label="Filter courses">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">Filters</span>
        {hasFilters && (
          <button
            onClick={() => onChange({ category: [], level: [] })}
            className="text-xs font-semibold text-amber-600 transition hover:text-amber-500"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">Category</p>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => toggle("category", cat)}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
              isActive("category", cat)
                ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                : "border-white/10 bg-zinc-900 text-zinc-300 hover:border-white/20"
            }`}
            aria-pressed={isActive("category", cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">Level</p>
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => toggle("level", lvl)}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
              isActive("level", lvl)
                ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                : "border-white/10 bg-zinc-900 text-zinc-300 hover:border-white/20"
            }`}
            aria-pressed={isActive("level", lvl)}
          >
            {lvl}
          </button>
        ))}
      </div>
    </aside>
  );
}
