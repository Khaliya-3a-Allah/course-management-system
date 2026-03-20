import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Modal from "../components/Modal";

export default function ModuleDetails() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { courses, updateCourse, currentUser, lessonProgress, markLessonComplete, markCourseComplete, completedCourses } = useAppContext();

  const course = courses.find((c) => c.id === courseId);
  const allModules = course?.modules || [];
  const currentModuleIndex = allModules.findIndex((m) => m.id === moduleId);
  const module = allModules[currentModuleIndex];

  // Use context lesson progress for this course
  const completedLessons = lessonProgress[courseId] || {};

  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [visible, setVisible] = useState(false);

  // Completion modal
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionShown, setCompletionShown] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (module) {
      setExpandedModules({ [module.id]: true });
      if (module.lessons?.length > 0) setActiveLesson(module.lessons[0]);
    }
  }, [moduleId]);

  if (!course) {
    return (
      <div style={styles.notFound}>
        <h2 style={styles.nfTitle}>Course Not Found</h2>
        <Link to="/courses" style={styles.backLink}>← All Courses</Link>
      </div>
    );
  }

  if (!module) {
    return (
      <div style={styles.notFound}>
        <h2 style={styles.nfTitle}>Module Not Found</h2>
        <Link to={`/courses/${courseId}`} style={styles.backLink}>← Back to Course</Link>
      </div>
    );
  }

  const totalLessons = allModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const completedCount = Object.keys(completedLessons).filter((k) => completedLessons[k]).length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const isModuleComplete = (mod) =>
    mod.lessons?.length > 0 && mod.lessons?.every((l) => completedLessons[l.id]);

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleMarkComplete = (lessonId) => {
    markLessonComplete(courseId, lessonId);

    // Check if all lessons complete after this mark
    const newCompleted = { ...completedLessons, [lessonId]: true };
    const newCount = Object.keys(newCompleted).filter((k) => newCompleted[k]).length;
    const newPct = totalLessons > 0 ? Math.round((newCount / totalLessons) * 100) : 0;

    if (newPct === 100 && !completionShown && !completedCourses.has(courseId)) {
      markCourseComplete(courseId);
      setTimeout(() => {
        setShowCompletion(true);
        setCompletionShown(true);
      }, 600);
    }
  };

  const activeLessonIndex = module.lessons?.indexOf(activeLesson);
  const isLastLesson = activeLessonIndex === (module.lessons?.length - 1);
  const isFirstLesson = activeLessonIndex === 0;
  const nextModule = allModules[currentModuleIndex + 1];
  const prevModule = allModules[currentModuleIndex - 1];

  const goToNextLesson = () => {
    if (!isLastLesson) setActiveLesson(module.lessons[activeLessonIndex + 1]);
  };

  const goToPrevLesson = () => {
    if (!isFirstLesson) {
      setActiveLesson(module.lessons[activeLessonIndex - 1]);
    } else if (prevModule) {
      navigate(`/courses/${courseId}/modules/${prevModule.id}`);
    }
  };

  const goToNextModule = () => {
    if (nextModule) {
      setExpandedModules({ [nextModule.id]: true });
      setActiveLesson(null);
      navigate(`/courses/${courseId}/modules/${nextModule.id}`);
    }
  };

  const handleSubmitReview = () => {
    if (selectedRating === 0) return;
    const newRating = ((course.rating || 0) + selectedRating) / 2;
    updateCourse({ ...course, rating: Math.round(newRating * 10) / 10 });
    setSubmitted(true);
  };

  return (
    <div
      style={{
        ...styles.page,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.55s ease, transform 0.55s ease",
      }}
    >
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .module-layout { grid-template-columns: 1fr !important; }
          .module-sidebar { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); max-height: 300px; overflow-y: auto; }
          .module-main { padding: 1.25rem !important; }
        }
        .module-sidebar button { background-color: #111114 !important; }
        .lesson-btn { background-color: #0e0e11 !important; }
        .lesson-btn:hover { background-color: rgba(217,119,6,0.05) !important; }
        .lesson-btn.active { background-color: rgba(217,119,6,0.07) !important; }
        .module-btn-active { background-color: rgba(217,119,6,0.06) !important; border-left: 3px solid #d97706 !important; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #d97706, #f59e0b); border-radius: 999px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .mark-complete-btn:hover { background-color: rgba(34,197,94,0.15) !important; }
        .star-btn { background: none !important; border: none !important; cursor: pointer; padding: 0 3px; font-size: 2.2rem; line-height: 1; transition: transform 0.1s; }
        .star-btn:hover { transform: scale(1.25); }
        .star-btn:disabled { cursor: default; }
        .review-textarea { width: 100%; background: #0c0c0e; border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; color: #e8e6e0; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; padding: 0.75rem 1rem; resize: vertical; min-height: 90px; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
        .review-textarea:focus { border-color: rgba(217,119,6,0.4); }
        .review-textarea::placeholder { color: #4b5563; }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarInner}>
          <Link to={`/courses/${courseId}`} style={styles.backBtn}>← {course.title}</Link>
          <span style={styles.topBarDivider}>/</span>
          <span style={styles.topBarModule}>{module.title}</span>
          <div style={styles.topBarProgress}>
            <span style={styles.topBarPct}>{progressPct}%</span>
            <div style={styles.topBarBarWrap}>
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="module-layout" style={styles.layout}>
        <aside className="module-sidebar" style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.progressHeader}>
              <p style={styles.sidebarLabel}>Course Content</p>
              <span style={styles.progressPctBig}>{progressPct}%</span>
            </div>
            <div style={styles.progressBarWrap}>
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <p style={styles.progressSub}>{completedCount} of {totalLessons} lessons completed</p>
          </div>

          <nav aria-label="Course modules">
            {allModules.map((mod, modIdx) => {
              const isCurrentModule = mod.id === moduleId;
              const isExpanded = expandedModules[mod.id];
              const modComplete = isModuleComplete(mod);
              const modCompletedCount = mod.lessons?.filter((l) => completedLessons[l.id]).length || 0;
              const modTotal = mod.lessons?.length || 0;
              const modPct = modTotal > 0 ? Math.round((modCompletedCount / modTotal) * 100) : 0;

              return (
                <div key={mod.id} style={styles.moduleGroup}>
                  <button
                    className={isCurrentModule ? "module-btn-active" : ""}
                    onClick={() => {
                      toggleModule(mod.id);
                      if (!isCurrentModule) navigate(`/courses/${courseId}/modules/${mod.id}`);
                    }}
                    style={styles.moduleBtn}
                  >
                    <span style={{ ...styles.modNum, color: modComplete ? "#22c55e" : isCurrentModule ? "#d97706" : "rgba(217,119,6,0.3)" }}>
                      {modComplete ? "✓" : String(modIdx + 1).padStart(2, "0")}
                    </span>
                    <span style={styles.modInfo}>
                      <span style={styles.modTitle}>{mod.title}</span>
                      <span style={styles.modProgressRow}>
                        <span style={styles.modProgressBarWrap}>
                          <span style={{ ...styles.modProgressFill, width: `${modPct}%`, backgroundColor: modComplete ? "#22c55e" : "#d97706" }} />
                        </span>
                        <span style={styles.modProgressText}>{modCompletedCount}/{modTotal}</span>
                      </span>
                    </span>
                    <span style={styles.modChevron}>{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {isExpanded && (
                    <div style={styles.lessonDropdown}>
                      {mod.lessons?.map((lesson, lesIdx) => {
                        const isActiveLesson = isCurrentModule && activeLesson?.id === lesson.id;
                        const isDone = completedLessons[lesson.id];
                        return (
                          <button
                            key={lesson.id}
                            className={`lesson-btn${isActiveLesson ? " active" : ""}`}
                            onClick={() => setActiveLesson(lesson)}
                            style={styles.lessonBtn}
                          >
                            <span style={{ ...styles.lessonDot, backgroundColor: isDone ? "#22c55e" : isActiveLesson ? "#d97706" : "rgba(255,255,255,0.1)", boxShadow: isActiveLesson && !isDone ? "0 0 0 2px rgba(217,119,6,0.3)" : "none" }} />
                            <span style={styles.lessonBtnText}>
                              <span style={{ ...styles.lessonBtnTitle, color: isDone ? "#6b7280" : isActiveLesson ? "#f5f2ec" : "#9ca3af", textDecoration: isDone ? "line-through" : "none" }}>
                                {lesson.title}
                              </span>
                              <span style={styles.lessonBtnDuration}>{lesson.duration}</span>
                            </span>
                            {isActiveLesson && !isDone && <span style={styles.activeIndicator}>▶</span>}
                            {isDone && <span style={styles.doneCheck}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="module-main" style={styles.main}>
          {activeLesson ? (
            <div key={activeLesson.id} style={{ animation: "fadeSlide 0.4s ease forwards" }}>
              <div style={styles.videoBox}>
                {activeLesson.videoUrl ? (
                  <video controls style={styles.videoEl} src={activeLesson.videoUrl}>Your browser does not support video.</video>
                ) : (
                  <div style={styles.videoPlaceholder}>
                    <span style={styles.playIcon}>▶</span>
                    <p style={styles.videoPlaceholderText}>No video available for this lesson</p>
                  </div>
                )}
              </div>

              <div style={styles.lessonMeta}>
                <span style={styles.lessonMetaDuration}>⏱ {activeLesson.duration}</span>
                <span style={styles.lessonMetaModule}>{module.title}</span>
                {completedLessons[activeLesson.id] && <span style={styles.lessonDoneBadge}>✓ Completed</span>}
              </div>

              <h1 style={styles.lessonTitle}>{activeLesson.title}</h1>

              <div style={styles.contentCard}>
                <p style={styles.contentLabel}>Lesson Preview</p>
                <p style={styles.contentText}>{activeLesson.contentPreview || "No preview content available for this lesson."}</p>
              </div>

              {!completedLessons[activeLesson.id] && (
                <button className="mark-complete-btn" onClick={() => handleMarkComplete(activeLesson.id)} style={styles.markCompleteBtn}>
                  ✓ Mark as Complete
                </button>
              )}

              <div style={styles.lessonNav}>
                {(!isFirstLesson || prevModule) && (
                  <button onClick={goToPrevLesson} style={styles.navBtn}>
                    ← {isFirstLesson && prevModule ? "Previous Module" : "Previous Lesson"}
                  </button>
                )}
                {!isLastLesson ? (
                  <button onClick={goToNextLesson} style={{ ...styles.navBtn, ...styles.navBtnNext }}>Next Lesson →</button>
                ) : nextModule ? (
                  <button onClick={goToNextModule} style={{ ...styles.navBtn, ...styles.navBtnNext }}>Next Module →</button>
                ) : null}
              </div>
            </div>
          ) : (
            <div style={styles.selectPrompt}>
              <span style={styles.selectIcon}>📖</span>
              <p>Select a lesson from the sidebar to begin.</p>
            </div>
          )}
        </main>
      </div>

      {/* Completion Modal */}
      <Modal isOpen={showCompletion} onClose={() => setShowCompletion(false)} title="">
        {!submitted ? (
          <div style={styles.completionInner}>
            <div style={styles.completionTop}>
              <span style={styles.completionEmoji}>🎉</span>
              <h2 style={styles.completionTitle}>Course Complete!</h2>
              <p style={styles.completionSub}>
                You've finished <strong style={{ color: "#f5f2ec" }}>{course.title}</strong>.<br />Share how it went!
              </p>
            </div>

            <div style={styles.starsSection}>
              <p style={styles.starsLabel}>Your Rating</p>
              <div style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="star-btn" onClick={() => setSelectedRating(star)} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} aria-label={`Rate ${star} stars`}>
                    <span style={{ color: star <= (hoveredStar || selectedRating) ? "#f59e0b" : "#2d2d35", transition: "color 0.12s" }}>★</span>
                  </button>
                ))}
              </div>
              {selectedRating > 0 && <p style={styles.ratingLabel}>{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][selectedRating]}</p>}
            </div>

            <div style={styles.messageSection}>
              <p style={styles.messageLabel}>Leave a review <span style={styles.optional}>(optional)</span></p>
              <textarea className="review-textarea" placeholder="What did you think of this course? What was most valuable?" value={reviewMessage} onChange={(e) => setReviewMessage(e.target.value)} rows={3} />
            </div>

            <div style={styles.completionActions}>
              <button className="submit-btn" onClick={handleSubmitReview} disabled={selectedRating === 0} style={{ ...styles.submitBtn, opacity: selectedRating === 0 ? 0.4 : 1, cursor: selectedRating === 0 ? "not-allowed" : "pointer" }}>
                Submit Review
              </button>
              <button onClick={() => setShowCompletion(false)} style={styles.skipBtn}>Skip for now</button>
            </div>
          </div>
        ) : (
          <div style={styles.completionInner}>
            <div style={styles.completionTop}>
              <span style={styles.completionEmoji}>⭐</span>
              <h2 style={styles.completionTitle}>Thanks for your review!</h2>
              <p style={styles.completionSub}>
                You rated <strong style={{ color: "#f5f2ec" }}>{course.title}</strong> {selectedRating} star{selectedRating !== 1 ? "s" : ""}.
                {reviewMessage && <span style={{ display: "block", marginTop: "0.5rem", fontStyle: "italic", color: "#6b7280" }}>"{reviewMessage}"</span>}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link to="/courses" style={styles.browseBtn} onClick={() => setShowCompletion(false)}>Browse More Courses →</Link>
              <button onClick={() => setShowCompletion(false)} style={styles.closeBtn}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0c0c0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif" },
  topBar: { backgroundColor: "#111114", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0.875rem 1.5rem" },
  topBarInner: { maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem", flexWrap: "wrap" },
  backBtn: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
  topBarDivider: { color: "#374151" },
  topBarModule: { color: "#9ca3af", fontWeight: 400, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  topBarProgress: { display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 },
  topBarPct: { fontSize: "0.75rem", fontWeight: 700, color: "#d97706", minWidth: "2.5rem", textAlign: "right" },
  topBarBarWrap: { width: "100px", height: "4px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" },
  layout: { maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 53px)" },
  sidebar: { borderRight: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111114", overflowY: "auto" },
  sidebarHeader: { padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  progressHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" },
  sidebarLabel: { fontSize: "0.65rem", letterSpacing: "0.12em", color: "#4b5563", fontWeight: 700, textTransform: "uppercase", margin: 0 },
  progressPctBig: { fontSize: "0.85rem", fontWeight: 700, color: "#d97706" },
  progressBarWrap: { width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: "999px", overflow: "hidden", marginBottom: "0.5rem" },
  progressSub: { fontSize: "0.72rem", color: "#4b5563", margin: 0 },
  moduleGroup: { borderBottom: "1px solid rgba(255,255,255,0.04)" },
  moduleBtn: { width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1.25rem", border: "none", cursor: "pointer", textAlign: "left" },
  modNum: { fontFamily: "'Playfair Display', serif", fontSize: "1rem", minWidth: "1.75rem", fontWeight: 700 },
  modInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem", minWidth: 0 },
  modTitle: { fontSize: "0.85rem", color: "#d1cfc8", fontWeight: 500, display: "block" },
  modProgressRow: { display: "flex", alignItems: "center", gap: "0.5rem" },
  modProgressBarWrap: { flex: 1, height: "3px", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: "999px", overflow: "hidden" },
  modProgressFill: { height: "100%", borderRadius: "999px", transition: "width 0.5s ease" },
  modProgressText: { fontSize: "0.65rem", color: "#4b5563", flexShrink: 0 },
  modChevron: { fontSize: "0.6rem", color: "#6b7280", flexShrink: 0 },
  lessonDropdown: { borderTop: "1px solid rgba(255,255,255,0.03)" },
  lessonBtn: { width: "100%", display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.6rem 1.25rem 0.6rem 1.5rem", border: "none", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "left" },
  lessonDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, transition: "background-color 0.3s, box-shadow 0.3s" },
  lessonBtnText: { flex: 1, display: "flex", flexDirection: "column", gap: "1px" },
  lessonBtnTitle: { fontSize: "0.82rem", fontWeight: 500, transition: "color 0.2s" },
  lessonBtnDuration: { fontSize: "0.7rem", color: "#6b7280" },
  activeIndicator: { fontSize: "0.55rem", color: "#d97706", flexShrink: 0 },
  doneCheck: { fontSize: "0.7rem", color: "#22c55e", flexShrink: 0 },
  main: { padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0c0c0e" },
  videoBox: { width: "100%", aspectRatio: "16 / 9", backgroundColor: "#16161a", borderRadius: "12px", overflow: "hidden", marginBottom: "1.25rem", border: "1px solid rgba(255,255,255,0.07)" },
  videoEl: { width: "100%", height: "100%", objectFit: "cover" },
  videoPlaceholder: { height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "#374151" },
  playIcon: { fontSize: "2.5rem" },
  videoPlaceholderText: { fontSize: "0.88rem", color: "#4b5563" },
  lessonMeta: { display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" },
  lessonMetaDuration: { fontSize: "0.8rem", color: "#6b7280" },
  lessonMetaModule: { fontSize: "0.75rem", color: "#4b5563", backgroundColor: "rgba(255,255,255,0.04)", padding: "0.15rem 0.6rem", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.06)" },
  lessonDoneBadge: { fontSize: "0.72rem", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.08)", padding: "0.15rem 0.6rem", borderRadius: "999px", border: "1px solid rgba(34,197,94,0.2)" },
  lessonTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "#f5f2ec", margin: "0 0 1.5rem", lineHeight: 1.25 },
  contentCard: { backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "1.5rem", marginBottom: "1.5rem" },
  contentLabel: { fontSize: "0.65rem", letterSpacing: "0.12em", color: "#d97706", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.75rem" },
  contentText: { color: "#9ca3af", lineHeight: 1.8, fontSize: "0.95rem", margin: 0 },
  markCompleteBtn: { display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1.25rem", backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "8px", color: "#22c55e", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", marginBottom: "1.5rem" },
  lessonNav: { display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "0.5rem" },
  navBtn: { padding: "0.7rem 1.25rem", backgroundColor: "#1a1a1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#d1cfc8", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.88rem", cursor: "pointer" },
  navBtnNext: { marginLeft: "auto", backgroundColor: "rgba(217,119,6,0.08)", borderColor: "rgba(217,119,6,0.3)", color: "#d97706" },
  selectPrompt: { height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#4b5563", fontSize: "0.95rem" },
  selectIcon: { fontSize: "2.5rem" },
  notFound: { minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#0c0c0e", gap: "1rem" },
  nfTitle: { fontFamily: "'Playfair Display', serif", color: "#f5f2ec", fontSize: "1.5rem" },
  backLink: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
  completionInner: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  completionTop: { textAlign: "center" },
  completionEmoji: { fontSize: "3rem", display: "block", marginBottom: "0.75rem" },
  completionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#f5f2ec", margin: "0 0 0.5rem" },
  completionSub: { fontSize: "0.9rem", color: "#9ca3af", lineHeight: 1.6, margin: 0 },
  starsSection: { textAlign: "center" },
  starsLabel: { fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", fontWeight: 600, marginBottom: "0.75rem" },
  starsRow: { display: "flex", justifyContent: "center", gap: "0.15rem", marginBottom: "0.5rem" },
  ratingLabel: { fontSize: "0.82rem", color: "#d97706", fontWeight: 600, margin: 0 },
  messageSection: {},
  messageLabel: { fontSize: "0.82rem", color: "#d1cfc8", fontWeight: 600, marginBottom: "0.5rem" },
  optional: { color: "#4b5563", fontWeight: 400 },
  completionActions: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  submitBtn: { width: "100%", padding: "0.85rem", backgroundColor: "#d97706", color: "#0c0c0e", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.92rem", fontFamily: "'DM Sans', sans-serif" },
  skipBtn: { width: "100%", padding: "0.75rem", backgroundColor: "transparent", color: "#6b7280", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", cursor: "pointer" },
  browseBtn: { display: "block", textAlign: "center", padding: "0.85rem", backgroundColor: "#d97706", color: "#0c0c0e", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "0.92rem" },
  closeBtn: { width: "100%", padding: "0.75rem", backgroundColor: "transparent", color: "#6b7280", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", cursor: "pointer" },
};