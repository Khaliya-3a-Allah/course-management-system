import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ModuleDetails() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { courses, updateCourse, currentUser } = useAppContext();

  const course = courses.find((c) => c.id === courseId);
  const allModules = course?.modules || [];
  const currentModuleIndex = allModules.findIndex((m) => m.id === moduleId);
  const module = allModules[currentModuleIndex];

  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [visible, setVisible] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (module) {
      setExpandedModules({ [module.id]: true });
      if (module.lessons?.length > 0) {
        setActiveLesson(module.lessons[0]);
      }
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

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const activeLessonIndex = module.lessons?.indexOf(activeLesson);
  const isLastLesson = activeLessonIndex === (module.lessons?.length - 1);
  const isFirstLesson = activeLessonIndex === 0;
  const nextModule = allModules[currentModuleIndex + 1];
  const prevModule = allModules[currentModuleIndex - 1];
  const isCourseComplete = isLastLesson && !nextModule;

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
    if (nextModule) navigate(`/courses/${courseId}/modules/${nextModule.id}`);
  };

  const handleRating = (star) => {
    if (ratingSubmitted) return;
    setUserRating(star);
    // Update course rating (simple average with new rating)
    const newRating = ((course.rating || 0) + star) / 2;
    updateCourse({ ...course, rating: Math.round(newRating * 10) / 10 });
    setRatingSubmitted(true);
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
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 640px) {
          .module-layout { grid-template-columns: 1fr !important; }
          .module-sidebar { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); max-height: 240px; overflow-y: auto; }
          .module-main { padding: 1.25rem !important; }
        }
        .module-sidebar button { background-color: #111114 !important; }
        .lesson-btn { background-color: #0e0e11 !important; }
        .lesson-btn:hover { background-color: rgba(217,119,6,0.05) !important; }
        .lesson-btn.active { background-color: rgba(217,119,6,0.07) !important; }
        .module-btn-active { background-color: rgba(217,119,6,0.06) !important; border-left: 3px solid #d97706 !important; }
        .star-btn { background: none !important; border: none !important; cursor: pointer; padding: 0 4px; font-size: 2rem; transition: transform 0.1s; }
        .star-btn:hover { transform: scale(1.2); }
      `}</style>

      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarInner}>
          <Link to={`/courses/${courseId}`} style={styles.backBtn}>← {course.title}</Link>
          <span style={styles.topBarDivider}>/</span>
          <span style={styles.topBarModule}>{module.title}</span>
        </div>
      </div>

      {/* Layout */}
      <div className="module-layout" style={styles.layout}>

        {/* Sidebar */}
        <aside className="module-sidebar" style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <p style={styles.sidebarLabel}>Course Content</p>
            <p style={styles.sidebarCount}>{allModules.length} Modules</p>
          </div>

          <nav aria-label="Course modules">
            {allModules.map((mod, modIdx) => {
              const isCurrentModule = mod.id === moduleId;
              const isExpanded = expandedModules[mod.id];

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
                    <span style={{ ...styles.modNum, color: isCurrentModule ? "#d97706" : "rgba(217,119,6,0.3)" }}>
                      {String(modIdx + 1).padStart(2, "0")}
                    </span>
                    <span style={styles.modTitle}>{mod.title}</span>
                    <span style={styles.modChevron}>{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {isExpanded && (
                    <div style={styles.lessonDropdown}>
                      {mod.lessons?.map((lesson, lesIdx) => {
                        const isActiveLesson = isCurrentModule && activeLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            className={`lesson-btn${isActiveLesson ? " active" : ""}`}
                            onClick={() => {
                              if (!isCurrentModule) {
                                navigate(`/courses/${courseId}/modules/${mod.id}`);
                              } else {
                                setActiveLesson(lesson);
                              }
                            }}
                            style={styles.lessonBtn}
                          >
                            <span style={{ ...styles.lessonNum, color: isActiveLesson ? "#d97706" : "rgba(217,119,6,0.25)" }}>
                              {String(lesIdx + 1).padStart(2, "0")}
                            </span>
                            <span style={styles.lessonBtnText}>
                              <span style={{ ...styles.lessonBtnTitle, color: isActiveLesson ? "#f5f2ec" : "#9ca3af" }}>
                                {lesson.title}
                              </span>
                              <span style={styles.lessonBtnDuration}>{lesson.duration}</span>
                            </span>
                            {isActiveLesson && <span style={styles.activeIndicator}>▶</span>}
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

        {/* Main */}
        <main className="module-main" style={styles.main}>
          {activeLesson ? (
            <div key={activeLesson.id} style={{ animation: "fadeSlide 0.4s ease forwards" }}>

              <div style={styles.videoBox}>
                {activeLesson.videoUrl ? (
                  <video controls style={styles.videoEl} src={activeLesson.videoUrl}>
                    Your browser does not support video.
                  </video>
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
              </div>

              <h1 style={styles.lessonTitle}>{activeLesson.title}</h1>

              <div style={styles.contentCard}>
                <p style={styles.contentLabel}>Lesson Preview</p>
                <p style={styles.contentText}>
                  {activeLesson.contentPreview || "No preview content available for this lesson."}
                </p>
              </div>

              {/* Course Complete + Rating */}
              {isCourseComplete && (
                <div style={{ animation: "popIn 0.5s ease forwards", ...styles.completedCard }}>
                  <div style={styles.completedHeader}>
                    <span style={styles.completedEmoji}>🎉</span>
                    <div>
                      <h3 style={styles.completedTitle}>Course Complete!</h3>
                      <p style={styles.completedSub}>You've finished <strong style={{ color: "#f5f2ec" }}>{course.title}</strong></p>
                    </div>
                  </div>

                  {currentUser && (
                    <div style={styles.ratingSection}>
                      <p style={styles.ratingPrompt}>
                        {ratingSubmitted ? "Thanks for your rating!" : "How would you rate this course?"}
                      </p>
                      <div style={styles.starsRow} aria-label="Rate this course">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className="star-btn"
                            onClick={() => handleRating(star)}
                            onMouseEnter={() => !ratingSubmitted && setHoveredStar(star)}
                            onMouseLeave={() => !ratingSubmitted && setHoveredStar(0)}
                            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                            disabled={ratingSubmitted}
                          >
                            <span style={{
                              color: star <= (hoveredStar || userRating) ? "#f59e0b" : "#374151",
                              transition: "color 0.15s",
                            }}>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                      {ratingSubmitted && (
                        <p style={styles.ratingThanksSub}>
                          You rated this course {userRating} star{userRating !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}

                  <Link to="/courses" style={styles.browseMoreBtn}>Browse More Courses →</Link>
                </div>
              )}

              {/* Nav buttons */}
              <div style={{ ...styles.lessonNav, marginTop: isCourseComplete ? "1rem" : "0" }}>
                {(!isFirstLesson || prevModule) && (
                  <button onClick={goToPrevLesson} style={styles.navBtn}>
                    ← {isFirstLesson && prevModule ? "Previous Module" : "Previous Lesson"}
                  </button>
                )}

                {!isLastLesson ? (
                  <button onClick={goToNextLesson} style={{ ...styles.navBtn, ...styles.navBtnNext }}>
                    Next Lesson →
                  </button>
                ) : nextModule ? (
                  <button onClick={goToNextModule} style={{ ...styles.navBtn, ...styles.navBtnNext }}>
                    Next Module →
                  </button>
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
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0c0c0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif" },
  topBar: { backgroundColor: "#111114", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0.875rem 1.5rem" },
  topBarInner: { maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem" },
  backBtn: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
  topBarDivider: { color: "#374151" },
  topBarModule: { color: "#9ca3af", fontWeight: 400 },
  layout: { maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 53px)" },
  sidebar: { borderRight: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111114", overflowY: "auto" },
  sidebarHeader: { padding: "1.5rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  sidebarLabel: { fontSize: "0.65rem", letterSpacing: "0.12em", color: "#4b5563", fontWeight: 700, marginBottom: "0.2rem", textTransform: "uppercase" },
  sidebarCount: { fontSize: "0.8rem", color: "#6b7280", margin: 0 },
  moduleGroup: { borderBottom: "1px solid rgba(255,255,255,0.04)" },
  moduleBtn: { width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.9rem 1.25rem", border: "none", cursor: "pointer", textAlign: "left" },
  modNum: { fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", minWidth: "2rem" },
  modTitle: { flex: 1, fontSize: "0.88rem", color: "#d1cfc8", fontWeight: 500 },
  modChevron: { fontSize: "0.6rem", color: "#6b7280" },
  lessonDropdown: { borderTop: "1px solid rgba(255,255,255,0.03)" },
  lessonBtn: { width: "100%", display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.65rem 1.25rem 0.65rem 2rem", border: "none", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "left" },
  lessonNum: { fontFamily: "'Playfair Display', serif", fontSize: "0.85rem", minWidth: "1.5rem" },
  lessonBtnText: { flex: 1, display: "flex", flexDirection: "column", gap: "1px" },
  lessonBtnTitle: { fontSize: "0.82rem", fontWeight: 500 },
  lessonBtnDuration: { fontSize: "0.7rem", color: "#6b7280" },
  activeIndicator: { fontSize: "0.55rem", color: "#d97706" },
  main: { padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0c0c0e" },
  videoBox: { width: "100%", aspectRatio: "16 / 9", backgroundColor: "#16161a", borderRadius: "12px", overflow: "hidden", marginBottom: "1.25rem", border: "1px solid rgba(255,255,255,0.07)" },
  videoEl: { width: "100%", height: "100%", objectFit: "cover" },
  videoPlaceholder: { height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "#374151" },
  playIcon: { fontSize: "2.5rem" },
  videoPlaceholderText: { fontSize: "0.88rem", color: "#4b5563" },
  lessonMeta: { display: "flex", gap: "1rem", marginBottom: "0.75rem", alignItems: "center" },
  lessonMetaDuration: { fontSize: "0.8rem", color: "#6b7280" },
  lessonMetaModule: { fontSize: "0.75rem", color: "#4b5563", backgroundColor: "rgba(255,255,255,0.04)", padding: "0.15rem 0.6rem", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.06)" },
  lessonTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "#f5f2ec", margin: "0 0 1.5rem", lineHeight: 1.25 },
  contentCard: { backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "1.5rem", marginBottom: "2rem" },
  contentLabel: { fontSize: "0.65rem", letterSpacing: "0.12em", color: "#d97706", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.75rem" },
  contentText: { color: "#9ca3af", lineHeight: 1.8, fontSize: "0.95rem", margin: 0 },
  // Completed card
  completedCard: { backgroundColor: "#16161a", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "14px", padding: "1.75rem", marginBottom: "1.5rem" },
  completedHeader: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" },
  completedEmoji: { fontSize: "2.5rem" },
  completedTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#22c55e", margin: "0 0 0.25rem" },
  completedSub: { fontSize: "0.88rem", color: "#6b7280", margin: 0 },
  // Rating
  ratingSection: { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem", marginBottom: "1.25rem" },
  ratingPrompt: { fontSize: "0.9rem", color: "#9ca3af", marginBottom: "0.75rem" },
  starsRow: { display: "flex", gap: "0.25rem", marginBottom: "0.5rem" },
  ratingThanksSub: { fontSize: "0.78rem", color: "#6b7280", margin: 0 },
  browseMoreBtn: { display: "inline-block", padding: "0.65rem 1.25rem", backgroundColor: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: "8px", color: "#d97706", textDecoration: "none", fontWeight: 600, fontSize: "0.85rem" },
  // Nav
  lessonNav: { display: "flex", justifyContent: "space-between", gap: "1rem" },
  navBtn: { padding: "0.7rem 1.25rem", backgroundColor: "#1a1a1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#d1cfc8", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.88rem", cursor: "pointer" },
  navBtnNext: { marginLeft: "auto", backgroundColor: "rgba(217,119,6,0.08)", borderColor: "rgba(217,119,6,0.3)", color: "#d97706" },
  selectPrompt: { height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#4b5563", fontSize: "0.95rem" },
  selectIcon: { fontSize: "2.5rem" },
  notFound: { minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#0c0c0e", gap: "1rem" },
  nfTitle: { fontFamily: "'Playfair Display', serif", color: "#f5f2ec", fontSize: "1.5rem" },
  backLink: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
};