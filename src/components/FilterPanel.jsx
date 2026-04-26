const LEVELS = ["Beginner", "Intermediate", "Advanced"];

function normalizeFacetValues(items = []) {
  return items
    .filter((item) => item && item.value)
    .map((item) => ({ value: item.value, count: item.count || 0 }));
}

export default function FilterPanel({ courses, filters, onChange, facets }) {
  const categories = facets?.category?.length
    ? normalizeFacetValues(facets.category)
    : [...new Set(courses.map((c) => c.category))].map((value) => ({ value, count: 0 }));

  const levels = facets?.level?.length
    ? normalizeFacetValues(facets.level)
    : LEVELS.map((value) => ({ value, count: 0 }));

  const tags = normalizeFacetValues(facets?.tags || []);

  const toggle = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  const isActive = (key, value) => (filters[key] || []).includes(value);

  const hasFilters =
    (filters.category?.length > 0) ||
    (filters.level?.length > 0) ||
    (filters.tags?.length > 0);

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
            onClick={() => onChange({ category: [], level: [], tags: [] })}
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
            <li key={cat.value}>
              <button
                onClick={() => toggle("category", cat.value)}
                aria-pressed={isActive("category", cat.value)}
                className={`w-full px-3.5 py-2 rounded-md text-[0.83rem] cursor-pointer text-left border transition-all ${
                  isActive("category", cat.value)
                    ? "bg-[rgba(217,119,6,0.1)] border-[rgba(217,119,6,0.4)] text-brand"
                    : "bg-sidebar border-[rgba(255,255,255,0.08)] text-text-muted"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{cat.value}</span>
                  {cat.count > 0 && <span className="text-[0.72rem] opacity-70">{cat.count}</span>}
                </span>
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
          {levels.map((lvl) => (
            <li key={lvl.value}>
              <button
                onClick={() => toggle("level", lvl.value)}
                aria-pressed={isActive("level", lvl.value)}
                className={`w-full px-3.5 py-2 rounded-md text-[0.83rem] cursor-pointer text-left border transition-all ${
                  isActive("level", lvl.value)
                    ? "bg-[rgba(217,119,6,0.1)] border-[rgba(217,119,6,0.4)] text-brand"
                    : "bg-sidebar border-[rgba(255,255,255,0.08)] text-text-muted"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{lvl.value}</span>
                  {lvl.count > 0 && <span className="text-[0.72rem] opacity-70">{lvl.count}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      {tags.length > 0 && (
        <fieldset className="flex flex-col gap-1.5 border-none p-0 m-0">
          <legend className="text-[0.72rem] tracking-widest uppercase font-bold text-text-faint mb-1.5">
            Tags
          </legend>
          <ul className="list-none flex flex-wrap gap-1.5" role="list">
            {tags.slice(0, 12).map((tag) => (
              <li key={tag.value}>
                <button
                  onClick={() => toggle("tags", tag.value)}
                  aria-pressed={isActive("tags", tag.value)}
                  className={`px-2.5 py-1.5 rounded-md text-[0.78rem] cursor-pointer border transition-all ${
                    isActive("tags", tag.value)
                      ? "bg-[rgba(217,119,6,0.1)] border-[rgba(217,119,6,0.4)] text-brand"
                      : "bg-sidebar border-[rgba(255,255,255,0.08)] text-text-muted"
                  }`}
                >
                  {tag.value} <span className="opacity-70">({tag.count})</span>
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      )}
    </aside>
  );
}