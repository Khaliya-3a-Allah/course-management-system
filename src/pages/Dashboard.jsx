import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import Modal from "../components/Modal";
<<<<<<< Updated upstream
=======
import TwoFactorEnroll from "../components/TwoFactorEnroll";
import {
  validateName,
  validatePhone,
  validateBio,
  validateExpertise,
  validateOptionalUrl,
  sanitizeInput,
} from "../utils/validators";
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  const isInstructor = currentUser.role === "instructor";
=======
  const enrolledCourses = useMemo(
    () => courses.filter((c) => currentUser?.enrolledCourseIds?.includes(c.id) && !completedCourses.has(c.id)),
    [courses, currentUser?.enrolledCourseIds, completedCourses]
  );
  const completedCoursesList = useMemo(
    () => courses.filter((c) => completedCourses.has(c.id)),
    [courses, completedCourses]
  );
  const savedCourses = useMemo(
    () => courses.filter((c) => currentUser?.savedCourseIds?.includes(c.id)),
    [courses, currentUser?.savedCourseIds]
  );
  const createdCourses = useMemo(
    () => {
      if (!currentUser) return [];
      if (currentUser.role === "admin") return courses;
      return courses.filter((c) => c.instructorId && c.instructorId === currentUser.id);
    },
    [courses, currentUser]
  );
>>>>>>> Stashed changes

  const enrolledCourses = courses.filter((c) =>
    currentUser.enrolledCourseIds?.includes(c.id) && !completedCourses.has(c.id)
  );
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
  const roleColor = isInstructor ? "#d97706" : "#6366f1";

