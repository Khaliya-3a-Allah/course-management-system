import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";

export default function Home() {
  const { courses } = useAppContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const featured = courses.slice(0, 4);
  const categories = [...new Set(courses.map((c) => c.category))];

  return (
    <div style={{ ...styles.page, opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @media (max-width: 640px) { .hero-float-badge { display: none !important; } }
        @media (max-width: 500px) { .card-grid { grid-template-columns: 1fr !important; } .cat-grid { grid-template-columns: 1fr 1fr !important; } }
        .hero-cta:hover { opacity:0.85; transform:translateY(-2px) !important; }
        .cat-card:hover { border-color:rgba(217,119,6,0.5)!important; background:rgba(217,119,6,0.07)!important; }
        .course-card-link:hover { transform:translateY(-3px); border-color:rgba(217,119,6,0.3)!important; }
      `}</style>

      {/* ── Hero ── */}
      <section style={styles.hero} aria-label="Hero section">
        <div style={styles.heroBg} />
        <div style={styles.heroGrid} />
        <div style={styles.heroContent}>
          <p style={styles.heroEyebrow}>Learn Without Limits</p>
          <h1 style={styles.heroTitle}>
            Master Skills That
            <br />
            <span style={styles.heroAccent}>Actually Matter.</span>
          </h1>
          <p style={styles.heroSub}>
            Browse expert-crafted courses across development, design, and beyond.
            Build real skills. Ship real projects.
          </p>
          <Link to="/courses" className="hero-cta" style={styles.heroCta}>
            Explore All Courses →
          </Link>
        </div>
        <div className="hero-float-badge" style={styles.heroFloatBadge}>
          <span style={{ fontSize: "2rem" }}>🎓</span>
          <span style={styles.floatBadgeText}>{courses.length} Courses</span>
        </div>
      </section>

      {/* ── Featured ── */}
      <section style={styles.section} aria-labelledby="featured-heading">
        <div style={styles.sectionHeader}>
          <h2 id="featured-heading" style={styles.sectionTitle}>Featured Courses</h2>
          <Link to="/courses" style={styles.seeAll}>See all →</Link>
        </div>
        <div style={styles.cardGrid}>
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={styles.catSection} aria-labelledby="categories-heading">
        <div style={styles.sectionInner}>
          <h2 id="categories-heading" style={styles.sectionTitle}>Browse by Category</h2>
          <div style={styles.catGrid}>
            {categories.map((cat) => {
              const count = courses.filter((c) => c.category === cat).length;
              return (
                <Link
                  key={cat}
                  to={`/courses?category=${encodeURIComponent(cat)}`}
                  className="cat-card"
                  style={styles.catCard}
                >
                  <span style={styles.catName}>{cat}</span>
                  <span style={styles.catCount}>{count} course{count !== 1 ? "s" : ""}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={styles.ctaBanner} aria-label="Call to action">
        <h2 style={styles.ctaTitle}>Ready to start learning?</h2>
        <p style={styles.ctaSub}>Join thousands of learners building real-world skills.</p>
        <Link to="/register" style={styles.ctaBtn}>Create Free Account →</Link>
      </section>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0c0c0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif" },
  hero: { position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", overflow: "hidden", padding: "4rem 1.25rem 3rem" },
  heroBg: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(217,119,6,0.08) 0%, transparent 70%)" },
  heroGrid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px" },
  heroContent: { position: "relative", zIndex: 2, maxWidth: "680px" },
  heroEyebrow: { fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#d97706", fontWeight: 700, marginBottom: "1.25rem" },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, lineHeight: 1.08, color: "#f5f2ec", margin: "0 0 1.25rem" },
  heroAccent: { color: "#d97706" },
  heroSub: { fontSize: "1.05rem", color: "#9ca3af", lineHeight: 1.7, maxWidth: "520px", marginBottom: "2rem" },
  heroCta: { display: "inline-block", padding: "0.9rem 2rem", backgroundColor: "#d97706", color: "#0c0c0e", borderRadius: "8px", fontWeight: 700, textDecoration: "none", fontSize: "0.95rem", letterSpacing: "0.03em", transition: "opacity 0.2s, transform 0.2s" },
  heroFloatBadge: { position: "absolute", right: "8%", top: "35%", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem 2rem", animation: "float 4s ease-in-out infinite" },
  floatBadgeText: { fontSize: "0.85rem", color: "#9ca3af", fontWeight: 600 },
  section: { maxWidth: "1200px", margin: "0 auto", padding: "4rem 1.5rem" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2rem" },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "#f5f2ec", margin: "0 0 1.5rem" },
  seeAll: { color: "#d97706", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600 },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" },
  catSection: { backgroundColor: "#111114", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "4rem 1.5rem" },
  sectionInner: { maxWidth: "1200px", margin: "0 auto" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" },
  catCard: { display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1.25rem", backgroundColor: "#0c0c0e", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", textDecoration: "none", transition: "border-color 0.2s, background 0.2s" },
  catName: { fontWeight: 600, color: "#e8e6e0", fontSize: "0.95rem" },
  catCount: { fontSize: "0.78rem", color: "#6b7280" },
  ctaBanner: { backgroundColor: "#111114", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "5rem 2rem", textAlign: "center" },
  ctaTitle: { fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#f5f2ec", marginBottom: "0.75rem" },
  ctaSub: { color: "#6b7280", marginBottom: "2rem" },
  ctaBtn: { display: "inline-block", padding: "0.85rem 2rem", backgroundColor: "#d97706", color: "#0c0c0e", borderRadius: "8px", fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" },
};
