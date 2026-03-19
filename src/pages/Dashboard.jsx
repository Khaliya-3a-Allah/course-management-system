import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";

export default function Dashboard() {
  const { currentUser, courses } = useAppContext();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("enrolled");

  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const enrolled = courses.filter((c) => currentUser.enrolledCourseIds?.includes(c.id));
  const saved = courses.filter((c) => currentUser.savedCourseIds?.includes(c.id));
  const created = courses.filter((c) => currentUser.createdCourseIds?.includes(c.id));

  const tabs = [
    { id: "enrolled", label: "Enrolled", count: enrolled.length, data: enrolled },
    { id: "saved", label: "Saved", count: saved.length, data: saved },
    { id: "created", label: "Created", count: created.length, data: created },
  ];

  const activeData = tabs.find((t) => t.id === activeTab)?.data || [];

  const roleColor = currentUser.role === "instructor" ? "#d97706" : "#6366f1";

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
          <div style={styles.avatar} aria-hidden="true">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>{currentUser.name}</h1>
            <p style={styles.profileEmail}>{currentUser.email}</p>
            <span style={{ ...styles.roleBadge, backgroundColor: `${roleColor}20`, color: roleColor, border: `1px solid ${roleColor}40` }}>
              {currentUser.role}
            </span>
          </div>
          {currentUser.role === "instructor" && (
            <Link to="/course-form" style={styles.addCourseBtn}>
              + Add Course
            </Link>
          )}
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          {[
            { label: "Enrolled", value: enrolled.length },
            { label: "Saved", value: saved.length },
            { label: "Created", value: created.length },
          ].map((s) => (
            <div key={s.label} style={styles.stat}>
              <span style={styles.statNum}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + Content */}
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

        <div role="tabpanel">
          {activeData.length === 0 ? (
            <div style={styles.emptyTab}>
              <span style={styles.emptyIcon}>
                {activeTab === "enrolled" ? "📚" : activeTab === "saved" ? "♡" : "✏️"}
              </span>
              <p style={styles.emptyText}>
                {activeTab === "enrolled" && "You haven't enrolled in any courses yet."}
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
              {activeData.map((course) => (
                <div key={course.id} style={styles.cardWrap}>
                  <CourseCard course={course} />
                  {activeTab === "created" && (
                    <div style={styles.cardActions}>
                      <Link to={`/course-form/${course.id}`} style={styles.editBtn}>
                        ✏️ Edit
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
  tabs: { display: "flex", gap: "0.25rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "0", overflowX: "auto" },
  tab: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1.1rem", background: "none", border: "none", borderBottom: "2px solid transparent", color: "#6b7280", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", transition: "color 0.15s", marginBottom: "-1px" },
  tabActive: { color: "#f5f2ec", borderBottomColor: "#d97706" },
  tabCount: { padding: "0.1rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, backgroundColor: "#1a1a1e", color: "#6b7280" },
  tabCountActive: { backgroundColor: "rgba(217,119,6,0.15)", color: "#d97706" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))", gap: "1.25rem" },
  cardWrap: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  cardActions: { display: "flex", gap: "0.5rem" },
  editBtn: { padding: "0.45rem 1rem", backgroundColor: "#1a1a1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#9ca3af", textDecoration: "none", fontSize: "0.8rem", fontWeight: 500 },
  emptyTab: { display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 2rem", textAlign: "center", gap: "0.75rem" },
  emptyIcon: { fontSize: "2.5rem" },
  emptyText: { color: "#6b7280", fontSize: "0.92rem" },
  emptyAction: { color: "#d97706", textDecoration: "none", fontWeight: 600, fontSize: "0.88rem" },
};
