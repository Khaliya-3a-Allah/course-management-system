import { Link } from "react-router-dom";

const levelColors = {
  Beginner: "#22c55e",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

export default function CourseCard({ course }) {
  return (
    <article className="flex flex-col rounded-xl overflow-hidden border border-[rgba(255,255,255,0.07)] transition-all duration-200 hover:-translate-y-0.5 bg-surface">
      <Link
        to={`/courses/${course.id}`}
        className="flex flex-col flex-1 no-underline"
        aria-label={`View ${course.title}`}
      >
        {/* Thumbnail */}
        <div className="relative h-40 bg-sidebar">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={`${course.title} thumbnail`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-4xl" aria-hidden="true">
              📚
            </div>
          )}
          <span
            className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase text-[#0c0c0e]"
            style={{ backgroundColor: levelColors[course.level] || "#6b7280" }}
            aria-label={`Level: ${course.level}`}
          >
            {course.level}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1.5 flex-1 px-4 pt-3.5 pb-4">
          <p className="text-[0.7rem] tracking-widest uppercase font-bold m-0 text-brand">
            {course.category}
          </p>

          <h3 className="font-heading text-[1rem] m-0 leading-snug text-text-primary">
            {course.title}
          </h3>

          <p className="text-[0.78rem] m-0 text-text-dim">
            by {course.instructorName}
          </p>

          {/* Footer */}
          <footer className="flex justify-between items-center mt-auto pt-3 border-t border-[rgba(255,255,255,0.05)]">
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

            <span className="text-[0.73rem] text-text-faint">
              {course.modules?.length || 0} modules
            </span>
          </footer>
        </div>
      </Link>
    </article>
  );
}