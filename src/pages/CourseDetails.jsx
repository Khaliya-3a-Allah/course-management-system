import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Modal from "../components/Modal";

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, currentUser, enrollCourse, unenrollCourse, saveCourse, unsaveCourse } = useAppContext();

  const course = courses.find((c) => c.id === courseId);

  const [enrolled, setEnrolled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [unenrollModal, setUnenrollModal] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (currentUser && course) {
      setEnrolled(currentUser.enrolledCourseIds?.includes(course.id));
      setSaved(currentUser.savedCourseIds?.includes(course.id));
    } else {
      setEnrolled(false);
      setSaved(false);
    }
  }, [currentUser, course]);

  if (!course) {
    return (
      <div style={styles.notFound}>
        <span style={styles.notFoundIcon}>⚠</span>
        <h2 style={styles.notFoundTitle}>Course Not Found</h2>
        <p style={styles.notFoundSub}>
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/courses" style={styles.backLink}>
          ← Back to All Courses
        </Link>
      </div>
    );
  }

  const handleEnroll = () => {
    if (!currentUser) { setModalOpen(true); return; }
    enrollCourse(course.id);
    setEnrolled(true);
  };

  const handleUnenroll = () => {
    unenrollCourse(course.id);
    setEnrolled(false);
    setUnenrollModal(false);
  };

  const handleSaveToggle = () => {
    if (!currentUser) { setModalOpen(true); return; }
    if (saved) {
      unsaveCourse(course.id);
      setSaved(false);
    } else {
      saveCourse(course.id);
      setSaved(true);
    }
  };

  const levelColors = {
    Beginner: "#22c55e",
    Intermediate: "#f59e0b",
    Advanced: "#ef4444",
  };

  return (
    <>
      <div
        style={{
          ...styles.page,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* ── Hero Banner ── */}
        <div style={styles.hero}>
          <div style={styles.heroOverlay} />
          {course.thumbnail && (
            <img src={course.thumbnail} alt={`${course.title} thumbnail`} style={styles.heroBg} />
          )}
          <div style={styles.heroContent}>
            <Link to="/courses" style={styles.breadcrumb}>← All Courses</Link>
            <div style={styles.metaRow}>
              <span style={{ ...styles.levelBadge, backgroundColor: levelColors[course.level] || "#6b7280" }}>
                {course.level}
              </span>
              <span style={styles.categoryBadge}>{course.category}</span>
            </div>
            <h1 style={styles.heroTitle}>{course.title}</h1>
            <p style={styles.heroInstructor}>
              By <span style={styles.instructorName}>{course.instructorName}</span>
            </p>
            <div style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ ...styles.star, color: i < Math.round(course.rating) ? "#f59e0b" : "#4b5563" }}>★</span>
              ))}
              <span style={styles.ratingNum}>{course.rating?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={styles.body}>
          {/* Left Column */}
          <div style={styles.leftCol}>
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>About This Course</h2>
              <p style={styles.description}>{course.description}</p>
            </section>

            {course.tags?.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Topics</h2>
                <div style={styles.tagList}>
                  {course.tags.map((tag) => (
                    <span key={tag} style={styles.tag}>{tag}</span>
                  ))}
                </div>
              </section>
            )}

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>
                Course Curriculum
                <span style={styles.moduleCount}>{course.modules?.length || 0} Modules</span>
              </h2>

              {course.modules?.length === 0 && (
                <p style={styles.emptyModules}>No modules available yet.</p>
              )}

              <div style={styles.moduleList}>
                {course.modules?.map((mod, idx) => (
                  <div key={mod.id} style={styles.moduleCard}>
                    <button
                      style={styles.moduleHeader}
                      onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                      aria-expanded={expandedModule === mod.id}
                    >
                      <span style={styles.moduleIndex}>{String(idx + 1).padStart(2, "0")}</span>
                      <span style={styles.moduleTitle}>{mod.title}</span>
                      <span style={styles.lessonCount}>{mod.lessons?.length || 0} lessons</span>
                      <span style={styles.chevron}>{expandedModule === mod.id ? "▲" : "▼"}</span>
                    </button>

                    {expandedModule === mod.id && (
                      <div style={styles.lessonList}>
                        {mod.lessons?.map((lesson) => (
                          <div key={lesson.id} style={styles.lessonRow}>
                            <span style={styles.lessonIcon}>▶</span>
                            <span style={styles.lessonTitle}>{lesson.title}</span>
                            <span style={styles.lessonDuration}>{lesson.duration}</span>
                          </div>
                        ))}

                        {enrolled ? (
                          <Link to={`/courses/${course.id}/modules/${mod.id}`} style={styles.viewModuleBtn}>
                            Open Module →
                          </Link>
                        ) : currentUser ? (
                          <p style={styles.lockedMsg}>🔒 Enroll in this course to access modules</p>
                        ) : (
                          <button onClick={() => setModalOpen(true)} style={styles.lockedBtn}>
                            🔒 Sign in to access modules
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right — Sticky Card */}
          <aside style={styles.sideCard}>
            {course.thumbnail && (
              <img src={course.thumbnail} alt="" style={styles.cardThumb} />
            )}
            <div style={styles.cardBody}>
              <div style={styles.cardMeta}>
                <span>📚 {course.modules?.length || 0} Modules</span>
                <span>🎯 {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons</span>
              </div>

              {/* Enroll / Unenroll button */}
              <button
                onClick={enrolled ? () => setUnenrollModal(true) : handleEnroll}
                style={enrolled ? styles.enrolledBtn : styles.enrollBtn}
                aria-label={enrolled ? "Unenroll from course" : `Enroll in ${course.title}`}
              >
                {enrolled ? "✓ Enrolled" : "Enroll Now"}
              </button>

              {/* Save / Unsave button */}
              <button
                onClick={handleSaveToggle}
                style={saved ? styles.savedBtn : styles.saveBtn}
                aria-label={saved ? "Unsave course" : `Save ${course.title}`}
              >
                {saved ? "♥ Saved" : "♡ Save Course"}
              </button>

              <div style={styles.divider} />
              <p style={styles.cardNote}>Enroll to track your progress and access all lessons.</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Auth Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Sign In Required">
        <p style={styles.modalText}>You need to be logged in to enroll or save courses.</p>
        <div style={styles.modalActions}>
          <Link to="/login" style={styles.modalLoginBtn} onClick={() => setModalOpen(false)}>Log In</Link>
          <Link to="/register" style={styles.modalRegisterBtn} onClick={() => setModalOpen(false)}>Register</Link>
        </div>
      </Modal>

      {/* Unenroll Confirmation Modal */}
      <Modal isOpen={unenrollModal} onClose={() => setUnenrollModal(false)} title="Unenroll from Course?">
        <p style={styles.modalText}>
          Are you sure you want to unenroll from{" "}
          <strong style={{ color: "#f5f2ec" }}>{course.title}</strong>?
          You will lose access to all modules.
        </p>
        <div style={styles.modalActions}>
          <button onClick={handleUnenroll} style={styles.modalLoginBtn}>Yes, Unenroll</button>
          <button onClick={() => setUnenrollModal(false)} style={{ ...styles.modalRegisterBtn, cursor: "pointer", border: "1px solid rgba(255,255,255,0.12)" }}>
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0c0c0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif" },
  hero: { position: "relative", minHeight: "420px", display: "flex", alignItems: "flex-end", overflow: "hidden" },
  heroBg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(40%) brightness(0.35)" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to top, #0c0c0e 40%, rgba(12,12,14,0.5) 100%)", zIndex: 1 },
  heroContent: { position: "relative", zIndex: 2, padding: "2.5rem 2rem 2.5rem", maxWidth: "820px", width: "100%" },
  breadcrumb: { color: "#d97706", textDecoration: "none", fontSize: "0.85rem", letterSpacing: "0.05em", display: "inline-block", marginBottom: "1rem" },
  metaRow: { display: "flex", gap: "0.6rem", marginBottom: "1rem" },
  levelBadge: { padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", color: "#0c0c0e", textTransform: "uppercase" },
  categoryBadge: { padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#d1cfc8", textTransform: "uppercase" },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, margin: "0 0 0.6rem", color: "#f5f2ec" },
  heroInstructor: { fontSize: "0.95rem", color: "#9ca3af", marginBottom: "0.8rem" },
  instructorName: { color: "#d97706", fontWeight: 600 },
  ratingRow: { display: "flex", alignItems: "center", gap: "2px" },
  star: { fontSize: "1.1rem" },
  ratingNum: { color: "#9ca3af", fontSize: "0.9rem", marginLeft: "0.5rem" },
  body: { maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "2rem", alignItems: "start" },
  leftCol: {},
  section: { marginBottom: "2.5rem" },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", color: "#f5f2ec", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "1rem" },
  moduleCount: { fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#6b7280", marginLeft: "auto", letterSpacing: "0.05em" },
  description: { color: "#9ca3af", lineHeight: 1.75, fontSize: "0.97rem" },
  tagList: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  tag: { backgroundColor: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.25)", color: "#d97706", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 500 },
  moduleList: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  emptyModules: { color: "#6b7280", fontStyle: "italic" },
  moduleCard: { backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" },
  moduleHeader: { width: "100%", display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", background: "none", border: "none", cursor: "pointer", color: "#e8e6e0", textAlign: "left" },
  moduleIndex: { fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "rgba(217,119,6,0.4)", minWidth: "2rem" },
  moduleTitle: { flex: 1, fontWeight: 500, fontSize: "0.95rem" },
  lessonCount: { fontSize: "0.78rem", color: "#6b7280" },
  chevron: { fontSize: "0.65rem", color: "#6b7280" },
  lessonList: { borderTop: "1px solid rgba(255,255,255,0.05)", padding: "0.75rem 1.25rem 1.25rem" },
  lessonRow: { display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  lessonIcon: { color: "#d97706", fontSize: "0.65rem" },
  lessonTitle: { flex: 1, fontSize: "0.88rem", color: "#d1cfc8" },
  lessonDuration: { fontSize: "0.78rem", color: "#6b7280" },
  viewModuleBtn: { display: "inline-block", marginTop: "1rem", color: "#d97706", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.03em" },
  lockedBtn: { display: "inline-block", marginTop: "1rem", padding: "0.4rem 1rem", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#4b5563", fontSize: "0.83rem", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  lockedMsg: { marginTop: "1rem", fontSize: "0.83rem", color: "#4b5563", fontStyle: "italic" },
  sideCard: { backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden", position: "sticky", top: "75px" },
  cardThumb: { width: "100%", height: "175px", objectFit: "cover" },
  cardBody: { padding: "1.5rem" },
  cardMeta: { display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#9ca3af", marginBottom: "1.25rem" },
  enrollBtn: { width: "100%", padding: "0.85rem", backgroundColor: "#d97706", color: "#0c0c0e", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", marginBottom: "0.75rem", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" },
  enrolledBtn: { width: "100%", padding: "0.85rem", backgroundColor: "#1f2937", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "8px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", marginBottom: "0.75rem", fontFamily: "'DM Sans', sans-serif" },
  saveBtn: { width: "100%", padding: "0.75rem", backgroundColor: "transparent", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontWeight: 500, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  savedBtn: { width: "100%", padding: "0.75rem", backgroundColor: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", fontWeight: 500, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  divider: { height: "1px", backgroundColor: "rgba(255,255,255,0.06)", margin: "1.25rem 0" },
  cardNote: { fontSize: "0.78rem", color: "#4b5563", textAlign: "center" },
  notFound: { minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#0c0c0e", color: "#9ca3af", padding: "2rem", textAlign: "center" },
  notFoundIcon: { fontSize: "3rem", marginBottom: "1rem" },
  notFoundTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", color: "#f5f2ec", marginBottom: "0.5rem" },
  notFoundSub: { marginBottom: "1.5rem", color: "#6b7280" },
  backLink: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
  modalText: { color: "#9ca3af", marginBottom: "1.5rem", fontSize: "0.95rem", lineHeight: 1.6 },
  modalActions: { display: "flex", gap: "0.75rem" },
  modalLoginBtn: { flex: 1, padding: "0.75rem", backgroundColor: "#d97706", color: "#0c0c0e", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  modalRegisterBtn: { flex: 1, padding: "0.75rem", backgroundColor: "transparent", color: "#e8e6e0", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontWeight: 500, fontSize: "0.9rem" },
};