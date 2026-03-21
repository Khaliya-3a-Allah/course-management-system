import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ModuleDetails() {
  const { courseId, moduleId } = useParams();
  const { courses } = useAppContext();

  const course = useMemo(() => courses.find((item) => item.id === courseId), [courses, courseId]);
  const module = useMemo(() => course?.modules?.find((item) => item.id === moduleId), [course, moduleId]);
  const [activeLessonId, setActiveLessonId] = useState(null);

  useEffect(() => {
    if (module?.lessons?.length) {
      setActiveLessonId(module.lessons[0].id);
    }
  }, [module]);

  const activeLesson = module?.lessons?.find((item) => item.id === activeLessonId);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-stone-100">Course not found</h1>
        <Link to="/courses" className="mt-5 inline-block text-amber-500 hover:text-amber-400">Back to courses</Link>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-stone-100">Module not found</h1>
        <Link to={`/courses/${course.id}`} className="mt-5 inline-block text-amber-500 hover:text-amber-400">Back to course</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/10 bg-zinc-900/50">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-6 py-4 text-sm text-zinc-400">
          <Link to={`/courses/${course.id}`} className="text-amber-500 hover:text-amber-400">{course.title}</Link>
          <span>/</span>
          <span>{module.title}</span>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Module</p>
            <h2 className="font-display mt-2 text-xl text-stone-100">{module.title}</h2>
          </div>
          <div className="p-2">
            {module.lessons?.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${activeLessonId === lesson.id ? "bg-amber-500/10 text-amber-500" : "text-zinc-300 hover:bg-white/5"}`}
              >
                <span className="font-display text-lg">{String(index + 1).padStart(2, "0")}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{lesson.title}</span>
                  <span className="text-xs text-zinc-500">{lesson.duration}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main>
          {activeLesson ? (
            <div>
              <div className="aspect-video w-full rounded-xl border border-white/10 bg-zinc-900">
                {activeLesson.videoUrl ? (
                  <iframe src={activeLesson.videoUrl} title={activeLesson.title} className="h-full w-full rounded-xl" allowFullScreen />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">No video available</div>
                )}
              </div>
              <h1 className="font-display mt-6 text-3xl text-stone-100">{activeLesson.title}</h1>
              <p className="mt-2 text-sm text-zinc-500">{activeLesson.duration}</p>
              <div className="mt-5 rounded-xl border border-white/10 bg-zinc-900 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-600">Lesson Preview</p>
                <p className="mt-3 leading-7 text-zinc-400">
                  {activeLesson.contentPreview || "No preview content available for this lesson."}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-zinc-400">Select a lesson to begin.</div>
          )}
        </main>
      </div>
    </div>
  );
}
