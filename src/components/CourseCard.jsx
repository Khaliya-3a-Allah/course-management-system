import { Link } from "react-router-dom";

const levelColors = {
  Beginner: "#22c55e",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} style={styles.card} aria-label={`View ${course.title}`}>
      <div style={styles.thumbWrap}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={`${course.title} thumbnail`} style={styles.thumb} />
        ) : (
          <div style={styles.thumbPlaceholder}>📚</div>
        )}
        <span
          style={{ ...styles.levelBadge, backgroundColor: levelColors[course.level] || "#6b7280" }}
        >
          {course.level}
        </span>
      </div>

      <div style={styles.body}>
        <p style={styles.category}>{course.category}</p>
        <h3 style={styles.title}>{course.title}</h3>
        <p style={styles.instructor}>by {course.instructorName}</p>

        <div style={styles.footer}>
          <div style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: i < Math.round(course.rating) ? "#f59e0b" : "#374151", fontSize: "0.75rem" }}>★</span>
            ))}
            <span style={styles.ratingNum}>{course.rating?.toFixed(1)}</span>
          </div>
          <span style={styles.modules}>{course.modules?.length || 0} modules</span>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: { display: "flex", flexDirection: "column", backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden", textDecoration: "none", transition: "border-color 0.2s, transform 0.2s", cursor: "pointer" },
  thumbWrap: { position: "relative", height: "160px", backgroundColor: "#111114" },
  thumb: { width: "100%", height: "100%", objectFit: "cover" },
  thumbPlaceholder: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" },
  levelBadge: { position: "absolute", top: "10px", left: "10px", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0c0c0e" },
  body: { padding: "1rem 1.1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 },
  category: { fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#d97706", fontWeight: 700, margin: 0 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: "#f5f2ec", margin: 0, lineHeight: 1.3 },
  instructor: { fontSize: "0.78rem", color: "#6b7280", margin: 0 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)" },
  stars: { display: "flex", alignItems: "center", gap: "1px" },
  ratingNum: { fontSize: "0.75rem", color: "#9ca3af", marginLeft: "0.35rem" },
  modules: { fontSize: "0.73rem", color: "#4b5563" },
};
