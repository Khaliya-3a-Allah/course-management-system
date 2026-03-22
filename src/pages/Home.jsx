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
    <div
      className="min-h-screen bg-[#0c0c0e] text-[#e8e6e0] font-['DM_Sans',sans-serif]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}
    >
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @media (max-width: 640px) { .hero-float-badge { display: none !important; } }
        .hero-cta:hover { opacity:0.85; transform:translateY(-2px); }
        .cat-card:hover { border-color:rgba(217,119,6,0.5)!important; background:rgba(217,119,6,0.07)!important; }
      `}</style>

      {/* ── Hero ── */}
      <section
        className="relative min-h-[80vh] flex items-center overflow-hidden px-8 pt-16 pb-12"
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(217,119,6,0.08) 0%, transparent 70%)" }} aria-hidden="true" />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px" }} aria-hidden="true" />

        <div className="relative z-10 max-w-[680px]">
          <p className="text-[0.78rem] tracking-[0.18em] uppercase font-bold mb-5 text-[#d97706]">
            Learn Without Limits
          </p>
          <h1
            id="hero-heading"
            className="font-['Playfair_Display',serif] font-black leading-[1.08] text-[#f5f2ec] mb-5"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            Master Skills That<br />
            <span className="text-[#d97706]">Actually Matter.</span>
          </h1>
          <p className="text-[1.05rem] text-[#9ca3af] leading-[1.7] max-w-[520px] mb-8">
            Browse expert-crafted courses across development, design, and beyond.
            Build real skills. Ship real projects.
          </p>
          <Link
            to="/courses"
            className="hero-cta inline-block px-8 py-3.5 rounded-lg font-bold no-underline text-[0.95rem] tracking-wide transition-all duration-200 bg-[#d97706] text-[#0c0c0e]"
          >
            Explore All Courses →
          </Link>
        </div>

        <div
          className="hero-float-badge absolute right-[8%] top-[35%] flex flex-col items-center gap-2 rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] bg-[#16161a]"
          style={{ animation: "float 4s ease-in-out infinite" }}
          aria-hidden="true"
        >
          <span className="text-[2rem]">🎓</span>
          <span className="text-[0.85rem] text-[#9ca3af] font-semibold">{courses.length} Courses</span>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="max-w-[1200px] mx-auto px-8 py-16" aria-labelledby="featured-heading">
        <div className="flex justify-between items-baseline mb-8">
          <h2 id="featured-heading" className="font-['Playfair_Display',serif] text-[1.6rem] text-[#f5f2ec] m-0">
            Featured Courses
          </h2>
          <Link to="/courses" className="no-underline text-[0.88rem] font-semibold text-[#d97706]">
            See all →
          </Link>
        </div>
        <ul
          className="grid gap-6 list-none p-0 m-0"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
          aria-label="Featured courses"
        >
          {featured.map((course) => (
            <li key={course.id}><CourseCard course={course} /></li>
          ))}
        </ul>
      </section>

      {/* ── Categories ── */}
      <section
        className="border-t border-b border-[rgba(255,255,255,0.05)] py-16 px-8 bg-[#111114]"
        aria-labelledby="categories-heading"
      >
        <div className="max-w-[1200px] mx-auto">
          <h2 id="categories-heading" className="font-['Playfair_Display',serif] text-[1.6rem] text-[#f5f2ec] mb-6">
            Browse by Category
          </h2>
          <ul
            className="grid gap-4 list-none p-0 m-0"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
            aria-label="Course categories"
          >
            {categories.map((cat) => {
              const count = courses.filter((c) => c.category === cat).length;
              return (
                <li key={cat}>
                  <Link
                    to={`/courses?category=${encodeURIComponent(cat)}`}
                    className="cat-card flex flex-col gap-1.5 p-5 rounded-xl no-underline border border-[rgba(255,255,255,0.07)] bg-[#0c0c0e] transition-all duration-200"
                    aria-label={`${cat} — ${count} course${count !== 1 ? "s" : ""}`}
                  >
                    <span className="font-semibold text-[#e8e6e0] text-[0.95rem]">{cat}</span>
                    <span className="text-[0.78rem] text-[#6b7280]">{count} course{count !== 1 ? "s" : ""}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className="border-t border-[rgba(255,255,255,0.06)] py-20 px-8 text-center bg-[#111114]"
        aria-labelledby="cta-heading"
      >
        <h2 id="cta-heading" className="font-['Playfair_Display',serif] text-[2rem] text-[#f5f2ec] mb-3">
          Ready to start learning?
        </h2>
        <p className="text-[#6b7280] mb-8">Join thousands of learners building real-world skills.</p>
        <Link
          to="/register"
          className="inline-block px-8 py-3.5 rounded-lg font-bold no-underline text-[0.95rem] bg-[#d97706] text-[#0c0c0e]"
        >
          Create Free Account →
        </Link>
      </section>
    </div>
  );
}