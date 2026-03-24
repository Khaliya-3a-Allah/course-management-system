import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";

function AppIcon({ name, className = "w-6 h-6", strokeWidth = 1.9 }) {
  const base = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const icons = {
    spark: (
      <>
        <path {...base} d="M12 3v4M12 17v4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M3 12h4M17 12h4M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" />
      </>
    ),
    cap: (
      <>
        <path {...base} d="M3 9.5L12 5l9 4.5L12 14 3 9.5Z" />
        <path {...base} d="M6.5 11.1V15c0 1.8 2.7 3.3 5.5 3.3s5.5-1.5 5.5-3.3v-3.9" />
      </>
    ),
    users: (
      <>
        <path {...base} d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
        <circle {...base} cx="9.5" cy="8" r="3" />
        <path {...base} d="M21 19v-1a3.5 3.5 0 0 0-2.8-3.4" />
        <path {...base} d="M15.5 5.2a3 3 0 0 1 0 5.6" />
      </>
    ),
    star: (
      <>
        <path {...base} d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </>
    ),
    trophy: (
      <>
        <path {...base} d="M8 4h8v3a4 4 0 0 1-8 0V4Z" />
        <path {...base} d="M8 7H6a2 2 0 0 1-2-2V4h4" />
        <path {...base} d="M16 7h2a2 2 0 0 0 2-2V4h-4" />
        <path {...base} d="M12 11v4" />
        <path {...base} d="M9 20h6" />
        <path {...base} d="M10 15h4" />
      </>
    ),
    chat: (
      <>
        <path {...base} d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H6l-3 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5Z" />
      </>
    ),
    globe: (
      <>
        <circle {...base} cx="12" cy="12" r="9" />
        <path {...base} d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    mobile: (
      <>
        <rect {...base} x="7" y="3" width="10" height="18" rx="2" />
        <path {...base} d="M11 18h2" />
      </>
    ),
    chart: (
      <>
        <path {...base} d="M4 19V5M10 19v-6M16 19V9M22 19H2" />
      </>
    ),
    palette: (
      <>
        <path {...base} d="M12 4a8 8 0 0 0-8 8c0 3.3 2.7 6 6 6h2a2 2 0 0 0 0-4h-1a1.5 1.5 0 0 1 0-3H14a6 6 0 0 0-2-7Z" />
      </>
    ),
    cog: (
      <>
        <circle {...base} cx="12" cy="12" r="3" />
        <path {...base} d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 1 1-1.4 1.4l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V19a1 1 0 1 1-2 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 1 1-1.4-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H5a1 1 0 1 1 0-2h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 1 1 1.4-1.4l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V5a1 1 0 1 1 2 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 1 1 1.4 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H19a1 1 0 1 1 0 2h-.2a1 1 0 0 0-.9.6" />
      </>
    ),
    cloud: (
      <>
        <path {...base} d="M18.5 18H7a4 4 0 1 1 .6-8A5.5 5.5 0 0 1 18.2 8a3.8 3.8 0 0 1 .3 10Z" />
      </>
    ),
    brain: (
      <>
        <path {...base} d="M9 8a3 3 0 1 1 6 0v8a3 3 0 1 1-6 0V8Z" />
        <path {...base} d="M9 11H7a2 2 0 1 1 0-4h1M15 11h2a2 2 0 1 0 0-4h-1M9 15H7a2 2 0 1 0 0 4h2M15 15h2a2 2 0 1 1 0 4h-2" />
      </>
    ),
    book: (
      <>
        <path {...base} d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
        <path {...base} d="M8 7h8" />
      </>
    ),
    instructor: (
      <>
        <circle {...base} cx="10" cy="8" r="3" />
        <path {...base} d="M4 19a6 6 0 0 1 12 0" />
        <path {...base} d="M18 7h3M19.5 5.5v3" />
      </>
    ),
    rocket: (
      <>
        <path {...base} d="M14 4c3 1 6 4 7 7-2 .7-4.2 1-6 1.2A12 12 0 0 1 11.8 19c-.2-1.8.5-4 1.2-6C13 10.8 13.3 8 14 4Z" />
        <path {...base} d="M9 15 5 19l1-4 3-1" />
      </>
    ),
    unlock: (
      <>
        <rect {...base} x="5" y="11" width="14" height="10" rx="2" />
        <path {...base} d="M9 11V8a3 3 0 1 1 6 0" />
      </>
    ),
    award: (
      <>
        <circle {...base} cx="12" cy="8" r="4" />
        <path {...base} d="m8.5 12.5-1.5 8 5-3 5 3-1.5-8" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {icons[name] || icons.book}
    </svg>
  );
}

export default function Home() {
  const { courses } = useAppContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const featured = courses.slice(0, 6);
  const categories = [...new Set(courses.map((c) => c.category))];
  const categoryIcons = {
    "Web Development": "globe",
    "Mobile Development": "mobile",
    "Data Science": "chart",
    "Design": "palette",
    DevOps: "cog",
    Cloud: "cloud",
    "AI/ML": "brain",
    Other: "book",
  };

  const stats = [
    { num: "50K+", label: "Active Learners", icon: "users" },
    { num: "98%", label: "Satisfaction Rate", icon: "star" },
    { num: "5K+", label: "Project Completions", icon: "trophy" },
    { num: "24/7", label: "Community Support", icon: "chat" },
  ];

  const features = [
    {
      title: "Expert Instructors",
      description: "Learn from industry professionals with real-world experience",
      icon: "instructor",
    },
    {
      title: "Hands-On Projects",
      description: "Build real projects and add them to your portfolio",
      icon: "rocket",
    },
    {
      title: "Lifetime Access",
      description: "Access course materials anytime, anywhere, forever",
      icon: "unlock",
    },
    {
      title: "Certifications",
      description: "Earn recognized certificates upon course completion",
      icon: "award",
    },
  ];

  return (
    <main
      className="min-h-screen bg-base text-text-secondary font-['DM_Sans',sans-serif]"
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
            <AppIcon name="spark" className="w-3.5 h-3.5 text-[#fbbf24]" strokeWidth={2.2} />
            <span className="text-[0.75rem] tracking-[0.15em] uppercase font-bold text-[#fbbf24]">
              Premium Learning Platform
            </span>
          </div>

          <h1
            id="hero-heading"
            className="font-['Playfair_Display',serif] font-black leading-[1.1] text-text-primary mb-6"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)" }}
          >
            <span className="block">Transform Your Career</span>
            <span className="inline bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">
              With Expert-Led Courses
            </span>
          </h1>

          <p className="text-[1.1rem] text-text-muted leading-relaxed max-w-2xl mb-10">
            Learn from industry experts and master in-demand skills. Build real projects, get industry recognition, and accelerate your career growth.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link
              to="/courses"
              className="hero-cta inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold no-underline text-base bg-gradient-to-r from-[#d97706] to-[#ea580c] text-[#0c0c0e] shadow-lg"
            >
              Explore All Courses
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/register"
              className="split-cta inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold no-underline text-base border-2 border-[rgba(217,119,6,0.5)] bg-[rgba(217,119,6,0.1)] text-[#fbbf24] hover:bg-[rgba(217,119,6,0.15)]"
            >
              Start Free Trial
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Quick stats */}
          <dl className="flex flex-wrap gap-8 pt-8 border-t border-[rgba(255,255,255,0.08)]">
            <div>
              <dd className="text-2xl font-bold text-[#d97706] m-0">{courses.length}+</dd>
              <dt className="text-sm text-text-muted m-0">Expert Courses</dt>
            </div>
            <div>
              <dd className="text-2xl font-bold text-[#d97706] m-0">50K+</dd>
              <dt className="text-sm text-text-muted m-0">Active Learners</dt>
            </div>
            <div>
              <dd className="text-2xl font-bold text-[#d97706] m-0">96%</dd>
              <dt className="text-sm text-text-muted m-0">Satisfaction Rate</dt>
            </div>
          </dl>
        </div>

        {/* Hero visualization badge */}
        <div
          className="hero-float-badge absolute right-12 top-1/3 flex flex-col items-center gap-3 rounded-3xl p-8 border border-[rgba(217,119,6,0.3)] bg-gradient-to-br from-surface to-surface"
          style={{ animation: "float 4s ease-in-out infinite", boxShadow: "0 0 30px rgba(217,119,6,0.1)" }}
          aria-hidden="true"
        >
          <div className="w-14 h-14 rounded-2xl border border-[rgba(217,119,6,0.4)] bg-[rgba(217,119,6,0.12)] flex items-center justify-center text-[#fbbf24]">
            <AppIcon name="cap" className="w-8 h-8" strokeWidth={1.8} />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-text-primary m-0">{courses.length}</p>
            <p className="text-xs text-text-muted m-0">Courses</p>
          </div>
          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#d97706] to-transparent" />
          <p className="text-xs text-text-dim font-semibold">Always Updated</p>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="relative py-20 px-8 bg-gradient-to-b from-sidebar to-base border-b border-[rgba(255,255,255,0.05)]" aria-labelledby="stats-heading">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 id="stats-heading" className="font-['Playfair_Display',serif] text-4xl text-text-primary mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Join our community of learners and professionals transforming their careers
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="stat-item text-center p-8 rounded-2xl border border-[rgba(217,119,6,0.2)] bg-surface hover:bg-surface-muted transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl border border-[rgba(217,119,6,0.35)] bg-[rgba(217,119,6,0.08)] flex items-center justify-center text-[#fbbf24]">
                  <AppIcon name={stat.icon} className="w-7 h-7" />
                </div>
                <dd className="text-3xl font-bold bg-gradient-to-r from-[#d97706] to-[#f59e0b] bg-clip-text text-transparent mb-2 m-0">
                  {stat.num}
                </dd>
                <dt className="text-text-muted text-sm m-0">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="max-w-[1200px] mx-auto px-8 py-20" aria-labelledby="featured-heading">
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
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
        className="py-20 px-8 bg-gradient-to-b from-base to-sidebar border-t border-b border-[rgba(255,255,255,0.05)]"
        aria-labelledby="categories-heading"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12">
            <h2 id="categories-heading" className="font-['Playfair_Display',serif] text-4xl text-text-primary mb-2">
              Browse by Category
            </h2>
            <p className="text-text-muted">Explore courses across different specializations and find your next learning path</p>
          </div>
          <ul
            className="grid gap-4 list-none p-0 m-0"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
            aria-label="Course categories"
          >
            {categories.map((cat, idx) => {
              const count = courses.filter((c) => c.category === cat).length;
              const iconName = categoryIcons[cat] || "book";
              return (
                <li key={cat} style={{ animation: `slide-up 0.6s ease forwards`, animationDelay: `${idx * 0.05}s` }}>
                  <Link
                    to={`/courses?category=${encodeURIComponent(cat)}`}
                    className="cat-card flex flex-col gap-3 p-6 rounded-2xl no-underline border border-[rgba(255,255,255,0.08)] bg-surface group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="w-11 h-11 rounded-xl border border-[rgba(217,119,6,0.35)] bg-[rgba(217,119,6,0.08)] flex items-center justify-center text-[#fbbf24]">
                        <AppIcon name={iconName} className="w-5 h-5" />
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#d97706] to-[#f59e0b] bg-opacity-40 text-white">
                        {count} {count === 1 ? "course" : "courses"}
                      </span>
                    </div>
                    <span className="font-bold text-[1.05rem] text-text-primary group-hover:text-[#fbbf24] transition-colors">{cat}</span>
                    <p className="text-[0.85rem] text-text-dim">Explore this category <span aria-hidden="true">→</span></p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 px-8 bg-base" aria-labelledby="features-heading">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="font-['Playfair_Display',serif] text-4xl text-text-primary mb-4">
              Why Learn With Us?
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="feature-card p-6 rounded-2xl border border-[rgba(217,119,6,0.15)] bg-surface hover:bg-surface-muted hover:border-[rgba(217,119,6,0.4)]"
              >
                <div className="w-12 h-12 mb-3 rounded-xl border border-[rgba(217,119,6,0.35)] bg-[rgba(217,119,6,0.08)] flex items-center justify-center text-[#fbbf24]">
                  <AppIcon name={feature.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-text-primary font-bold mb-2 text-lg">{feature.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{feature.description}</p>
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#d97706] to-transparent opacity-5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[#d97706] to-transparent opacity-5 rounded-full blur-3xl" aria-hidden="true" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 id="cta-heading" className="font-['Playfair_Display',serif] text-4xl text-text-primary mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-text-muted text-lg mb-10">
            Start learning today with thousands of other professionals advancing their skills and achieving their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="hero-cta inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold no-underline text-base bg-gradient-to-r from-[#d97706] to-[#ea580c] text-[#0c0c0e]"
            >
              Create Free Account
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold no-underline text-base border-2 border-[rgba(217,119,6,0.3)] text-text-secondary hover:border-[rgba(217,119,6,0.6)] hover:bg-[rgba(217,119,6,0.05)] transition-all"
            >
              Browse Courses
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <p className="text-text-dim text-sm mt-8">
            No credit card required. Start learning for free.
          </p>
        </div>
      </section>
    </main>
  );
}
