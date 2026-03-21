import { useMemo, useState } from "react";
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

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return courses.filter((course) => {
      const queryMatch =
        !normalized ||
        course.title.toLowerCase().includes(normalized) ||
        course.instructorName.toLowerCase().includes(normalized) ||
        course.tags?.some((tag) => tag.toLowerCase().includes(normalized));

      const categoryMatch = !filters.category.length || filters.category.includes(course.category);
      const levelMatch = !filters.level.length || filters.level.includes(course.level);

      return queryMatch && categoryMatch && levelMatch;
    });
  }, [courses, query, filters]);

  const clearAll = () => {
    setQuery("");
    setFilters({ category: [], level: [] });
  };

  return (
    <div className="min-h-screen">
      <section className="border-b border-white/10 bg-zinc-900/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <h1 className="font-display text-4xl text-stone-100">All Courses</h1>
          <p className="mt-2 text-zinc-400">{courses.length} courses across development, design, data science, and more.</p>
          <div className="mt-5 max-w-xl">
            <SearchBar value={query} onChange={setQuery} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <div>
          <button
            className="mb-3 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm font-semibold text-amber-500 lg:hidden"
            onClick={() => setShowFilters((v) => !v)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <FilterPanel courses={courses} filters={filters} onChange={setFilters} />
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-400">
              {filteredCourses.length} result{filteredCourses.length !== 1 ? "s" : ""}
              {query ? ` for \"${query}\"` : ""}
            </p>
            {(query || filters.category.length || filters.level.length) && (
              <button className="text-sm font-semibold text-amber-500 hover:text-amber-400" onClick={clearAll}>
                Clear all
              </button>
            )}
          </div>

          {filteredCourses.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-10 text-center">
              <p className="font-display text-2xl text-stone-100">No courses found</p>
              <p className="mt-2 text-zinc-400">Try another search or clear active filters.</p>
              <button onClick={clearAll} className="mt-5 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-500">
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