<<<<<<< Updated upstream
  const handleUnenrollConfirm = () => {
    if (!unenrollTarget) return;
    unenrollCourse(unenrollTarget.id);
    setUnenrollTarget(null);
=======
  const emptyMessages = {
    enrolled: "No courses in progress.",
    completed: "You haven't completed any courses yet.",
    saved: "You haven't saved any courses yet.",
    created: "You haven't created any courses yet.",
  };

  const openProfileEditor = () => {
    setProfileForm({
      name: currentUser.name || "",
      phone: currentUser.phone || "",
      bio: currentUser.bio || "",
      expertise: currentUser.expertise || "",
      website: currentUser.website || "",
      profileImage: currentUser.profileImage || "",
    });
    setProfileErrors({});
    setShowProfileModal(true);
  };

  const updateProfileField = (key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
    if (profileErrors[key]) {
      setProfileErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileErrors((prev) => ({ ...prev, profileImage: "Please upload an image file." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfileField("profileImage", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const errors = {
      name: validateName(profileForm.name),
      phone: validatePhone(profileForm.phone),
      bio: validateBio(profileForm.bio),
      expertise: isInstructor ? validateExpertise(profileForm.expertise) : "",
      website: isInstructor ? validateOptionalUrl(profileForm.website) : "",
      profileImage: "",
    };

    const hasErrors = Object.values(errors).some(Boolean);
    setProfileErrors(errors);
    if (hasErrors) return;

    try {
      await updateProfile({
        name: sanitizeInput(profileForm.name),
        phone: sanitizeInput(profileForm.phone),
        bio: sanitizeInput(profileForm.bio),
        expertise: isInstructor ? sanitizeInput(profileForm.expertise) : "",
        website: isInstructor ? profileForm.website.trim() : "",
        profileImage: profileForm.profileImage,
      });
      setShowProfileModal(false);
      addToast("Profile updated successfully.", "success");
    } catch (error) {
      addToast(
        error.message || "Could not save your profile. Please try again.",
        "error"
      );
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteCourse(target.id);
      addToast("Course deleted successfully.", "success");
    } catch (error) {
      if (error.status === 403) {
        addToast("You are not authorized to delete this course.", "error");
        return;
      }
      if (error.status === 401) {
        addToast("Your session has expired. Please sign in again.", "error");
        navigate("/login");
        return;
      }
      addToast(error.message || "Could not delete this course.", "error");
    }
>>>>>>> Stashed changes
  };

  return (
    <div
      style={{
        ...styles.page,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* Profile Header */}
      <div style={styles.profileBanner}>
        <div style={styles.profileInner}>
          <div style={styles.avatar}>{currentUser.name.charAt(0).toUpperCase()}</div>
          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>{currentUser.name}</h1>
            <p style={styles.profileEmail}>{currentUser.email}</p>
            <span style={{ ...styles.roleBadge, backgroundColor: `${roleColor}20`, color: roleColor, border: `1px solid ${roleColor}40` }}>
              {currentUser.role}
            </span>
          </div>
          {isInstructor && (
            <Link to="/course-form" style={styles.addCourseBtn}>+ Add Course</Link>
          )}
        </div>

        <div style={styles.stats}>
          {[
            { label: "Enrolled", value: enrolledCourses.length },
            { label: "Completed", value: completedCoursesList.length },
            { label: "Saved", value: savedCourses.length },
            ...(isInstructor ? [{ label: "Created", value: createdCourses.length }] : []),
          ].map((s) => (
            <div key={s.label} style={styles.stat}>
              <span style={styles.statNum}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.body}>
        <div style={styles.tabs} role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            >
              {tab.label}
              <span style={activeTab === tab.id ? { ...styles.tabCount, ...styles.tabCountActive } : styles.tabCount}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

<<<<<<< Updated upstream
        <div role="tabpanel">
=======
        {/* Security section */}
        <div className="mb-6">
          <TwoFactorEnroll />
        </div>

        {/* Tab panel */}
        <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} tabIndex={0} className="dash-surface rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 md:p-5">
>>>>>>> Stashed changes
          {activeData.length === 0 ? (
            <div style={styles.emptyTab}>
              <span style={styles.emptyIcon}>
                {activeTab === "enrolled" ? "📚" : activeTab === "completed" ? "🎓" : activeTab === "saved" ? "♡" : "✏️"}
              </span>
              <p style={styles.emptyText}>
                {activeTab === "enrolled" && "No courses in progress."}
                {activeTab === "completed" && "You haven't completed any courses yet."}
                {activeTab === "saved" && "You haven't saved any courses yet."}
                {activeTab === "created" && "You haven't created any courses yet."}
              </p>
              {activeTab === "created" ? (
                <Link to="/course-form" style={styles.emptyAction}>Create your first course →</Link>
              ) : (
                <Link to="/courses" style={styles.emptyAction}>Browse courses →</Link>
              )}
            </div>
          ) : (
            <div style={styles.grid}>
              {activeData.map((course) => {
                const progress = getCourseProgress(course.id);
                const isCompleted = completedCourses.has(course.id);
                return (
                  <div key={course.id} style={styles.cardWrap}>
                    <CourseCard course={course} />

                    {/* Progress bar for enrolled courses */}
                    {activeTab === "enrolled" && progress > 0 && (
                      <div style={styles.cardProgressWrap}>
                        <div style={styles.cardProgressBg}>
                          <div style={{ ...styles.cardProgressFill, width: `${progress}%` }} />
                        </div>
                        <span style={styles.cardProgressPct}>{progress}%</span>
                      </div>
                    )}

                    {/* Completed badge */}
                    {activeTab === "completed" && (
                      <div style={styles.completedBadgeRow}>
                        <span style={styles.completedBadge}>🎓 Completed</span>
                      </div>
                    )}

                    <div style={styles.cardActions}>
                      {activeTab === "enrolled" && (
                        <button onClick={() => setUnenrollTarget(course)} style={styles.unenrollBtn}>
                          Unenroll
                        </button>
                      )}
                      {activeTab === "saved" && (
                        <button onClick={() => unsaveCourse(course.id)} style={styles.unsaveBtn}>
                          Unsave
                        </button>
                      )}
                      {activeTab === "created" && (
                        <Link to={`/course-form/${course.id}`} style={styles.editBtn}>✏️ Edit</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Unenroll Modal */}
      <Modal isOpen={Boolean(unenrollTarget)} onClose={() => setUnenrollTarget(null)} title="Unenroll from Course?">
        <p style={styles.modalText}>
          Are you sure you want to unenroll from{" "}
          <strong style={{ color: "#f5f2ec" }}>{unenrollTarget?.title}</strong>?
          You will lose access to all modules.
        </p>
        <div style={styles.modalActions}>
          <button onClick={handleUnenrollConfirm} style={styles.modalConfirmBtn}>Yes, Unenroll</button>
          <button onClick={() => setUnenrollTarget(null)} style={styles.modalCancelBtn}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0c0c0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif" },
  profileBanner: { backgroundColor: "#111114", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "2rem 1.25rem" },
  profileInner: { maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.75rem", flexWrap: "wrap" },
  avatar: { width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "rgba(217,119,6,0.15)", border: "2px solid rgba(217,119,6,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "#d97706", flexShrink: 0 },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "#f5f2ec", margin: "0 0 0.25rem" },
  profileEmail: { fontSize: "0.88rem", color: "#6b7280", margin: "0 0 0.5rem" },
  roleBadge: { display: "inline-block", padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  addCourseBtn: { padding: "0.7rem 1.25rem", backgroundColor: "#d97706", color: "#0c0c0e", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "0.88rem" },
  stats: { maxWidth: "1100px", margin: "0 auto", display: "flex", gap: "2.5rem" },
  stat: { display: "flex", flexDirection: "column", gap: "0.2rem" },
  statNum: { fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", color: "#f5f2ec" },
  statLabel: { fontSize: "0.75rem", color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase" },
  body: { maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.25rem" },
  tabs: { display: "flex", gap: "0.25rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto" },
  tab: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1.1rem", background: "none", border: "none", borderBottom: "2px solid transparent", color: "#6b7280", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", marginBottom: "-1px", whiteSpace: "nowrap" },
  tabActive: { color: "#f5f2ec", borderBottomColor: "#d97706" },
  tabCount: { padding: "0.1rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, backgroundColor: "#1a1a1e", color: "#6b7280" },
  tabCountActive: { backgroundColor: "rgba(217,119,6,0.15)", color: "#d97706" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))", gap: "1.25rem" },
  cardWrap: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  cardProgressWrap: { display: "flex", alignItems: "center", gap: "0.75rem" },
  cardProgressBg: { flex: 1, height: "4px", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: "999px", overflow: "hidden" },
  cardProgressFill: { height: "100%", background: "linear-gradient(90deg, #d97706, #f59e0b)", borderRadius: "999px", transition: "width 0.5s ease" },
  cardProgressPct: { fontSize: "0.72rem", color: "#d97706", fontWeight: 700, flexShrink: 0 },
  completedBadgeRow: { display: "flex" },
  completedBadge: { fontSize: "0.78rem", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.08)", padding: "0.25rem 0.75rem", borderRadius: "999px", border: "1px solid rgba(34,197,94,0.2)", fontWeight: 600 },
  cardActions: { display: "flex", gap: "0.5rem" },
  editBtn: { padding: "0.45rem 1rem", backgroundColor: "#1a1a1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#9ca3af", textDecoration: "none", fontSize: "0.8rem", fontWeight: 500 },
  unenrollBtn: { padding: "0.45rem 1rem", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", color: "#ef4444", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  unsaveBtn: { padding: "0.45rem 1rem", backgroundColor: "#1a1a1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#9ca3af", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  emptyTab: { display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 2rem", textAlign: "center", gap: "0.75rem" },
  emptyIcon: { fontSize: "2.5rem" },
  emptyText: { color: "#6b7280", fontSize: "0.92rem" },
  emptyAction: { color: "#d97706", textDecoration: "none", fontWeight: 600, fontSize: "0.88rem" },
  modalText: { color: "#9ca3af", marginBottom: "1.5rem", fontSize: "0.95rem", lineHeight: 1.6 },
  modalActions: { display: "flex", gap: "0.75rem" },
  modalConfirmBtn: { flex: 1, padding: "0.75rem", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  modalCancelBtn: { flex: 1, padding: "0.75rem", backgroundColor: "transparent", color: "#e8e6e0", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
};