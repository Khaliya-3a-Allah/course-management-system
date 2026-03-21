import { Link } from "react-router-dom";

const levelColors = {
  Beginner: "bg-emerald-500 text-zinc-950",
  Intermediate: "bg-amber-500 text-zinc-950",
  Advanced: "bg-rose-500 text-zinc-950",
};

export default function CourseCard({ course }) {
  const levelBadge = levelColors[course.level] || "bg-zinc-500 text-zinc-950";

  return (
    <Link
      to={`/courses/${course.id}`}
      aria-label={`View ${course.title}`}
      className="group block overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition hover:-translate-y-1 hover:border-amber-500/45"
    >
      <div className="relative h-40 bg-zinc-950">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={`${course.title} thumbnail`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">BOOK</div>
        )}
        <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${levelBadge}`}>
          {course.level}
        </span>
      </div>

      <div className="flex h-full flex-col gap-1 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-600">{course.category}</p>
        <h3 className="font-display text-base leading-snug text-stone-100">{course.title}</h3>
        <p className="text-xs text-zinc-400">by {course.instructorName}</p>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-xs ${i < Math.round(course.rating) ? "text-amber-500" : "text-zinc-700"}`}>
                *
              </span>
            ))}
            <span className="ml-1 text-xs text-zinc-400">{course.rating?.toFixed(1)}</span>
          </div>
          <span className="text-xs text-zinc-500">{course.modules?.length || 0} modules</span>
        </div>
      </div>
    </Link>
  );
}
