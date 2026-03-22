import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";

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

  return (
    <div
      className="min-h-screen bg-[#0c0c0e] text-[#e8e6e0]"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
    >
      <style>{`
        @media (max-width: 700px) {
          .courses-layout { flex-direction: column !important; }
          .courses-filter-toggle { display: flex !important; }
          .courses-sidebar { display: none; }
          .courses-sidebar.open { display: block !important; }
        }
        @media (min-width: 701px) {
          .courses-filter-toggle { display: none !important; }
          .courses-sidebar { display: block !important; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-[#111114] border-b border-[rgba(255,255,255,0.06)] px-8 pt-12 pb-10">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="font-['Playfair_Display',serif] text-[2.2rem] text-[#f5f2ec] mb-2">
            All Courses
          </h1>
          <p className="text-[#6b7280] text-[0.95rem] mb-6">
            {courses.length} courses across development, design, data science & more.
          </p>
          <div className="max-w-[540px]">
            <SearchBar value={query} onChange={setQuery} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-[1200px] mx-auto px-8 py-10">

        {/* Mobile filter toggle */}
        <button
          className="courses-filter-toggle w-full rounded-lg font-semibold text-[0.85rem] border border-[rgba(255,255,255,0.09)] bg-[#16161a] text-[#d97706] cursor-pointer mb-4 px-4 py-2.5 items-center justify-center"
          style={{ display: "none" }}
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          aria-controls="filter-panel"
        >
          {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
        </button>

        <div className="courses-layout flex gap-10 items-start">

          {/* Sidebar */}
          <aside
            id="filter-panel"
            className="courses-sidebar w-[220px] shrink-0"
            aria-label="Course filters"
          >
            <FilterPanel courses={courses} filters={filters} onChange={setFilters} />
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <p
              className="text-[0.85rem] text-[#6b7280] mb-5"
              aria-live="polite"
              aria-atomic="true"
            >
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {query && <> for "<strong className="text-[#d1cfc8]">{query}</strong>"</>}
            </p>

            {filtered.length === 0 ? (
              <section
                className="flex flex-col items-center py-20 px-8 text-center"
                aria-label="No results"
              >
                <span className="text-[2.5rem] mb-4" aria-hidden="true">🔍</span>
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
                {filtered.map((course) => (
                  <li key={course.id}><CourseCard course={course} /></li>
                ))}
              </ul>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}