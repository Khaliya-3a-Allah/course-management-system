import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import { SearchIcon } from "../components/Icons";

export default function Courses() {
  const { courses } = useAppContext();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") ? [searchParams.get("category")] : [],
    level: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || c.title.toLowerCase().includes(q) || c.instructorName.toLowerCase().includes(q) || c.tags?.some((t) => t.toLowerCase().includes(q));
      const matchesCategory = !filters.category.length || filters.category.includes(c.category);
      const matchesLevel = !filters.level.length || filters.level.includes(c.level);
      return matchesQuery && matchesCategory && matchesLevel;
    });
  }, [courses, query, filters]);

  const topCategories = useMemo(() => {
    const counts = courses.reduce((acc, course) => {
      acc[course.category] = (acc[course.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [courses]);

  const hasActiveFilters = filters.category.length > 0 || filters.level.length > 0;
  const activeFilterCount = filters.category.length + filters.level.length;

  return (
    <div
      className="min-h-screen bg-base text-[#e8e6e0]"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
    >
      {/* Header */}
      <header className="relative overflow-hidden bg-sidebar border-b border-[rgba(255,255,255,0.06)] px-6 md:px-8 pt-12 pb-10">
        <div className="pointer-events-none absolute -top-20 -left-28 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.16)_0%,rgba(245,158,11,0)_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.14)_0%,rgba(217,119,6,0)_68%)]" />
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.75rem] tracking-[0.24em] uppercase text-[#f59e0b] mb-3">
                Course Discovery
              </p>
              <h1 className="font-heading text-[2rem] md:text-[2.35rem] text-text-primary mb-2">
                Find your next learning path
              </h1>
              <p className="text-text-dim text-[0.95rem] max-w-[600px]">
                Browse {courses.length} courses across development, design, data science, and career tracks.
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <span className="px-3 py-1.5 rounded-full text-[0.72rem] border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)] text-[#f6c56b]">
                  {courses.length} courses
                </span>
                <span className="px-3 py-1.5 rounded-full text-[0.72rem] border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.04)] text-[#d1cfc8]">
                  {topCategories.length} popular categories
                </span>
                {hasActiveFilters && (
                  <span className="px-3 py-1.5 rounded-full text-[0.72rem] border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.08)] text-[#f6c56b]">
                    {activeFilterCount} active filter{activeFilterCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full max-w-[560px]">
              <SearchBar value={query} onChange={setQuery} />
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 md:py-10">

        <section className="mb-4 md:mb-5" aria-label="Popular categories">
          <p className="text-[0.72rem] tracking-[0.2em] uppercase text-text-faint mb-2.5">
            Jump to category
          </p>
          <div className="flex flex-wrap gap-2">
            {topCategories.map((cat) => {
              const selected = filters.category.includes(cat.name);
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setFilters((prev) => {
                      const current = prev.category || [];
                      const next = current.includes(cat.name)
                        ? current.filter((item) => item !== cat.name)
                        : [...current, cat.name];
                      return { ...prev, category: next };
                    });
                  }}
                  className={`px-3 py-1.5 rounded-full text-[0.77rem] border transition-all ${
                    selected
                      ? "border-[rgba(245,158,11,0.42)] bg-[rgba(245,158,11,0.16)] text-[#f6c56b]"
                      : "border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.03)] text-text-secondary hover:border-[rgba(255,255,255,0.28)]"
                  }`}
                  aria-pressed={selected}
                >
                  {cat.name} <span className="opacity-70">({cat.count})</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Mobile filter toggle */}
        <button
          className="md:hidden w-full rounded-xl font-semibold text-[0.85rem] border border-[rgba(245,158,11,0.35)] bg-[linear-gradient(180deg,rgba(245,158,11,0.14),rgba(217,119,6,0.08))] text-[#f6c56b] cursor-pointer mb-4 px-4 py-2.5 flex items-center justify-center"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          aria-controls="filter-panel"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">

          {/* Sidebar */}
          <aside
            id="filter-panel"
            className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-[240px] shrink-0`}
            aria-label="Course filters"
          >
            <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-sidebar p-4 md:p-4 md:sticky md:top-24">
              <FilterPanel courses={courses} filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <section className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-surface/80 px-4 py-4 md:px-5 md:py-4 mb-5">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <p
                  className="text-[0.85rem] text-[#9ca3af]"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  {query && <> for "<strong className="text-[#d1cfc8]">{query}</strong>"</>}
                </p>

                {hasActiveFilters && (
                  <button
                    onClick={() => setFilters({ category: [], level: [] })}
                    className="ml-auto px-3 py-1.5 rounded-lg text-[0.75rem] font-semibold text-[#f5c27a] border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)]"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {filters.category.map((cat) => (
                    <span
                      key={`cat-${cat}`}
                      className="px-2.5 py-1 rounded-full text-[0.72rem] border border-[rgba(217,119,6,0.35)] bg-[rgba(217,119,6,0.14)] text-[#f6c56b]"
                    >
                      {cat}
                    </span>
                  ))}
                  {filters.level.map((lvl) => (
                    <span
                      key={`lvl-${lvl}`}
                      className="px-2.5 py-1 rounded-full text-[0.72rem] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.04)] text-[#d1cfc8]"
                    >
                      {lvl}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {filtered.length === 0 ? (
              <section
                className="flex flex-col items-center py-20 px-8 text-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-surface"
                aria-label="No results"
              >
                <span className="text-text-dim mb-4" aria-hidden="true">
                  <SearchIcon size={40} />
                </span>
                <h2 className="font-['Playfair_Display',serif] text-[1.4rem] text-[#f5f2ec] mb-2">
                  No courses found
                </h2>
                <p className="text-[#6b7280] text-[0.9rem] mb-6">
                  Try a different search term or clear your filters.
                </p>
                <button
                  onClick={() => { setQuery(""); setFilters({ category: [], level: [] }); }}
                  className="px-6 py-2.5 rounded-lg font-semibold text-[0.88rem] cursor-pointer border border-[rgba(217,119,6,0.3)] bg-[rgba(217,119,6,0.1)] text-[#d97706]"
                >
                  Clear all filters
                </button>
              </section>
            ) : (
              <ul
                className="grid gap-5 list-none p-0 m-0"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}
                aria-label="Course results"
              >
                {filtered.map((course, index) => (
                  <li key={course.id} className="course-card-enter" style={{ animationDelay: `${index * 45}ms` }}>
                    <CourseCard course={course} />
                  </li>
                ))}
              </ul>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}