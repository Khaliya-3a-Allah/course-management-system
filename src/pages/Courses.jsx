import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
<<<<<<< Updated upstream
=======
import ResourceState from "../components/ResourceState";
import { SearchIcon } from "../components/Icons";
>>>>>>> Stashed changes

export default function Courses() {
  const { courses, coursesStatus, coursesError, fetchCourses } = useAppContext();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") ? [searchParams.get("category")] : [],
    level: [],
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesCategory =
        !filters.category.length || filters.category.includes(c.category);

      const matchesLevel =
        !filters.level.length || filters.level.includes(c.level);

      return matchesQuery && matchesCategory && matchesLevel;
    });
  }, [courses, query, filters]);

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div
      style={{
        ...styles.page,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <style>{`
        @media (max-width: 700px) {
          .courses-body { grid-template-columns: 1fr !important; }
          .courses-sidebar { display: none; }
          .courses-sidebar.open { display: block !important; }
          .filter-toggle { display: flex !important; }
        }
        @media (min-width: 701px) {
          .filter-toggle { display: none !important; }
          .courses-sidebar { display: block !important; }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.pageTitle}>All Courses</h1>
          <p style={styles.pageSubtitle}>
            {courses.length} courses across development, design, data science & more.
          </p>
<<<<<<< Updated upstream
          <div style={styles.searchWrap}>
            <SearchBar value={query} onChange={setQuery} />
=======
          <div className="flex flex-wrap gap-2">
            {topCategories.map((cat) => {
              const selected = filters.category.includes(cat.name);
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    handleFiltersChange({
                      ...filters,
                      category: filters.category.includes(cat.name)
                        ? filters.category.filter((item) => item !== cat.name)
                        : [...filters.category, cat.name],
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
              <FilterPanel courses={courses} filters={filters} onChange={handleFiltersChange} />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
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

                {filtered.length > 0 && (
                  <span className="text-[0.78rem] text-text-dim">
                    Showing {pageStart + 1}-{Math.min(pageStart + pageSize, filtered.length)}
                  </span>
                )}

                {hasActiveFilters && (
                  <button
                    onClick={() => handleFiltersChange({ category: [], level: [] })}
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

            <ResourceState
              status={coursesStatus}
              error={coursesError}
              onRetry={fetchCourses}
              loadingLabel="Loading courses…"
              isEmpty={courses.length === 0}
              renderEmpty={() => (
                <section
                  className="flex flex-col items-center py-20 px-8 text-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-surface"
                  aria-label="No courses yet"
                >
                  <span className="text-text-dim mb-4" aria-hidden="true">
                    <SearchIcon size={40} />
                  </span>
                  <h2 className="font-['Playfair_Display',serif] text-[1.4rem] text-[#f5f2ec] mb-2">
                    No courses yet
                  </h2>
                  <p className="text-[#6b7280] text-[0.9rem] mb-6">
                    New courses will appear here once they're published.
                  </p>
                </section>
              )}
            >
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
                    onClick={() => { handleQueryChange(""); handleFiltersChange({ category: [], level: [] }); }}
                    className="px-6 py-2.5 rounded-lg font-semibold text-[0.88rem] cursor-pointer border border-[rgba(217,119,6,0.3)] bg-[rgba(217,119,6,0.1)] text-[#d97706]"
                  >
                    Clear all filters
                  </button>
                </section>
              ) : (
                <>
                  <ul
                    className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 list-none p-0 m-0"
                    aria-label="Course results"
                  >
                    {paginatedCourses.map((course, index) => (
                      <li key={course.id} className="course-card-enter" style={{ animationDelay: `${index * 45}ms` }}>
                        <CourseCard course={course} />
                      </li>
                    ))}
                  </ul>

                  {totalPages > 1 && (
                    <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Courses pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, effectivePage - 1))}
                        disabled={effectivePage === 1}
                        className="px-3 py-1.5 rounded-lg text-[0.82rem] border border-[rgba(255,255,255,0.1)] text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          aria-current={effectivePage === page ? "page" : undefined}
                          className={`min-w-8 h-8 rounded-lg text-[0.8rem] border ${
                            effectivePage === page
                              ? "border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.14)] text-[#f6c56b]"
                              : "border-[rgba(255,255,255,0.1)] text-text-secondary"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, effectivePage + 1))}
                        disabled={effectivePage === totalPages}
                        className="px-3 py-1.5 rounded-lg text-[0.82rem] border border-[rgba(255,255,255,0.1)] text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  )}
                </>
              )}
            </ResourceState>
>>>>>>> Stashed changes
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="courses-body" style={styles.body}>
        {/* Sidebar */}
        <aside className={`courses-sidebar${showFilters ? " open" : ""}`}>
          {/* Mobile filter toggle */}
          <button
            className="filter-toggle"
            onClick={() => setShowFilters((v) => !v)}
            style={styles.filterToggle}
          >
            {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
          </button>
          <FilterPanel courses={courses} filters={filters} onChange={setFilters} />
        </aside>

        {/* Grid */}
        <main>
          <div style={styles.resultsBar}>
            <span style={styles.resultsCount}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {query && <> for "<strong>{query}</strong>"</>}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🔍</span>
              <h3 style={styles.emptyTitle}>No courses found</h3>
              <p style={styles.emptySub}>
                Try a different search term or clear your filters.
              </p>
              <button
                onClick={() => { setQuery(""); setFilters({ category: [], level: [] }); }}
                style={styles.clearBtn}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0c0c0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif" },
  header: { backgroundColor: "#111114", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "3rem 1.5rem 2.5rem" },
  headerInner: { maxWidth: "1200px", margin: "0 auto" },
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: "#f5f2ec", margin: "0 0 0.5rem" },
  pageSubtitle: { color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.95rem" },
  searchWrap: { maxWidth: "540px" },
  body: { maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem", display: "grid", gridTemplateColumns: "220px 1fr", gap: "2.5rem", alignItems: "start" },
  filterToggle: { display: "none", width: "100%", padding: "0.65rem 1rem", backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", color: "#d97706", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", marginBottom: "1rem", alignItems: "center", justifyContent: "center" },
  resultsBar: { marginBottom: "1.25rem" },
  resultsCount: { fontSize: "0.85rem", color: "#6b7280" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.25rem" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 2rem", textAlign: "center" },
  emptyIcon: { fontSize: "2.5rem", marginBottom: "1rem" },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#f5f2ec", marginBottom: "0.5rem" },
  emptySub: { color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.9rem" },
  clearBtn: { padding: "0.65rem 1.5rem", backgroundColor: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: "8px", color: "#d97706", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" },
};
