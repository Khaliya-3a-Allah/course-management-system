import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";

export default function Home() {
  const { courses } = useAppContext();

  const featuredCourses = courses.slice(0, 4);
  const categories = useMemo(() => {
    const map = new Map();
    courses.forEach((course) => {
      map.set(course.category, (map.get(course.category) || 0) + 1);
    });
    return Array.from(map.entries());
  }, [courses]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative mx-auto flex min-h-[72vh] w-full max-w-6xl flex-col justify-center px-6 py-16">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-amber-600">Learn without limits</p>
          <h1 className="font-display text-4xl leading-tight text-stone-100 sm:text-6xl">
            Master skills that build
            <span className="block text-amber-500">real outcomes.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Explore practical courses in development, design, and data. Study module by module and track your progress in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/courses" className="rounded-lg bg-amber-600 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-500">
              Explore courses
            </Link>
            <Link to="/register" className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-stone-200 hover:border-white/35">
              Create free account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-display text-3xl text-stone-100">Featured Courses</h2>
          <Link to="/courses" className="text-sm font-semibold text-amber-500 hover:text-amber-400">
            See all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-900/50">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="font-display text-3xl text-stone-100">Browse by Category</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(([category, count]) => (
              <Link
                key={category}
                to={`/courses?category=${encodeURIComponent(category)}`}
                className="rounded-xl border border-white/10 bg-zinc-950 p-4 transition hover:border-amber-500/45"
              >
                <p className="text-base font-semibold text-stone-100">{category}</p>
                <p className="mt-1 text-sm text-zinc-400">{count} course{count > 1 ? "s" : ""}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 px-6 py-10 text-center">
          <h2 className="font-display text-3xl text-stone-100">Ready to begin?</h2>
          <p className="mt-3 text-zinc-400">Join and start learning today with curated, project-based content.</p>
          <Link to="/register" className="mt-6 inline-block rounded-lg bg-amber-600 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-500">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
