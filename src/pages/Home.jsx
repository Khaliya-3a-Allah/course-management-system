import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import { ArrowRightIcon } from "../components/Icons";

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
  const [countElapsedMs, setCountElapsedMs] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const duration = 3200;
    const start = performance.now();
    let frame = null;

    const run = (now) => {
      const elapsed = Math.min(now - start, duration);
      setCountElapsedMs(elapsed);
      const progress = elapsed / duration;
      if (progress < 1) frame = requestAnimationFrame(run);
    };

    frame = requestAnimationFrame(run);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const animateNumber = (target, delayMs = 0) => {
    const leadIn = 250;
    const duration = 2350;
    const normalized = Math.min(Math.max((countElapsedMs - leadIn - delayMs) / duration, 0), 1);
    const eased = 1 - Math.pow(1 - normalized, 4);
    return Math.round(target * eased);
  };
  const compact = (value) => {
    if (value >= 1000) {
      const formatted = (value / 1000).toFixed(value >= 10000 ? 0 : 1);
      return `${formatted.replace(/\.0$/, "")}K`;
    }
    return String(value);
  };

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
    { target: 50000, delay: 0, label: "Active Learners", icon: "users", format: (v) => `${compact(v)}+` },
    { target: 98, delay: 130, label: "Satisfaction Rate", icon: "star", format: (v) => `${v}%` },
    { target: 5000, delay: 260, label: "Project Completions", icon: "trophy", format: (v) => `${compact(v)}+` },
    { target: 24, delay: 390, label: "Community Support", icon: "chat", format: (v) => `${v}/7` },
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

  const testimonials = [
    {
      quote: "The curriculum quality and pacing feel enterprise-grade. Our onboarding time dropped by almost half.",
      name: "Nadine K.",
      role: "Engineering Manager",
    },
    {
      quote: "This is the first learning platform our team actually uses weekly without reminders.",
      name: "Omar R.",
      role: "Product Lead",
    },
    {
      quote: "Clean UX, practical projects, and measurable outcomes. It feels like software built by professionals.",
      name: "Maya S.",
      role: "Learning & Development",
    },
  ];

  const partnerMarks = ["NexaTech", "BlueOrbit", "Vertex Labs", "PixelForge", "CloudArc", "Northstar"];

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
        @keyframes reveal-up { from { opacity: 0; transform: translateY(26px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes shimmer-x { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        @keyframes drift-x { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @media (max-width: 640px) { .hero-float-badge { display: none !important; } }
        @media (max-width: 1024px) { .hero-side-mini { display: none !important; } }
        .hero-cta { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .hero-cta:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(217,119,6,0.3); }
        .split-cta:hover { background: rgba(217,119,6,0.1); border-color: rgba(217,119,6,0.6); }
        .cat-card { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .cat-card:hover { transform: translateY(-6px); border-color: rgba(217,119,6,0.5); background: rgba(217,119,6,0.08); box-shadow: 0 12px 32px rgba(217,119,6,0.15); }
        .feature-card { transition: all 0.3s ease; }
        .feature-card:hover { transform: translateY(-8px); }
        .stat-item { animation: slide-up 0.6s ease forwards; }
        .trust-card { animation: reveal-up 0.65s ease forwards; }
        .pro-strip::before { content: ""; position: absolute; inset: 0; width: 35%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); animation: shimmer-x 3.6s linear infinite; }
        .logo-marquee { animation: drift-x 18s linear infinite; }
        .hero-side-mini { animation: float 5.2s ease-in-out infinite; }
        .stat-item:nth-child(1) { animation-delay: 0.1s; }
        .stat-item:nth-child(2) { animation-delay: 0.2s; }
        .stat-item:nth-child(3) { animation-delay: 0.3s; }
        .stat-item:nth-child(4) { animation-delay: 0.4s; }
      `}</style>

      {/* ── Hero ── */}
      <section
        className="relative min-h-[78vh] md:min-h-[90vh] flex items-center overflow-hidden px-4 md:px-8 pt-16 md:pt-20 pb-12 md:pb-16"
        aria-labelledby="hero-heading"
      >
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#d97706] to-transparent opacity-5 rounded-full blur-3xl" style={{ animation: "float 12s ease-in-out infinite" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-[#d97706] to-transparent opacity-5 rounded-full blur-3xl" style={{ animation: "float 15s ease-in-out infinite reverse" }} />
        </div>

        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 100% 80% at 50% 30%, rgba(217,119,6,0.08) 0%, transparent 70%)" }} aria-hidden="true" />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)", backgroundSize: "80px 80px" }} aria-hidden="true" />

        <div className="relative z-10 max-w-4xl rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,12,14,0.38)] backdrop-blur-sm px-5 py-7 md:px-8 md:py-10 shadow-[0_26px_60px_rgba(0,0,0,0.35)]">
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

          <div className="h-[2px] w-40 rounded-full bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-transparent mb-7" aria-hidden="true" />

          <p className="text-[1rem] md:text-[1.1rem] text-text-muted leading-relaxed max-w-2xl mb-8 md:mb-10">
            Learn from industry experts and master in-demand skills. Build real projects, get industry recognition, and accelerate your career growth.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mb-10 md:mb-12">
            <Link
              to="/courses"
              className="hero-cta inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-lg font-bold no-underline text-base bg-gradient-to-r from-[#d97706] to-[#ea580c] text-[#0c0c0e] shadow-lg"
            >
              Explore All Courses
              <ArrowRightIcon size={16} />
            </Link>
            <Link
              to="/register"
              className="split-cta inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-lg font-bold no-underline text-base border-2 border-[rgba(217,119,6,0.55)] bg-gradient-to-r from-[#f8c471] to-[#f59e0b] text-[#0c0c0e] hover:brightness-105"
            >
              Start Free Trial
              <ArrowRightIcon size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-9">
            {[
              { title: "Team-ready", subtitle: "Structured paths for individuals and cohorts" },
              { title: "Practical", subtitle: "Project-based modules with real outcomes" },
              { title: "Reliable", subtitle: "Consistent content quality and updates" },
            ].map((item) => (
              <article
                key={item.title}
                className="trust-card rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-3"
              >
                <p className="text-[0.8rem] tracking-[0.14em] uppercase text-[#f6c56b] font-semibold mb-1.5">{item.title}</p>
                <p className="text-[0.83rem] text-text-muted leading-relaxed">{item.subtitle}</p>
              </article>
            ))}
          </div>

          {/* Quick stats */}
          <dl className="flex flex-wrap gap-8 pt-8 border-t border-[rgba(255,255,255,0.08)]">
            <div>
              <dd className="text-2xl font-bold tabular-nums tracking-tight text-[#d97706] m-0">{animateNumber(courses.length, 0)}+</dd>
              <dt className="text-sm text-text-muted m-0">Expert Courses</dt>
            </div>
            <div>
              <dd className="text-2xl font-bold tabular-nums tracking-tight text-[#d97706] m-0">{compact(animateNumber(50000, 110))}+</dd>
              <dt className="text-sm text-text-muted m-0">Active Learners</dt>
            </div>
            <div>
              <dd className="text-2xl font-bold tabular-nums tracking-tight text-[#d97706] m-0">{animateNumber(96, 220)}%</dd>
              <dt className="text-sm text-text-muted m-0">Satisfaction Rate</dt>
            </div>
          </dl>
        </div>

        {/* Hero visualization badge */}
        <div
          className="hero-float-badge absolute right-12 top-[27%] flex flex-col items-center gap-3 rounded-3xl p-7 border border-[rgba(217,119,6,0.3)] bg-gradient-to-br from-surface to-surface min-w-[235px]"
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
          <div className="w-full grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-lg border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] px-2.5 py-2 text-center">
              <p className="text-[0.76rem] font-semibold text-text-primary">4.9/5</p>
              <p className="text-[0.66rem] text-text-dim">Avg rating</p>
            </div>
            <div className="rounded-lg border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] px-2.5 py-2 text-center">
              <p className="text-[0.76rem] font-semibold text-text-primary">1.2K</p>
              <p className="text-[0.66rem] text-text-dim">New this week</p>
            </div>
          </div>
          <p className="text-xs text-text-dim font-semibold">Always Updated</p>
        </div>

        <div
          className="hero-side-mini absolute right-8 top-[20%] rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(22,22,26,0.9)] px-4 py-3"
          style={{ boxShadow: "0 10px 24px rgba(0,0,0,0.3)", animationDelay: "0.2s" }}
          aria-hidden="true"
        >
          <p className="text-[0.68rem] tracking-[0.16em] uppercase text-[#f6c56b] mb-1">Live Cohort</p>
          <p className="text-[0.92rem] text-text-primary font-semibold">Frontend Systems</p>
          <p className="text-[0.74rem] text-text-dim mt-1">Starts Monday</p>
        </div>

        <div
          className="hero-side-mini absolute right-4 bottom-[18%] rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(22,22,26,0.92)] px-4 py-3"
          style={{ boxShadow: "0 10px 24px rgba(0,0,0,0.3)", animationDelay: "0.6s" }}
          aria-hidden="true"
        >
          <p className="text-[0.68rem] tracking-[0.16em] uppercase text-[#f6c56b] mb-1">Certificate Path</p>
          <p className="text-[0.92rem] text-text-primary font-semibold">Job-Ready Track</p>
          <p className="text-[0.74rem] text-text-dim mt-1">9 modules curated</p>
        </div>
      </section>

      <section className="px-4 md:px-8 -mt-3 mb-3" aria-label="Trusted partners">
        <div className="max-w-[1200px] mx-auto overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
          <div className="px-4 md:px-6 pt-4 pb-1">
            <p className="text-[0.7rem] tracking-[0.2em] uppercase text-text-faint">Trusted by teams worldwide</p>
          </div>
          <div className="relative overflow-hidden pb-4">
            <div className="logo-marquee flex w-[200%] gap-4 px-4 md:px-6">
              {[...partnerMarks, ...partnerMarks].map((mark, i) => (
                <div
                  key={`${mark}-${i}`}
                  className="shrink-0 min-w-[170px] rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5"
                >
                  <p className="text-[0.86rem] font-semibold text-text-secondary text-center">{mark}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
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
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
        <ul
          className="grid gap-6 list-none p-0 m-0"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}
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
        className="py-14 md:py-20 px-4 md:px-8 bg-gradient-to-b from-base to-sidebar border-t border-b border-[rgba(255,255,255,0.05)]"
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
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))" }}
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
                    <p className="text-[0.85rem] text-text-dim flex items-center gap-1.5">Explore this category <ArrowRightIcon size={14} /></p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-14 md:py-20 px-4 md:px-8 bg-base" aria-labelledby="features-heading">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[0.72rem] tracking-[0.2em] uppercase text-[#f6c56b] mb-2">Built for Results</p>
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
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl border border-[rgba(217,119,6,0.35)] bg-[rgba(217,119,6,0.08)] flex items-center justify-center text-[#fbbf24]">
                    <AppIcon name={feature.icon} className="w-6 h-6" />
                  </div>
                  <span className="text-[0.78rem] font-semibold text-[#f6c56b]">0{i + 1}</span>
                </div>
                <h3 className="text-text-primary font-bold mb-2 text-lg">{feature.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 px-4 md:px-8 bg-gradient-to-b from-sidebar to-base border-t border-[rgba(255,255,255,0.05)]" aria-labelledby="social-proof-heading">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-10 text-center">
            <p className="text-[0.72rem] tracking-[0.2em] uppercase text-[#f6c56b] mb-2">Social Proof</p>
            <h2 id="social-proof-heading" className="font-['Playfair_Display',serif] text-4xl text-text-primary mb-3">
              Trusted by Professionals
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Teams and independent learners use Courseware to build practical skills with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((item, idx) => (
              <article
                key={item.name}
                className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-surface p-6 relative overflow-hidden"
                style={{ animation: "reveal-up 0.7s ease forwards", animationDelay: `${idx * 0.08}s` }}
              >
                <div className="pro-strip absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />
                <p className="text-[1.55rem] leading-none text-[#f6c56b] mb-3" aria-hidden="true">“</p>
                <p className="text-[0.92rem] text-text-secondary leading-relaxed mb-4">{item.quote}</p>
                <p className="text-[0.84rem] font-semibold text-text-primary">{item.name}</p>
                <p className="text-[0.78rem] text-text-dim mt-1">{item.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA Banner ── */}
      <section
        className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden"
        aria-labelledby="cta-heading"
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(217,119,6,0.1) 0%, transparent 70%)" }} aria-hidden="true" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#d97706] to-transparent opacity-5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[#d97706] to-transparent opacity-5 rounded-full blur-3xl" aria-hidden="true" />

        <div className="relative z-10 max-w-3xl mx-auto text-center rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(22,22,26,0.62)] px-6 py-10 md:px-12 md:py-14 backdrop-blur-sm">
          <p className="text-[0.72rem] tracking-[0.2em] uppercase text-[#f6c56b] mb-2">Start Today</p>
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
              <ArrowRightIcon size={16} />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold no-underline text-base border-2 border-[rgba(217,119,6,0.3)] text-text-secondary hover:border-[rgba(217,119,6,0.6)] hover:bg-[rgba(217,119,6,0.05)] transition-all"
            >
              Browse Courses
              <ArrowRightIcon size={16} />
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
