import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Modal from "../components/Modal";
import { BookIcon, CapIcon, LockIcon, TargetIcon } from "../components/Icons";

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    courses, currentUser,
    enrollCourse, unenrollCourse,
    saveCourse, unsaveCourse,
    completedCourses, getCourseProgress,
    submitReview,
    addToast,
  } = useAppContext();

  const course = courses.find((c) => c.id === courseId);

  const [modalOpen, setModalOpen] = useState(false);
  const [unenrollModal, setUnenrollModal] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [visible, setVisible] = useState(false);

  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(() => currentUser?.reviews?.[courseId]?.rating ?? 0);
  const [reviewMessage, setReviewMessage] = useState(() => currentUser?.reviews?.[courseId]?.comment ?? "");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!course) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-base text-text-muted p-8 text-center">
        <span className="text-[0.75rem] tracking-[0.22em] uppercase text-text-dim mb-4">Not Found</span>
        <h2 className="font-['Playfair_Display',serif] text-[1.75rem] text-text-primary mb-2">Course Not Found</h2>
        <p className="text-text-dim mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <Link to="/courses" className="text-[#d97706] no-underline font-semibold">← Back to All Courses</Link>
      </div>
    );
  }

  const price = Number(course.price || 0);
  const isPaidCourse = price > 0;
  const owned = isPaidCourse
    ? (currentUser?.purchasedCourseIds?.includes(course.id) ?? false)
    : true;
  const enrolled = currentUser?.enrolledCourseIds?.includes(course.id) ?? false;
  const saved = currentUser?.savedCourseIds?.includes(course.id) ?? false;
  const ratingSubmitted = !!currentUser?.reviews?.[course.id];
  const isCompleted = completedCourses.has(course.id);
  const progress = getCourseProgress(course.id);
  const canAccessContent = enrolled && owned;

  const handleEnroll = () => {
    if (!currentUser) { setModalOpen(true); return; }

    if (isPaidCourse && !owned) {
      navigate(`/checkout/${course.id}`);
      return;
    }

    enrollCourse(course.id);
    addToast("You are now enrolled in this course.", "success");
  };

  const handleUnenroll = () => {
    unenrollCourse(course.id);
    setUnenrollModal(false);
  };

  const handleSaveToggle = () => {
    if (!currentUser) { setModalOpen(true); return; }
    if (saved) unsaveCourse(course.id);
    else saveCourse(course.id);
  };

  const handleSubmitRating = () => {
    if (selectedRating === 0) return;
    submitReview(course.id, selectedRating, reviewMessage);
  };

  const levelColors = { Beginner: "#22c55e", Intermediate: "#f59e0b", Advanced: "#ef4444" };

  return (
    <>
      <main
        className="min-h-screen bg-base text-text-secondary"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
      >
        <style>{`
          .star-rate-btn { background: none !important; border: none !important; cursor: pointer; padding: 0 3px; font-size: 1.8rem; line-height: 1; transition: transform 0.1s; }
          .star-rate-btn:hover { transform: scale(1.2); }
          .star-rate-btn:disabled { cursor: default; }
          .review-ta { width: 100%; background: var(--color-surface); border: 1px solid var(--color-input-border); border-radius: 8px; color: var(--color-text-secondary); font-family: 'DM Sans', sans-serif; font-size: 0.88rem; padding: 0.65rem 0.9rem; resize: vertical; min-height: 80px; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
          .review-ta:focus { border-color: rgba(217,119,6,0.4); }
          .review-ta::placeholder { color: var(--color-text-dim); }
        `}</style>

        {/* Hero */}
        <header className="relative overflow-hidden border-b border-[rgba(255,255,255,0.06)] bg-gradient-to-b from-sidebar to-base">
          <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.14)_0%,rgba(217,119,6,0)_72%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-28 right-8 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.12)_0%,rgba(245,158,11,0)_70%)]" aria-hidden="true" />

          <div className="relative z-[2] max-w-[1200px] mx-auto px-5 md:px-8 py-10 md:py-12 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
            <div>
              <Link to="/courses" className="text-[#d97706] no-underline text-[0.85rem] inline-block mb-4">← All Courses</Link>
              <div className="flex gap-[0.6rem] mb-4 flex-wrap">
                <span
                  className="px-3 py-[0.2rem] rounded-full text-[0.72rem] font-bold text-[#0c0c0e] uppercase"
                  style={{ backgroundColor: levelColors[course.level] || "#6b7280" }}
                >
                  {course.level}
                </span>
                <span className="px-3 py-[0.2rem] rounded-full text-[0.72rem] font-semibold bg-[rgba(217,119,6,0.1)] border border-[rgba(217,119,6,0.24)] text-[#d97706] uppercase">
                  {course.category}
                </span>
                {isCompleted && (
                  <span className="px-3 py-[0.2rem] rounded-full text-[0.72rem] font-bold bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] text-[#22c55e]">
                    ✓ Completed
                  </span>
                )}
              </div>

              <h1
                className="font-['Playfair_Display',serif] font-bold leading-[1.15] text-text-primary mb-[0.6rem]"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
              >
                {course.title}
              </h1>

              <p className="text-[0.95rem] text-text-muted mb-[0.8rem]">
                By <span className="text-[#d97706] font-semibold">{course.instructorName}</span>
              </p>

              <div className="flex items-center gap-[2px]" aria-label={`Rating: ${course.rating?.toFixed(1)} out of 5`}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[1.1rem]" style={{ color: i < Math.round(course.rating) ? "#f59e0b" : "#94a3b8" }} aria-hidden="true">★</span>
                ))}
                <span className="text-text-muted text-[0.9rem] ml-2">{course.rating?.toFixed(1)}</span>
              </div>
            </div>

            <figure className="m-0 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-surface p-3 shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                </div>
                <span className="text-[0.68rem] tracking-[0.14em] uppercase text-text-faint font-semibold">Course Preview</span>
              </div>

              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={`${course.title} thumbnail`}
                  className="w-full h-[220px] md:h-[300px] object-cover rounded-xl mt-3"
                  style={{ filter: "saturate(1.05) contrast(1.03)" }}
                />
              ) : (
                <div className="w-full h-[220px] md:h-[300px] rounded-xl mt-3 bg-surface-muted flex items-center justify-center text-text-dim text-[0.85rem] font-semibold">
                  No preview image
                </div>
              )}
            </figure>
          </div>
        </header>

        {/* Body */}
        <div
          className="max-w-[1200px] mx-auto px-5 py-8 grid gap-8 items-start"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}
        >
          {/* Left column */}
          <div>
            {/* About */}
            <section className="mb-10" aria-labelledby="about-heading">
              <h2
                id="about-heading"
                className="font-['Playfair_Display',serif] text-[1.25rem] text-[#f5f2ec] mb-4 pb-2 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-4"
              >
                About This Course
              </h2>
              <p className="text-[#9ca3af] leading-[1.75] text-[0.97rem]">{course.description}</p>
            </section>

            {/* Tags */}
            {course.tags?.length > 0 && (
              <section className="mb-10" aria-labelledby="topics-heading">
                <h2
                  id="topics-heading"
                  className="font-['Playfair_Display',serif] text-[1.25rem] text-[#f5f2ec] mb-4 pb-2 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-4"
                >
                  Topics
                </h2>
                <ul className="flex flex-wrap gap-2 list-none p-0 m-0" aria-label="Course topics">
                  {course.tags.map((tag) => (
                    <li key={tag}>
                      <span className="bg-[rgba(217,119,6,0.1)] border border-[rgba(217,119,6,0.25)] text-[#d97706] px-3 py-1 rounded-full text-[0.78rem] font-medium">
                        {tag}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Rating */}
            {isCompleted && enrolled && currentUser && (
              <section className="mb-10" aria-labelledby="rate-heading">
                <h2
                  id="rate-heading"
                  className="font-['Playfair_Display',serif] text-[1.25rem] text-[#f5f2ec] mb-4 pb-2 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-4"
                >
                  Rate This Course
                </h2>
                {ratingSubmitted ? (
                  <div className="flex items-start gap-4 bg-[#16161a] border border-[rgba(34,197,94,0.15)] rounded-xl p-5">
                    <span className="text-[#22c55e] shrink-0 mt-0.5" aria-hidden="true"><CapIcon size={22} /></span>
                    <div>
                      <p className="text-[0.9rem] text-[#22c55e] font-semibold mb-1">Thanks for your review!</p>
                      <p className="text-[0.85rem] text-[#6b7280] m-0 leading-[1.5]">
                        You rated this course {selectedRating} star{selectedRating !== 1 ? "s" : ""}.
                        {reviewMessage && (
                          <span className="block mt-1 italic text-[#6b7280]">"{reviewMessage}"</span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#16161a] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 flex flex-col gap-4">
                    <p className="text-[0.9rem] text-[#9ca3af] m-0">You've completed this course. How would you rate it?</p>
                    <div className="flex items-center gap-[0.1rem] flex-wrap" role="group" aria-label="Star rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className="star-rate-btn"
                          onClick={() => setSelectedRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          aria-label={`Rate ${star} stars`}
                          aria-pressed={selectedRating === star}
                        >
                          <span style={{ color: star <= (hoveredStar || selectedRating) ? "#f59e0b" : "#374151", transition: "color 0.12s" }}>★</span>
                        </button>
                      ))}
                      {selectedRating > 0 && (
                        <span className="text-[0.82rem] text-[#d97706] font-semibold ml-3">
                          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][selectedRating]}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-[0.4rem]">
                      <label className="text-[0.82rem] text-[#d1cfc8] font-semibold">
                        Leave a review <span className="text-[#4b5563] font-normal">(optional)</span>
                      </label>
                      <textarea
                        className="review-ta"
                        placeholder="What did you think? What was most valuable?"
                        value={reviewMessage}
                        onChange={(e) => setReviewMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={handleSubmitRating}
                      disabled={selectedRating === 0}
                      className="self-start px-6 py-3 bg-[#d97706] text-[#0c0c0e] border-none rounded-lg font-bold text-[0.88rem] transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Curriculum */}
            <section aria-labelledby="curriculum-heading">
              <h2
                id="curriculum-heading"
                className="font-['Playfair_Display',serif] text-[1.25rem] text-[#f5f2ec] mb-4 pb-2 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-4"
              >
                Course Curriculum
                <span className="text-[0.75rem] font-normal text-[#6b7280] ml-auto">{course.modules?.length || 0} Modules</span>
              </h2>
              {course.modules?.length === 0 && (
                <p className="text-[#6b7280] italic">No modules available yet.</p>
              )}
              <ul className="flex flex-col gap-[0.6rem] list-none p-0 m-0" aria-label="Course modules">
                {course.modules?.map((mod, idx) => (
                  <li key={mod.id}>
                    <article className="bg-[#16161a] border border-[rgba(255,255,255,0.06)] rounded-[10px] overflow-hidden">
                      <button
                        className="w-full flex items-center gap-4 px-5 py-4 bg-transparent border-none cursor-pointer text-[#e8e6e0] text-left"
                        onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                        aria-expanded={expandedModule === mod.id}
                        aria-controls={`module-${mod.id}`}
                      >
                        <span className="font-['Playfair_Display',serif] text-[1.5rem] text-[rgba(217,119,6,0.4)] min-w-[2rem]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 font-medium text-[0.95rem]">{mod.title}</span>
                        <span className="text-[0.78rem] text-[#6b7280]">{mod.lessons?.length || 0} lessons</span>
                        <span className="text-[0.65rem] text-[#6b7280]" aria-hidden="true">{expandedModule === mod.id ? "▲" : "▼"}</span>
                      </button>
                      {expandedModule === mod.id && (
                        <div id={`module-${mod.id}`} className="border-t border-[rgba(255,255,255,0.05)] px-5 pt-3 pb-5">
                          <ul className="list-none p-0 m-0" aria-label={`Lessons in ${mod.title}`}>
                            {mod.lessons?.map((lesson) => (
                              <li key={lesson.id} className="flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.04)]">
                                <span className="text-[#d97706] text-[0.65rem]" aria-hidden="true">▶</span>
                                <span className="flex-1 text-[0.88rem] text-[#d1cfc8]">{lesson.title}</span>
                                <span className="text-[0.78rem] text-[#6b7280]">{lesson.duration}</span>
                              </li>
                            ))}
                          </ul>
                          {canAccessContent ? (
                            <Link
                              to={`/courses/${course.id}/modules/${mod.id}`}
                              className="inline-block mt-4 text-[#d97706] no-underline text-[0.85rem] font-semibold"
                            >
                              Open Module →
                            </Link>
                          ) : currentUser ? (
                            <p className="mt-4 text-[0.83rem] text-[#4b5563] italic inline-flex items-center gap-2">
                              <LockIcon size={14} />
                              {isPaidCourse && !owned
                                ? "Buy this course to access modules"
                                : "Enroll in this course to access modules"}
                            </p>
                          ) : (
                            <button
                              onClick={() => setModalOpen(true)}
                              className="mt-4 px-4 py-[0.4rem] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-md text-[#4b5563] text-[0.83rem] font-medium cursor-pointer inline-flex items-center gap-2"
                            >
                              <LockIcon size={14} /> Sign in to access modules
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Side Card */}
          <aside
            className="bg-[#16161a] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden sticky top-[75px]"
            aria-label="Course enrollment"
          >
            {course.thumbnail && (
              <img src={course.thumbnail} alt="" className="w-full h-[175px] object-cover" aria-hidden="true" />
            )}
            <div className="p-6">
              <div className="flex justify-between text-[0.82rem] text-[#9ca3af] mb-5">
                <span className="inline-flex items-center gap-1.5"><BookIcon size={14} /> {course.modules?.length || 0} Modules</span>
                <span className="inline-flex items-center gap-1.5"><TargetIcon size={14} /> {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons</span>
              </div>

              {enrolled && !isCompleted && progress > 0 && (
                <div className="mb-4" aria-label={`${progress}% complete`}>
                  <div className="w-full h-[5px] bg-[rgba(255,255,255,0.07)] rounded-full overflow-hidden mb-[0.35rem]">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #d97706, #f59e0b)" }}
                    />
                  </div>
                  <span className="text-[0.72rem] text-[#d97706] font-semibold">{progress}% complete</span>
                </div>
              )}

              {isPaidCourse && !owned && (
                <div className="mb-4 rounded-lg border border-[rgba(245,158,11,0.28)] bg-[rgba(245,158,11,0.1)] px-4 py-3">
                  <p className="m-0 text-[0.72rem] tracking-[0.18em] uppercase text-[#f6c56b]">Course Price</p>
                  <p className="m-0 mt-1 text-[1.35rem] font-bold text-[#f5f2ec]">${price}</p>
                </div>
              )}

              {isCompleted ? (
                <button
                  disabled
                  className="w-full py-[0.85rem] bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.3)] rounded-lg font-bold text-[0.9rem] cursor-default mb-3"
                >
                  ✓ Completed
                </button>
              ) : (
                <button
                  onClick={enrolled ? () => setUnenrollModal(true) : handleEnroll}
                  aria-pressed={enrolled}
                  className={`w-full py-[0.85rem] rounded-lg font-bold text-[0.9rem] cursor-pointer mb-3 border-none ${
                    enrolled
                      ? "bg-[#1f2937] text-[#22c55e] border border-[rgba(34,197,94,0.25)]"
                      : "bg-[#d97706] text-[#0c0c0e]"
                  }`}
                >
                  {enrolled ? "✓ Enrolled" : isPaidCourse && !owned ? "Buy Course" : "Enroll Now"}
                </button>
              )}

              <button
                onClick={handleSaveToggle}
                aria-pressed={saved}
                className={`w-full py-3 bg-transparent rounded-lg font-medium text-[0.88rem] cursor-pointer border ${
                  saved
                    ? "border-[rgba(239,68,68,0.3)] text-[#ef4444]"
                    : "border-[rgba(255,255,255,0.1)] text-[#9ca3af]"
                }`}
              >
                {saved ? "♥ Saved" : "♡ Save Course"}
              </button>

              <hr className="border-none h-px bg-[rgba(255,255,255,0.06)] my-5" />
              <p className="text-[0.78rem] text-[#4b5563] text-center">
                {isPaidCourse
                  ? "Buy this course once to own it forever and access all lessons."
                  : "Enroll to track your progress and access all lessons."}
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Auth Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Sign In Required">
        <p className="text-[#9ca3af] mb-6 text-[0.95rem] leading-[1.6]">
          You need to be logged in to enroll or save courses.
        </p>
        <div className="flex gap-3">
          <Link
            to="/login"
            onClick={() => setModalOpen(false)}
            className="flex-1 py-3 bg-[#d97706] text-[#0c0c0e] rounded-lg text-center no-underline font-bold text-[0.9rem]"
          >
            Log In
          </Link>
          <Link
            to="/register"
            onClick={() => setModalOpen(false)}
            className="flex-1 py-3 bg-transparent text-[#e8e6e0] rounded-lg text-center no-underline font-medium text-[0.9rem]"
          >
            Register
          </Link>
        </div>
      </Modal>

      {/* Unenroll Modal */}
      <Modal isOpen={unenrollModal} onClose={() => setUnenrollModal(false)} title="Unenroll from Course?">
        <p className="text-[#9ca3af] mb-6 text-[0.95rem] leading-[1.6]">
          Are you sure you want to unenroll from{" "}
          <strong className="text-[#f5f2ec]">{course.title}</strong>? You will lose access to all modules.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleUnenroll}
            className="flex-1 py-3 bg-[#ef4444] text-white rounded-lg font-bold text-[0.9rem] border-none cursor-pointer"
          >
            Yes, Unenroll
          </button>
          <button
            onClick={() => setUnenrollModal(false)}
            className="flex-1 py-3 bg-transparent text-[#e8e6e0] rounded-lg font-medium text-[0.9rem] cursor-pointer border border-[rgba(255,255,255,0.12)]"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}