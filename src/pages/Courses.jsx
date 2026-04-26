import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import { SearchIcon } from "../components/Icons";
import { apiGet } from "../utils/api";

const PAGE_SIZE = 8;
const SAVED_SEARCHES_KEY = "cms_saved_course_searches";

function normalizeCourse(raw) {
  return {
    ...raw,
    id: raw.id || raw._id,
    instructorName: raw.instructorName || raw.instructor || "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    rating: Number(raw.rating || 0),
    price: Number(raw.price || 0),
    salePrice: Number(raw.salePrice || 0),
    saleEndsAt: raw.saleEndsAt || null,
  };
}

function buildSearchParams({ q, filters, sortBy, page, pageSize }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (filters.category?.length) params.set("category", filters.category.join(","));
  if (filters.level?.length) params.set("level", filters.level.join(","));
  if (filters.tags?.length) params.set("tags", filters.tags.join(","));
  if (sortBy) params.set("sortBy", sortBy);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  return params.toString();
}

function loadSavedSearches() {
  try {
    const raw = localStorage.getItem(SAVED_SEARCHES_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Courses() {
  const { courses, coursesStatus } = useAppContext();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") ? [searchParams.get("category")] : [],
    level: [],
    tags: [],
  });
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [results, setResults] = useState([]);
  const [typoSuggestions, setTypoSuggestions] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [facets, setFacets] = useState({ category: [], level: [], tags: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [savedSearches, setSavedSearches] = useState(() => loadSavedSearches());

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 180);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const searchString = buildSearchParams({
      q: debouncedQuery,
      filters,
      sortBy,
      page: currentPage,
      pageSize: PAGE_SIZE,
    });

    const run = async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const [searchResponse, facetsResponse] = await Promise.all([
          apiGet(`/courses/search?${searchString}`),
          apiGet(`/courses/search/facets?${searchString}`),
        ]);

        const payload = searchResponse?.data || {};
        const items = (payload.items || []).map(normalizeCourse);
        const suggestions = (payload.typoSuggestions || []).map(normalizeCourse);

        setResults(items);
        setTypoSuggestions(suggestions);
        setTotalResults(Number(payload.total || 0));
        setTotalPages(Math.max(1, Number(payload.totalPages || 1)));
        setFacets(facetsResponse?.data || { category: [], level: [], tags: [] });
      } catch (error) {
        setSearchError(error?.message || "Unable to load courses right now.");
      } finally {
        setIsSearching(false);
      }
    };

    run();
  }, [debouncedQuery, filters, sortBy, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, filters, sortBy]);

  useEffect(() => {
    if (currentPage <= totalPages) return;
    setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const topCategories = useMemo(() => {
    const source = facets.category?.length
      ? facets.category.map((item) => ({ name: item.value, count: item.count }))
      : Object.entries(
        courses.reduce((acc, course) => {
          acc[course.category] = (acc[course.category] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, count]) => ({ name, count }));

    return source
      .filter((item) => item.name)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [courses, facets.category]);

  const hasActiveFilters =
    filters.category.length > 0 || filters.level.length > 0 || filters.tags.length > 0;
  const activeFilterCount = filters.category.length + filters.level.length + filters.tags.length;
  const pageStart = (currentPage - 1) * PAGE_SIZE;

  function handleQueryChange(q) {
    setQuery(q);
  }

  function handleFiltersChange(nextFilters) {
    setFilters(nextFilters);
  }

  function saveCurrentSearch() {
    const entry = {
      id: `${Date.now()}`,
      query,
      filters,
      sortBy,
      createdAt: new Date().toISOString(),
    };

    const next = [entry, ...savedSearches]
      .slice(0, 8)
      .filter((item, idx, arr) => {
        const signature = JSON.stringify({ q: item.query, f: item.filters, s: item.sortBy });
        return arr.findIndex((candidate) => JSON.stringify({ q: candidate.query, f: candidate.filters, s: candidate.sortBy }) === signature) === idx;
      });

    setSavedSearches(next);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(next));
  }

  function applySavedSearch(saved) {
    setQuery(saved.query || "");
    setFilters(saved.filters || { category: [], level: [], tags: [] });
    setSortBy(saved.sortBy || "relevance");
    setCurrentPage(1);
  }

  return (
    <main
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
                Browse {totalResults || courses.length} courses across development, design, data science, and career tracks.
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <span className="px-3 py-1.5 rounded-full text-[0.72rem] border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)] text-[#f6c56b]">
                  {totalResults} results
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
              <SearchBar value={query} onChange={handleQueryChange} />
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
              <FilterPanel courses={courses} filters={filters} onChange={handleFiltersChange} facets={facets} />
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
                  {totalResults} result{totalResults !== 1 ? "s" : ""}
                  {debouncedQuery && <> for "<strong className="text-[#d1cfc8]">{debouncedQuery}</strong>"</>}
                </p>

                {totalResults > 0 && (
                  <span className="text-[0.78rem] text-text-dim">
                    Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, totalResults)}
                  </span>
                )}

                <label className="ml-auto text-[0.78rem] text-text-dim flex items-center gap-2">
                  Sort
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="px-2.5 py-1.5 rounded-md text-[0.78rem] border border-[rgba(255,255,255,0.14)] bg-sidebar text-text-primary"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Rating</option>
                    <option value="time">Newest</option>
                  </select>
                </label>

                <button
                  onClick={saveCurrentSearch}
                  className="px-3 py-1.5 rounded-lg text-[0.75rem] font-semibold text-[#f5c27a] border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)]"
                >
                  Save search
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={() => handleFiltersChange({ category: [], level: [], tags: [] })}
                    className="px-3 py-1.5 rounded-lg text-[0.75rem] font-semibold text-[#f5c27a] border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)]"
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
                  {filters.tags.map((tag) => (
                    <span
                      key={`tag-${tag}`}
                      className="px-2.5 py-1 rounded-full text-[0.72rem] border border-[rgba(245,158,11,0.28)] bg-[rgba(245,158,11,0.08)] text-[#f6c56b]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {savedSearches.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {savedSearches.map((saved) => (
                    <button
                      key={saved.id}
                      onClick={() => applySavedSearch(saved)}
                      className="px-2.5 py-1 rounded-full text-[0.72rem] border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.03)] text-text-secondary"
                    >
                      {saved.query || "Filtered search"}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {searchError ? (
              <section
                className="flex flex-col items-center py-16 px-8 text-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-surface"
                aria-label="Search error"
              >
                <h2 className="font-['Playfair_Display',serif] text-[1.35rem] text-[#f5f2ec] mb-2">
                  Search unavailable
                </h2>
                <p className="text-[#9ca3af] text-[0.9rem] max-w-[560px]">
                  {searchError}
                </p>
              </section>
            ) : isSearching || coursesStatus === "loading" ? (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5" aria-label="Loading search results">
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-surface overflow-hidden animate-pulse"
                  >
                    <div className="h-44 bg-[rgba(255,255,255,0.05)]" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 w-20 rounded-full bg-[rgba(255,255,255,0.06)]" />
                      <div className="h-5 w-4/5 rounded-full bg-[rgba(255,255,255,0.06)]" />
                      <div className="h-3 w-2/3 rounded-full bg-[rgba(255,255,255,0.06)]" />
                      <div className="h-4 w-full rounded-full bg-[rgba(255,255,255,0.05)]" />
                    </div>
                  </div>
                ))}
              </section>
            ) : results.length === 0 ? (
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
                  onClick={() => { handleQueryChange(""); handleFiltersChange({ category: [], level: [], tags: [] }); }}
                  className="px-6 py-2.5 rounded-lg font-semibold text-[0.88rem] cursor-pointer border border-[rgba(217,119,6,0.3)] bg-[rgba(217,119,6,0.1)] text-[#d97706]"
                >
                  Clear all filters
                </button>

                {typoSuggestions.length > 0 && (
                  <div className="w-full mt-8">
                    <p className="text-[0.78rem] tracking-[0.16em] uppercase text-text-faint mb-3">
                      Did you mean
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0 m-0">
                      {typoSuggestions.slice(0, 4).map((course) => (
                        <li key={course.id}>
                          <button
                            onClick={() => setQuery(course.title)}
                            className="w-full text-left px-3 py-2 rounded-lg border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.06)] text-[#f6c56b]"
                          >
                            {course.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ) : (
              <>
                <ul
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 list-none p-0 m-0"
                  aria-label="Course results"
                >
                {results.map((course, index) => (
                  <li key={course.id} className="course-card-enter" style={{ animationDelay: `${index * 45}ms` }}>
                    <CourseCard course={course} />
                  </li>
                ))}
                </ul>

                {totalPages > 1 && (
                  <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Courses pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg text-[0.82rem] border border-[rgba(255,255,255,0.1)] text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? "page" : undefined}
                        className={`min-w-8 h-8 rounded-lg text-[0.8rem] border ${
                          currentPage === page
                            ? "border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.14)] text-[#f6c56b]"
                            : "border-[rgba(255,255,255,0.1)] text-text-secondary"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg text-[0.82rem] border border-[rgba(255,255,255,0.1)] text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
