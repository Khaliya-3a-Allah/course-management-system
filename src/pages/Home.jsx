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

  const featured = courses.slice(0, 6);
  const categories = [...new Set(courses.map((c) => c.category))];
  const categoryEmojis = {
    "Web Development": "🌐",
    "Mobile Development": "📱",
    "Data Science": "📊",
    "Design": "🎨",
    "DevOps": "⚙️",
    "Cloud": "☁️",
    "AI/ML": "🤖",
    "Other": "📚"
  };

  return (
    <div
      className="min-h-screen bg-[#0c0c0e] text-[#e8e6e0] font-['DM_Sans',sans-serif]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}
    >
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(217,119,6,0.15), 0 0 40px rgba(217,119,6,0.08) } 50% { box-shadow: 0 0 30px rgba(217,119,6,0.25), 0 0 60px rgba(217,119,6,0.12) } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @media (max-width: 640px) { .hero-float-badge { display: none !important; } }
        .hero-cta { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .hero-cta:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(217,119,6,0.3); }
        .split-cta:hover { background: rgba(217,119,6,0.1); border-color: rgba(217,119,6,0.6); }
        .cat-card { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .cat-card:hover { transform: translateY(-6px); border-color: rgba(217,119,6,0.5); background: rgba(217,119,6,0.08); box-shadow: 0 12px 32px rgba(217,119,6,0.15); }
        .feature-card { transition: all 0.3s ease; }
        .feature-card:hover { transform: translateY(-8px); }
        .stat-item { animation: slide-up 0.6s ease forwards; }
        .stat-item:nth-child(1) { animation-delay: 0.1s; }
        .stat-item:nth-child(2) { animation-delay: 0.2s; }
        .stat-item:nth-child(3) { animation-delay: 0.3s; }
        .stat-item:nth-child(4) { animation-delay: 0.4s; }
      `}</style>

      {/* ── Hero ── */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden px-8 pt-20 pb-16"
        aria-labelledby="hero-heading"
      >
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#d97706] to-transparent opacity-5 rounded-full blur-3xl" style={{ animation: "float 12s ease-in-out infinite" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-[#d97706] to-transparent opacity-5 rounded-full blur-3xl" style={{ animation: "float 15s ease-in-out infinite reverse" }} />
        </div>

        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 100% 80% at 50% 30%, rgba(217,119,6,0.08) 0%, transparent 70%)" }} aria-hidden="true" />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)", backgroundSize: "80px 80px" }} aria-hidden="true" />

        <div className="relative z-10 max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#d97706] via-[#d97706] to-[#ea580c] bg-opacity-20 border border-[rgba(217,119,6,0.5)]">
            <span className="text-[0.75rem] tracking-[0.15em] uppercase font-bold text-[#fbbf24]">
              ✨ Premium Learning Platform
            </span>
          </div>

          <h1
            id="hero-heading"
            className="font-['Playfair_Display',serif] font-black leading-[1.1] text-[#f5f2ec] mb-6"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)" }}
          >
            <span className="block">Transform Your Career</span>
            <span className="inline bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">
              With Expert-Led Courses
            </span>
          </h1>

          <p className="text-[1.1rem] text-[#b4b0a6] leading-relaxed max-w-2xl mb-10">
            Learn from industry experts and master in-demand skills. Build real projects, get industry recognition, and accelerate your career growth.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link
              to="/courses"
              className="hero-cta inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold no-underline text-base bg-gradient-to-r from-[#d97706] to-[#ea580c] text-[#0c0c0e] shadow-lg"
            >
              Explore All Courses
              <span>→</span>
            </Link>
            <Link
              to="/register"
              className="split-cta inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold no-underline text-base border-2 border-[rgba(217,119,6,0.5)] bg-[rgba(217,119,6,0.1)] text-[#fbbf24] hover:bg-[rgba(217,119,6,0.15)]"
            >
              Start Free Trial
              <span>→</span>
            </Link>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-8 pt-8 border-t border-[rgba(255,255,255,0.08)]">
            <div>
              <p className="text-2xl font-bold text-[#d97706]">{courses.length}+</p>
              <p className="text-sm text-[#9ca3af]">Expert Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#d97706]">50K+</p>
              <p className="text-sm text-[#9ca3af]">Active Learners</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#d97706]">96%</p>
              <p className="text-sm text-[#9ca3af]">Satisfaction Rate</p>
            </div>
          </div>
        </div>

        {/* Hero visualization badge */}
        <div
          className="hero-float-badge absolute right-12 top-1/3 flex flex-col items-center gap-3 rounded-3xl p-8 border border-[rgba(217,119,6,0.3)] bg-gradient-to-br from-[#16161a] to-[#1a1a1f]"
          style={{ animation: "float 4s ease-in-out infinite", boxShadow: "0 0 30px rgba(217,119,6,0.1)" }}
          aria-hidden="true"
        >
          <span className="text-4xl">🎓</span>
          <div className="text-center">
            <p className="text-lg font-bold text-[#f5f2ec] m-0">{courses.length}</p>
            <p className="text-xs text-[#9ca3af] m-0">Courses</p>
          </div>
          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#d97706] to-transparent" />
          <p className="text-xs text-[#6b7280] font-semibold">Always Updated</p>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="relative py-20 px-8 bg-gradient-to-b from-[#111114] to-[#0c0c0e] border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-['Playfair_Display',serif] text-4xl text-[#f5f2ec] mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-[#9ca3af] text-lg max-w-2xl mx-auto">
              Join our community of learners and professionals transforming their careers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: "50K+", label: "Active Learners", icon: "👥" },
              { num: "98%", label: "Satisfaction Rate", icon: "⭐" },
              { num: "5K+", label: "Project Completions", icon: "🏆" },
              { num: "24/7", label: "Community Support", icon: "💬" }
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-item text-center p-8 rounded-2xl border border-[rgba(217,119,6,0.2)] bg-[#16161a] hover:bg-[#1a1a1f] transition-all duration-300"
              >
                <p className="text-4xl mb-3">{stat.icon}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-[#d97706] to-[#f59e0b] bg-clip-text text-transparent mb-2">
                  {stat.num}
                </p>
                <p className="text-[#9ca3af] text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="max-w-[1200px] mx-auto px-8 py-20" aria-labelledby="featured-heading">
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 id="featured-heading" className="font-['Playfair_Display',serif] text-4xl text-[#f5f2ec] m-0 mb-2">
                Featured Courses
              </h2>
              <p className="text-[#9ca3af]">Start learning from our most popular and highest-rated courses</p>
            </div>
            <Link to="/courses" className="no-underline text-[0.95rem] font-semibold text-[#d97706] hover:text-[#f59e0b] transition-colors flex items-center gap-2">
              Explore All
              <span>→</span>
            </Link>
          </div>
        </div>
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
      </section>

      {/* ── Categories ── */}
      <section
        className="py-20 px-8 bg-gradient-to-b from-[#0c0c0e] to-[#111114] border-t border-b border-[rgba(255,255,255,0.05)]"
        aria-labelledby="categories-heading"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12">
            <h2 id="categories-heading" className="font-['Playfair_Display',serif] text-4xl text-[#f5f2ec] mb-2">
              Browse by Category
            </h2>
            <p className="text-[#9ca3af]">Explore courses across different specializations and find your next learning path</p>
          </div>
          <ul
            className="grid gap-4 list-none p-0 m-0"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
            aria-label="Course categories"
          >
            {categories.map((cat, idx) => {
              const count = courses.filter((c) => c.category === cat).length;
              const emoji = categoryEmojis[cat] || "📚";
              return (
                <li key={cat} style={{ animation: `slide-up 0.6s ease forwards`, animationDelay: `${idx * 0.05}s` }}>
                  <Link
                    to={`/courses?category=${encodeURIComponent(cat)}`}
                    className="cat-card flex flex-col gap-3 p-6 rounded-2xl no-underline border border-[rgba(255,255,255,0.08)] bg-[#16161a] group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{emoji}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#d97706] to-[#f59e0b] bg-opacity-40 text-white">
                        {count} {count === 1 ? "course" : "courses"}
                      </span>
                    </div>
                    <span className="font-bold text-[1.05rem] text-[#f5f2ec] group-hover:text-[#fbbf24] transition-colors">{cat}</span>
                    <p className="text-[0.85rem] text-[#6b7280]">Explore this category →</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 px-8 bg-[#0c0c0e]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-['Playfair_Display',serif] text-4xl text-[#f5f2ec] mb-4">
              Why Learn With Us?
            </h2>
            <p className="text-[#9ca3af] text-lg max-w-2xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Expert Instructors",
                description: "Learn from industry professionals with real-world experience",
                icon: "👨‍🏫"
              },
              {
                title: "Hands-On Projects",
                description: "Build real projects and add them to your portfolio",
                icon: "🚀"
              },
              {
                title: "Lifetime Access",
                description: "Access course materials anytime, anywhere, forever",
                icon: "🔓"
              },
              {
                title: "Certifications",
                description: "Earn recognized certificates upon course completion",
                icon: "🏅"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="feature-card p-6 rounded-2xl border border-[rgba(217,119,6,0.15)] bg-gradient-to-br from-[#16161a] to-[#1a1a1f] hover:border-[rgba(217,119,6,0.4)]"
              >
                <p className="text-4xl mb-3">{feature.icon}</p>
                <h3 className="text-[#f5f2ec] font-bold mb-2 text-lg">{feature.title}</h3>
                <p className="text-[#9ca3af] text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA Banner ── */}
      <section
        className="relative py-24 px-8 overflow-hidden"
        aria-labelledby="cta-heading"
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(217,119,6,0.1) 0%, transparent 70%)" }} aria-hidden="true" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#d97706] to-transparent opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[#d97706] to-transparent opacity-5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 id="cta-heading" className="font-['Playfair_Display',serif] text-4xl text-[#f5f2ec] mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-[#9ca3af] text-lg mb-10">
            Start learning today with thousands of other professionals advancing their skills and achieving their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="hero-cta inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold no-underline text-base bg-gradient-to-r from-[#d97706] to-[#ea580c] text-[#0c0c0e]"
            >
              Create Free Account
              <span>→</span>
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold no-underline text-base border-2 border-[rgba(217,119,6,0.3)] text-[#e8e6e0] hover:border-[rgba(217,119,6,0.6)] hover:bg-[rgba(217,119,6,0.05)] transition-all"
            >
              Browse Courses
              <span>→</span>
            </Link>
          </div>

          <p className="text-[#6b7280] text-sm mt-8">
            No credit card required. Start learning for free.
          </p>
        </div>
      </section>
    </div>
  );
}
