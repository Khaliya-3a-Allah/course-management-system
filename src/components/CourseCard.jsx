import { Link } from "react-router-dom";
import { BookIcon } from "./Icons";

const levelColors = {
  Beginner: "#22c55e",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

export default function CourseCard({ course }) {
  return (
    <article className="group relative flex flex-col rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] transition-all duration-300 hover:-translate-y-1 bg-surface hover:border-[rgba(245,158,11,0.28)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.38)]">
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_20%_0%,rgba(245,158,11,0.14),rgba(245,158,11,0)_45%)]" />
      <Link
        to={`/courses/${course.id}`}
        className="flex flex-col flex-1 no-underline"
        aria-label={`View ${course.title}`}
      >
        {/* Thumbnail */}
        <div className="relative h-44 bg-sidebar overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={`${course.title} thumbnail`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-text-dim" aria-hidden="true">
              <BookIcon size={34} />
            </div>
          )}
          <span
            className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase text-[#0c0c0e] shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
            style={{ backgroundColor: levelColors[course.level] || "#6b7280" }}
            aria-label={`Level: ${course.level}`}
          >
            {course.level}
          </span>
        </div>

        {/* Body */}
        <div className="relative flex flex-col gap-1.5 flex-1 px-4 pt-4 pb-4">
          <p className="text-[0.68rem] tracking-[0.2em] uppercase font-bold m-0 text-brand-light">
            {course.category}
          </p>

          <h3 className="font-heading text-[1.03rem] m-0 leading-snug text-text-primary group-hover:text-[#fff7e8] transition-colors">
            {course.title}
          </h3>

          <p className="text-[0.78rem] m-0 text-text-dim">
            by {course.instructorName}
          </p>

          {!!course.tags?.length && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {course.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[0.68rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <footer className="flex justify-between items-center mt-auto pt-3 border-t border-[rgba(255,255,255,0.07)]">
            {/* Stars */}
            <div className="flex items-center gap-px" aria-label={`Rating: ${course.rating?.toFixed(1)} out of 5`}>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="text-[0.75rem]"
                  aria-hidden="true"
                  style={{ color: i < Math.round(course.rating) ? "#f59e0b" : "#374151" }}
                >
                  ★
                </span>
              ))}
              <span className="text-[0.75rem] text-text-muted ml-1.5">
                {course.rating?.toFixed(1)}
              </span>
            </div>

            <span className="text-[0.72rem] text-text-faint">
              {course.modules?.length || 0} modules
            </span>
          </footer>
        </div>
      </Link>
    </article>
  );
}