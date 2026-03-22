import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import Modal from "../components/Modal";

export default function Dashboard() {
  const { currentUser, courses, unenrollCourse, unsaveCourse, completedCourses, getCourseProgress } = useAppContext();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("enrolled");
  const [unenrollTarget, setUnenrollTarget] = useState(null);

  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const isInstructor = currentUser.role === "instructor";
  const roleColor = isInstructor ? "#d97706" : "#6366f1";

  const enrolledCourses = courses.filter((c) => currentUser.enrolledCourseIds?.includes(c.id) && !completedCourses.has(c.id));
  const completedCoursesList = courses.filter((c) => completedCourses.has(c.id));
  const savedCourses = courses.filter((c) => currentUser.savedCourseIds?.includes(c.id));
  const createdCourses = courses.filter((c) => currentUser.createdCourseIds?.includes(c.id));

  const tabs = [
    { id: "enrolled", label: "Enrolled", count: enrolledCourses.length },
    { id: "completed", label: "Completed", count: completedCoursesList.length },
    { id: "saved", label: "Saved", count: savedCourses.length },
    ...(isInstructor ? [{ id: "created", label: "Created", count: createdCourses.length }] : []),
  ];

  const getTabData = () => {
    switch (activeTab) {
      case "enrolled": return enrolledCourses;
      case "completed": return completedCoursesList;
      case "saved": return savedCourses;
      case "created": return createdCourses;
      default: return [];
    }
  };

  const activeData = getTabData();

  const emptyMessages = {
    enrolled: "No courses in progress.",
    completed: "You haven't completed any courses yet.",
    saved: "You haven't saved any courses yet.",
    created: "You haven't created any courses yet.",
  };

  return (
    <div
      className="min-h-screen bg-[#0c0c0e] text-[#e8e6e0] font-['DM_Sans',sans-serif]"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
    >
      {/* Profile banner */}
      <header className="bg-[#111114] border-b border-[rgba(255,255,255,0.06)] px-8 py-8">
        <div className="max-w-[1100px] mx-auto">
          {/* Profile row */}
          <div className="flex items-center gap-5 mb-7 flex-wrap">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-['Playfair_Display',serif] text-[1.8rem] shrink-0 border-2 border-[rgba(217,119,6,0.4)] bg-[rgba(217,119,6,0.15)] text-[#d97706]"
              aria-hidden="true"
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-['Playfair_Display',serif] text-[1.6rem] text-[#f5f2ec] mb-1">{currentUser.name}</h1>
              <p className="text-[0.88rem] text-[#6b7280] mb-2">{currentUser.email}</p>
              <span
                className="inline-block px-3 py-0.5 rounded-full text-[0.72rem] font-bold tracking-widest uppercase"
                style={{ backgroundColor: `${roleColor}20`, color: roleColor, border: `1px solid ${roleColor}40` }}
              >
                {currentUser.role}
              </span>
            </div>
            {isInstructor && (
              <Link to="/course-form" className="px-5 py-2.5 rounded-lg no-underline font-bold text-[0.88rem] bg-[#d97706] text-[#0c0c0e]">
                + Add Course
              </Link>
            )}
          </div>

          {/* Stats */}
          <dl className="flex gap-10">
            {[
              { label: "Enrolled", value: enrolledCourses.length },
              { label: "Completed", value: completedCoursesList.length },
              { label: "Saved", value: savedCourses.length },
              ...(isInstructor ? [{ label: "Created", value: createdCourses.length }] : []),
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <dd className="font-['Playfair_Display',serif] text-[1.75rem] text-[#f5f2ec] m-0">{s.value}</dd>
                <dt className="text-[0.75rem] text-[#6b7280] tracking-wide uppercase m-0">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Tabs + content */}
      <main className="max-w-[1100px] mx-auto px-8 py-8">
        {/* Tab list */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="flex gap-1 mb-8 border-b border-[rgba(255,255,255,0.07)] overflow-x-auto"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 border-none cursor-pointer text-[0.9rem] font-medium whitespace-nowrap -mb-px border-b-2 transition-colors bg-transparent"
              style={{
                color: activeTab === tab.id ? "#f5f2ec" : "#6b7280",
                borderBottomColor: activeTab === tab.id ? "#d97706" : "transparent",
              }}
            >
              {tab.label}
              <span
                className="px-2 py-0.5 rounded-full text-[0.7rem] font-bold"
                style={{
                  backgroundColor: activeTab === tab.id ? "rgba(217,119,6,0.15)" : "#1a1a1e",
                  color: activeTab === tab.id ? "#d97706" : "#6b7280",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeData.length === 0 ? (
            <section className="flex flex-col items-center py-20 px-8 text-center gap-3">
              <span className="text-[2.5rem]" aria-hidden="true">
                {activeTab === "enrolled" ? "📚" : activeTab === "completed" ? "🎓" : activeTab === "saved" ? "♡" : "✏️"}
              </span>
              <p className="text-[#6b7280] text-[0.92rem]">{emptyMessages[activeTab]}</p>
              {activeTab === "created" ? (
                <Link to="/course-form" className="no-underline font-semibold text-[0.88rem] text-[#d97706]">Create your first course →</Link>
              ) : (
                <Link to="/courses" className="no-underline font-semibold text-[0.88rem] text-[#d97706]">Browse courses →</Link>
              )}
            </section>
          ) : (
            <ul
              className="grid gap-5 list-none p-0 m-0"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))" }}
            >
              {activeData.map((course) => {
                const progress = getCourseProgress(course.id);
                return (
                  <li key={course.id} className="flex flex-col gap-2">
                    <CourseCard course={course} />

                    {/* Progress bar */}
                    {activeTab === "enrolled" && progress > 0 && (
                      <div className="flex items-center gap-3" aria-label={`${progress}% complete`}>
                        <div className="flex-1 h-1 rounded-full overflow-hidden bg-[rgba(255,255,255,0.07)]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #d97706, #f59e0b)" }}
                          />
                        </div>
                        <span className="text-[0.72rem] font-bold shrink-0 text-[#d97706]">{progress}%</span>
                      </div>
                    )}

                    {/* Completed badge */}
                    {activeTab === "completed" && (
                      <span className="self-start text-[0.78rem] font-semibold px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] text-[#22c55e]">
                        🎓 Completed
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {activeTab === "enrolled" && (
                        <button
                          onClick={() => setUnenrollTarget(course)}
                          className="px-4 py-1.5 rounded-md text-[0.8rem] font-medium cursor-pointer border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.08)] text-[#ef4444]"
                        >
                          Unenroll
                        </button>
                      )}
                      {activeTab === "saved" && (
                        <button
                          onClick={() => unsaveCourse(course.id)}
                          className="px-4 py-1.5 rounded-md text-[0.8rem] font-medium cursor-pointer border border-[rgba(255,255,255,0.08)] bg-[#1a1a1e] text-[#9ca3af]"
                        >
                          Unsave
                        </button>
                      )}
                      {activeTab === "created" && (
                        <Link
                          to={`/course-form/${course.id}`}
                          className="px-4 py-1.5 rounded-md text-[0.8rem] font-medium no-underline border border-[rgba(255,255,255,0.08)] bg-[#1a1a1e] text-[#9ca3af]"
                        >
                          ✏️ Edit
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      {/* Unenroll modal */}
      <Modal isOpen={Boolean(unenrollTarget)} onClose={() => setUnenrollTarget(null)} title="Unenroll from Course?">
        <p className="text-[#9ca3af] mb-6 text-[0.95rem] leading-relaxed">
          Are you sure you want to unenroll from{" "}
          <strong className="text-[#f5f2ec]">{unenrollTarget?.title}</strong>?
          You will lose access to all modules.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { unenrollCourse(unenrollTarget.id); setUnenrollTarget(null); }}
            className="flex-1 py-3 rounded-lg font-bold text-[0.9rem] cursor-pointer border-none text-white bg-[#ef4444]"
          >
            Yes, Unenroll
          </button>
          <button
            onClick={() => setUnenrollTarget(null)}
            className="flex-1 py-3 rounded-lg font-medium text-[0.9rem] cursor-pointer text-[#e8e6e0] border border-[rgba(255,255,255,0.12)] bg-transparent"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}