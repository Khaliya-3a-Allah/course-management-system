import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ModuleDetails() {
  const { courseId, moduleId } = useParams();
  const { courses } = useAppContext();

  const course = courses.find((c) => c.id === courseId);
  const module = course?.modules?.find((m) => m.id === moduleId);

  const [activeLesson, setActiveLesson] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Auto-select first lesson
  useEffect(() => {
    if (module?.lessons?.length > 0) {
      setActiveLesson(module.lessons[0]);
    }
  }, [module]);

  if (!course) {
    return (
      <div style={styles.notFound}>
        <span style={styles.notFoundIcon}>⚠</span>
        <h2 style={styles.notFoundTitle}>Course Not Found</h2>
        <p style={styles.notFoundSub}>No course matches this ID.</p>
        <Link to="/courses" style={styles.backLink}>← All Courses</Link>
      </div>
    );
  }

  if (!module) {
    return (
      <div style={styles.notFound}>
        <span style={styles.notFoundIcon}>⚠</span>
        <h2 style={styles.notFoundTitle}>Module Not Found</h2>
        <p style={styles.notFoundSub}>
          This module doesn't exist in the selected course.
        </p>
        <Link to={`/courses/${courseId}`} style={styles.backLink}>
          ← Back to Course
        </Link>
      </div>
    );
  }

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
        @media (max-width: 640px) {
          .module-layout { grid-template-columns: 1fr !important; }
          .module-sidebar { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); max-height: 240px; overflow-y: auto; }
          .module-main { padding: 1.25rem !important; }
        }
      `}</style>

      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarInner}>
          <Link to={`/courses/${courseId}`} style={styles.backBtn}>
            ← {course.title}
          </Link>
          <span style={styles.topBarDivider}>/</span>
          <span style={styles.topBarModule}>{module.title}</span>
        </div>
      </div>

      {/* Layout */}
      <div className="module-layout" style={styles.layout}>
        {/* Sidebar — lesson list */}
        <aside className="module-sidebar" style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <p style={styles.sidebarLabel}>MODULE</p>
            <h2 style={styles.sidebarTitle}>{module.title}</h2>
            <p style={styles.sidebarCount}>
              {module.lessons?.length || 0} Lessons
            </p>
          </div>

          <nav aria-label="Lesson list">
            {module.lessons?.length === 0 && (
              <p style={styles.noLessons}>No lessons in this module yet.</p>
            )}
            {module.lessons?.map((lesson, idx) => {
              const isActive = activeLesson?.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  style={{
                    ...styles.lessonBtn,
                    ...(isActive ? styles.lessonBtnActive : {}),
                  }}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    style={{
                      ...styles.lessonNum,
                      color: isActive ? "#d97706" : "rgba(217,119,6,0.3)",
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span style={styles.lessonBtnText}>
                    <span style={styles.lessonBtnTitle}>{lesson.title}</span>
                    <span style={styles.lessonBtnDuration}>{lesson.duration}</span>
                  </span>
                  {isActive && <span style={styles.activeIndicator}>▶</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main — lesson preview */}
        <main className="module-main" style={styles.main}>
          {activeLesson ? (
            <div
              key={activeLesson.id}
              style={{
                animation: "fadeSlide 0.4s ease forwards",
              }}
            >
              <style>{`
                @keyframes fadeSlide {
                  from { opacity: 0; transform: translateY(12px); }
                  to   { opacity: 1; transform: translateY(0); }
                }
              `}</style>

              {/* Video placeholder / embed */}
              <div style={styles.videoBox} aria-label="Video preview area">
                {activeLesson.videoUrl ? (
                  <iframe
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    allowFullScreen
                    style={styles.iframe}
                  />
                ) : (
                  <div style={styles.videoPlaceholder}>
                    <span style={styles.playIcon}>▶</span>
                    <p style={styles.videoPlaceholderText}>
                      No video available for this lesson
                    </p>
                  </div>
                )}
              </div>

              {/* Lesson info */}
              <div style={styles.lessonMeta}>
                <span style={styles.lessonMetaDuration}>
                  ⏱ {activeLesson.duration}
                </span>
              </div>

              <h1 style={styles.lessonTitle}>{activeLesson.title}</h1>

              {/* Content Preview */}
              <div style={styles.contentCard}>
                <p style={styles.contentLabel}>Lesson Preview</p>
                <p style={styles.contentText}>
                  {activeLesson.contentPreview ||
                    "No preview content available for this lesson."}
                </p>
              </div>

              {/* Prev / Next navigation */}
              <div style={styles.lessonNav}>
                {module.lessons.indexOf(activeLesson) > 0 && (
                  <button
                    onClick={() => {
                      const idx = module.lessons.indexOf(activeLesson);
                      setActiveLesson(module.lessons[idx - 1]);
                    }}
                    style={styles.navBtn}
                  >
                    ← Previous Lesson
                  </button>
                )}
                {module.lessons.indexOf(activeLesson) <
                  module.lessons.length - 1 && (
                  <button
                    onClick={() => {
                      const idx = module.lessons.indexOf(activeLesson);
                      setActiveLesson(module.lessons[idx + 1]);
                    }}
                    style={{ ...styles.navBtn, ...styles.navBtnNext }}
                  >
                    Next Lesson →
                  </button>
                )}
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
  page: {
    minHeight: "100vh",
    backgroundColor: "#0c0c0e",
    color: "#e8e6e0",
    fontFamily: "'DM Sans', sans-serif",
  },
  // Top Bar
  topBar: {
    backgroundColor: "#111114",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "0.875rem 1.5rem",
  },
  topBarInner: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.85rem",
  },
  backBtn: {
    color: "#d97706",
    textDecoration: "none",
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
  topBarDivider: { color: "#374151" },
  topBarModule: { color: "#9ca3af", fontWeight: 400 },
  // Layout
  layout: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "min(300px, 38%) 1fr",
    minHeight: "calc(100vh - 53px)",
  },
  // Sidebar
  sidebar: {
    borderRight: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "#111114",
    overflowY: "auto",
  },
  sidebarHeader: {
    padding: "1.75rem 1.25rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  sidebarLabel: {
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    color: "#4b5563",
    fontWeight: 700,
    marginBottom: "0.4rem",
    textTransform: "uppercase",
  },
  sidebarTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.1rem",
    color: "#f5f2ec",
    margin: "0 0 0.4rem",
    lineHeight: 1.3,
  },
  sidebarCount: { fontSize: "0.8rem", color: "#6b7280", margin: 0 },
  noLessons: {
    padding: "1.25rem",
    color: "#4b5563",
    fontStyle: "italic",
    fontSize: "0.88rem",
  },
  lessonBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.9rem 1.25rem",
    background: "none",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.15s",
  },
  lessonBtnActive: {
    backgroundColor: "rgba(217,119,6,0.07)",
    borderLeft: "3px solid #d97706",
  },
  lessonNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.1rem",
    minWidth: "2rem",
    transition: "color 0.15s",
  },
  lessonBtnText: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  lessonBtnTitle: { fontSize: "0.88rem", color: "#d1cfc8", fontWeight: 500 },
  lessonBtnDuration: { fontSize: "0.73rem", color: "#6b7280" },
  activeIndicator: { fontSize: "0.6rem", color: "#d97706" },
  // Main
  main: { padding: "2rem 2.5rem", overflowY: "auto" },
  videoBox: {
    width: "100%",
    aspectRatio: "16 / 9",
    backgroundColor: "#16161a",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "1.25rem",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  iframe: { width: "100%", height: "100%", border: "none" },
  videoPlaceholder: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    color: "#374151",
  },
  playIcon: { fontSize: "2.5rem" },
  videoPlaceholderText: { fontSize: "0.88rem", color: "#4b5563" },
  lessonMeta: {
    display: "flex",
    gap: "1rem",
    marginBottom: "0.75rem",
  },
  lessonMetaDuration: { fontSize: "0.8rem", color: "#6b7280" },
  lessonTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.6rem",
    color: "#f5f2ec",
    margin: "0 0 1.5rem",
    lineHeight: 1.25,
  },
  contentCard: {
    backgroundColor: "#16161a",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
    padding: "1.5rem",
    marginBottom: "2rem",
  },
  contentLabel: {
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    color: "#d97706",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: "0.75rem",
  },
  contentText: {
    color: "#9ca3af",
    lineHeight: 1.8,
    fontSize: "0.95rem",
    margin: 0,
  },
  // Prev/Next
  lessonNav: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
  },
  navBtn: {
    padding: "0.7rem 1.25rem",
    backgroundColor: "#1a1a1e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#d1cfc8",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: "0.88rem",
    cursor: "pointer",
    transition: "border-color 0.2s, color 0.2s",
  },
  navBtnNext: {
    marginLeft: "auto",
    backgroundColor: "rgba(217,119,6,0.08)",
    borderColor: "rgba(217,119,6,0.3)",
    color: "#d97706",
  },
  // Select prompt
  selectPrompt: {
    height: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    color: "#4b5563",
    fontSize: "0.95rem",
  },
  selectIcon: { fontSize: "2.5rem" },
  // Not Found
  notFound: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0c0c0e",
    color: "#9ca3af",
    padding: "2rem",
    textAlign: "center",
  },
  notFoundIcon: { fontSize: "3rem", marginBottom: "1rem" },
  notFoundTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.75rem",
    color: "#f5f2ec",
    marginBottom: "0.5rem",
  },
  notFoundSub: { marginBottom: "1.5rem", color: "#6b7280" },
  backLink: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
};
