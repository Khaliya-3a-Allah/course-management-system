import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Modal from "../components/Modal";

const levelClasses = {
  Beginner: "bg-emerald-500 text-zinc-950",
  Intermediate: "bg-amber-500 text-zinc-950",
  Advanced: "bg-rose-500 text-zinc-950",
};

export default function CourseDetails() {
  const { courseId } = useParams();
  const { courses, currentUser, enrollCourse, saveCourse } = useAppContext();

  const course = useMemo(() => courses.find((item) => item.id === courseId), [courses, courseId]);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-stone-100">Course not found</h1>
        <p className="mt-2 text-zinc-400">The course you requested does not exist.</p>
        <Link to="/courses" className="mt-5 inline-block text-amber-500 hover:text-amber-400">Back to courses</Link>
      </div>
    );
  }

  const enrolled = currentUser?.enrolledCourseIds?.includes(course.id);
  const saved = currentUser?.savedCourseIds?.includes(course.id);

  const requestAuthOrRun = (action) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    action();
  };

  return (
    <div className="min-h-screen">
      <section className="relative border-b border-white/10">
        {course.thumbnail && <img src={course.thumbnail} alt={`${course.title} thumbnail`} className="h-64 w-full object-cover opacity-35" />}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-8">
          <Link to="/courses" className="text-sm text-amber-500 hover:text-amber-400">Back to courses</Link>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${levelClasses[course.level] || "bg-zinc-500 text-zinc-950"}`}>{course.level}</span>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wider text-zinc-300">{course.category}</span>
          </div>
          <h1 className="font-display mt-3 text-4xl text-stone-100">{course.title}</h1>
          <p className="mt-2 text-zinc-300">By {course.instructorName}</p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[1fr_320px]">
        <main>
          <section>
            <h2 className="font-display text-2xl text-stone-100">About this course</h2>
            <p className="mt-3 leading-7 text-zinc-400">{course.description}</p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl text-stone-100">Curriculum</h2>
            <div className="mt-4 space-y-3">
              {course.modules?.map((module, index) => (
                <div key={module.id} className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                  <button
                    className="flex w-full items-center gap-4 px-4 py-3 text-left"
                    onClick={() => setExpandedModuleId((id) => (id === module.id ? null : module.id))}
                    aria-expanded={expandedModuleId === module.id}
                  >
                    <span className="font-display text-xl text-amber-600/50">{String(index + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-sm font-medium text-stone-200">{module.title}</span>
                    <span className="text-xs text-zinc-400">{module.lessons?.length || 0} lessons</span>
                  </button>

                  {expandedModuleId === module.id && (
                    <div className="border-t border-white/10 px-4 py-3">
                      <div className="space-y-2">
                        {module.lessons?.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between rounded-md bg-zinc-950 px-3 py-2">
                            <p className="text-sm text-zinc-200">{lesson.title}</p>
                            <span className="text-xs text-zinc-500">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                      <Link to={`/courses/${course.id}/modules/${module.id}`} className="mt-3 inline-block text-sm font-semibold text-amber-500 hover:text-amber-400">
                        Open module
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="h-fit rounded-xl border border-white/10 bg-zinc-900 p-5 lg:sticky lg:top-20">
          <p className="text-sm text-zinc-400">{course.modules?.length || 0} modules</p>
          <button
            className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-bold ${enrolled ? "cursor-not-allowed border border-emerald-500/30 bg-zinc-800 text-emerald-400" : "bg-amber-600 text-zinc-950 hover:bg-amber-500"}`}
            onClick={() => requestAuthOrRun(() => enrollCourse(course.id))}
            disabled={Boolean(enrolled)}
          >
            {enrolled ? "Enrolled" : "Enroll now"}
          </button>
          <button
            className={`mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-semibold ${saved ? "cursor-not-allowed border border-rose-500/30 bg-zinc-800 text-rose-400" : "border border-white/15 text-zinc-200 hover:border-white/25"}`}
            onClick={() => requestAuthOrRun(() => saveCourse(course.id))}
            disabled={Boolean(saved)}
          >
            {saved ? "Saved" : "Save course"}
          </button>
        </aside>
      </div>

      <Modal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} title="Sign in required">
        <p className="text-sm text-zinc-400">You need to sign in before saving or enrolling.</p>
        <div className="mt-5 flex gap-3">
          <Link to="/login" className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-center text-sm font-bold text-zinc-950" onClick={() => setAuthModalOpen(false)}>
            Login
          </Link>
          <Link to="/register" className="flex-1 rounded-lg border border-white/15 px-4 py-2 text-center text-sm font-semibold text-zinc-200" onClick={() => setAuthModalOpen(false)}>
            Register
          </Link>
        </div>
      </Modal>
    </div>
  );
}
