import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import ResourceState from "../components/ResourceState";

export default function Home() {
  const { courses, coursesStatus, coursesError, fetchCourses } = useAppContext();
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
<<<<<<< Updated upstream
        <div style={styles.cardGrid}>
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
=======
      </section>

      {/* ── Stats Section ── */}
      <section className="relative py-14 md:py-20 px-4 md:px-8 bg-gradient-to-b from-sidebar to-base border-b border-[rgba(255,255,255,0.05)]" aria-labelledby="stats-heading">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 id="stats-heading" className="font-['Playfair_Display',serif] text-4xl text-text-primary mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Join our community of learners and professionals transforming their careers
            </p>
          </div>

          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="stat-item text-center p-4 md:p-8 rounded-2xl border border-[rgba(217,119,6,0.2)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] hover:bg-surface-muted transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl border border-[rgba(217,119,6,0.35)] bg-[rgba(217,119,6,0.08)] flex items-center justify-center text-[#fbbf24]">
                  <AppIcon name={stat.icon} className="w-7 h-7" />
                </div>
                <dd className="text-3xl font-bold tabular-nums tracking-tight bg-gradient-to-r from-[#d97706] to-[#f59e0b] bg-clip-text text-transparent mb-2 m-0">
                  {stat.format(animateNumber(stat.target, stat.delay))}
                </dd>
                <dt className="text-text-muted text-sm m-0">{stat.label}</dt>
                <div className="mt-3 h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden" aria-hidden="true">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[#d97706] to-[#f59e0b] transition-[width] duration-300"
                    style={{ width: `${Math.min(Math.max((countElapsedMs - 250 - stat.delay) / 23.5, 0), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-8 py-14 md:py-20" aria-labelledby="featured-heading">
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
            <div>
              <p className="text-[0.72rem] tracking-[0.2em] uppercase text-[#f6c56b] mb-2">Editor&apos;s Picks</p>
              <h2 id="featured-heading" className="font-['Playfair_Display',serif] text-4xl text-text-primary m-0 mb-2">
                Featured Courses
              </h2>
              <p className="text-text-muted">Start learning from our most popular and highest-rated courses</p>
            </div>
            <Link to="/courses" className="no-underline text-[0.95rem] font-semibold text-[#d97706] hover:text-[#f59e0b] transition-colors flex items-center gap-2">
              Explore All
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <ResourceState
          status={coursesStatus}
          error={coursesError}
          onRetry={fetchCourses}
          loadingLabel="Loading featured courses…"
          isEmpty={featured.length === 0}
          emptyLabel="New courses coming soon."
        >
          <ul
            className="grid gap-6 list-none p-0 m-0"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
            aria-label="Featured courses"
          >
            {featured.map((course) => (
              <li key={course.id} className="transition-all duration-300" style={{ animation: "slide-up 0.6s ease forwards" }}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        </ResourceState>
>>>>>>> Stashed changes
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
