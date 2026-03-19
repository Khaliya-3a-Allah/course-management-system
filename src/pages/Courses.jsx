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
          <div style={styles.searchWrap}>
            <SearchBar value={query} onChange={setQuery} />
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
