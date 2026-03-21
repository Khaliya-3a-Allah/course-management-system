import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";

export default function Dashboard() {
  const { currentUser, courses } = useAppContext();
  const [activeTab, setActiveTab] = useState("enrolled");

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const enrolled = useMemo(
    () => courses.filter((course) => currentUser.enrolledCourseIds?.includes(course.id)),
    [courses, currentUser]
  );
  const saved = useMemo(
    () => courses.filter((course) => currentUser.savedCourseIds?.includes(course.id)),
    [courses, currentUser]
  );
  const created = useMemo(
    () => courses.filter((course) => currentUser.createdCourseIds?.includes(course.id)),
    [courses, currentUser]
  );

  const tabData = {
    enrolled,
    saved,
    created,
  };

  const activeList = tabData[activeTab] || [];

  return (
    <div className="min-h-screen">
      <section className="border-b border-white/10 bg-zinc-900/50">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-6 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/50 bg-amber-500/10 font-display text-2xl text-amber-500">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl text-stone-100">{currentUser.name}</h1>
            <p className="text-zinc-400">{currentUser.email}</p>
          </div>
          {currentUser.role === "instructor" && (
            <Link to="/course-form" className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-500">
              Add Course
            </Link>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {[
            ["enrolled", enrolled.length],
            ["saved", saved.length],
            ["created", created.length],
          ].map(([tab, count]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${activeTab === tab ? "bg-amber-600 text-zinc-950" : "border border-white/15 text-zinc-300"}`}
            >
              {tab} ({count})
            </button>
          ))}
        </div>

        {activeList.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center">
            <p className="font-display text-2xl text-stone-100">No courses in this section yet</p>
            <Link to="/courses" className="mt-4 inline-block text-amber-500 hover:text-amber-400">Browse courses</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeList.map((course) => (
              <div key={course.id}>
                <CourseCard course={course} />
                {activeTab === "created" && (
                  <Link
                    to={`/course-form/${course.id}`}
                    className="mt-2 inline-block rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-zinc-300"
                  >
                    Edit
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
