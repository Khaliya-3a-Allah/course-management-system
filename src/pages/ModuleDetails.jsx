import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Modal from "../components/Modal";

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconPlay = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="#e8e6e0"><polygon points="3,1 15,8 3,15"/></svg>
);
const IconPause = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="#e8e6e0">
    <rect x="2" y="2" width="4" height="12" rx="1"/><rect x="10" y="2" width="4" height="12" rx="1"/>
  </svg>
);
const IconVolume = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#e8e6e0" strokeWidth="1.5" strokeLinecap="round">
    <polygon points="1,5 5,5 9,1 9,15 5,11 1,11" fill="#e8e6e0" stroke="none"/>
    <path d="M11 5.5a4 4 0 0 1 0 5"/><path d="M13 3.5a7 7 0 0 1 0 9"/>
  </svg>
);
const IconVolumeLow = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#e8e6e0" strokeWidth="1.5" strokeLinecap="round">
    <polygon points="1,5 5,5 9,1 9,15 5,11 1,11" fill="#e8e6e0" stroke="none"/>
    <path d="M11 5.5a4 4 0 0 1 0 5"/>
  </svg>
);
const IconMute = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#e8e6e0" strokeWidth="1.5" strokeLinecap="round">
    <polygon points="1,5 5,5 9,1 9,15 5,11 1,11" fill="#e8e6e0" stroke="none"/>
    <line x1="12" y1="5" x2="15" y2="11"/><line x1="15" y1="5" x2="12" y2="11"/>
  </svg>
);
const IconFullscreen = () => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#e8e6e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1,5 1,1 5,1"/><polyline points="11,1 15,1 15,5"/>
    <polyline points="15,11 15,15 11,15"/><polyline points="5,15 1,15 1,11"/>
  </svg>
);

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// ── Custom Video Player ──────────────────────────────────────────────────────
function VideoPlayer({ src, title, moduleName, duration }) {
  const videoRef = useRef(null);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setCurrentTime(0);
      setTotalDuration(0);
      setPlaying(false);
      setSpeed(1);
    }
  }, [src]);

  // Close speed dropdown when clicking outside
  useEffect(() => {
    const handler = () => setShowSpeed(false);
    if (showSpeed) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showSpeed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { if (playing) setShowControls(false); }, 2500);
  };

  const handleTouchStart = () => {
    setShowControls(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pct * totalDuration;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const m = !muted;
    videoRef.current.muted = m;
    setMuted(m);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0; }
    setMuted(v === 0);
  };

  const toggleFS = () => {
    if (!document.fullscreenElement) wrapRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const changeSpeed = (s) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
    setShowSpeed(false);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  const pct = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  if (!src) {
    return (
      <div className="vp-wrap" ref={wrapRef} style={vStyles.wrap}>
        <div className="vp-overlay" style={vStyles.overlay}>
          <span style={vStyles.overlayBadge}>{moduleName}</span>
          <span style={vStyles.overlayTitle}>{title}</span>
        </div>
        <div style={vStyles.noVideo}>
          <IconPlay />
          <p style={{ fontSize: "1rem", color: "#4b5563", margin: 0 }}>No video available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="vp-wrap"
      style={vStyles.wrap}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={handleTouchStart}
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{`
        /* Seek bar */
        .vp-seek-bar { width: 100%; height: 20px; display: flex; align-items: center; cursor: pointer; margin-bottom: 0.5rem; }
        .vp-seek-bar:hover .vp-track { height: 7px !important; }
        /* Volume slider */
        .vp-vol { accent-color: #d97706; width: 70px; cursor: pointer; -webkit-appearance: none; height: 4px; background: rgba(255,255,255,0.2); border-radius: 999px; outline: none; }
        .vp-vol::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #d97706; cursor: pointer; }
        .vp-vol::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #d97706; cursor: pointer; border: none; }
        /* Control buttons */
        .vp-btn { background: none !important; border: none !important; cursor: pointer; color: #e8e6e0; padding: 0.4rem; line-height: 1; display: flex; align-items: center; justify-content: center; min-width: 36px; min-height: 36px; }
        /* Speed button */
        .vp-speed-btn {
          background: none !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 6px;
          color: #d97706;
          padding: 0.22rem 0.55rem;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          min-width: 42px;
          line-height: 1.4;
        }
        .vp-speed-item {
          display: block; width: 100%; padding: 0.45rem 1rem;
          background: none; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          cursor: pointer; text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .vp-speed-item:last-child { border-bottom: none; }
        .vp-speed-item:hover { background: rgba(255,255,255,0.05) !important; }
        /* Mobile: native controls, hide custom */
        @media (max-width: 640px) {
          .vp-wrap { border-radius: 0 !important; margin-left: -0.75rem !important; margin-right: -0.75rem !important; width: calc(100% + 1.5rem) !important; }
          .vp-overlay { display: none !important; }
          .vp-big-play { display: none !important; }
          .vp-custom-controls { display: none !important; }
        }
      `}</style>

      {/* Video — native controls on mobile, hidden on desktop (custom controls used) */}
      <video
        ref={videoRef}
        style={vStyles.video}
        src={src}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
        onLoadedMetadata={() => videoRef.current && setTotalDuration(videoRef.current.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      {/* ── Desktop only below ── */}

      {/* Title overlay */}
      <div className="vp-overlay" style={vStyles.overlay}>
        <span style={vStyles.overlayBadge}>{moduleName}</span>
        <span style={vStyles.overlayTitle}>{title}</span>
      </div>

      {/* Big play button */}
      <button className="vp-big-play" onClick={togglePlay} style={vStyles.bigPlay} aria-label="Play">
        {playing
          ? <IconPause />
          : <svg width="28" height="28" viewBox="0 0 16 16" fill="#d97706" style={{ marginLeft: "4px" }}><polygon points="3,1 15,8 3,15"/></svg>
        }
      </button>

      {/* Custom controls bar */}
      <div className="vp-custom-controls" style={{ ...vStyles.controls, opacity: showControls ? 1 : 0, transition: "opacity 0.3s" }}>
        {/* Seek bar */}
        <div className="vp-seek-bar" onClick={handleSeek} onTouchEnd={handleSeek}>
          <div className="vp-track" style={vStyles.seekBg}>
            <div style={{ ...vStyles.seekFill, width: `${pct}%` }} />
            <div style={{ ...vStyles.seekThumb, left: `calc(${pct}% - 8px)` }} />
          </div>
        </div>

        {/* Controls row */}
        <div style={vStyles.ctrlRow}>
          {/* Left: play, time, volume */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <button className="vp-btn" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <IconPause /> : <IconPlay />}
            </button>
            <span style={vStyles.time}>{fmt(currentTime)} / {fmt(totalDuration)}</span>
            <button className="vp-btn" onClick={toggleMute} aria-label="Toggle mute">
              {muted || volume === 0 ? <IconMute /> : volume < 0.5 ? <IconVolumeLow /> : <IconVolume />}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={handleVolume} className="vp-vol" aria-label="Volume" />
          </div>

          {/* Right: speed, duration, fullscreen */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* Speed selector */}
            <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <button
                className="vp-speed-btn"
                onClick={() => setShowSpeed((v) => !v)}
                aria-label="Playback speed"
              >
                {speed}x
              </button>
              {showSpeed && (
                <div style={vStyles.speedDropdown}>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      className="vp-speed-item"
                      onClick={() => changeSpeed(s)}
                      style={{ color: s === speed ? "#d97706" : "#9ca3af", fontWeight: s === speed ? 700 : 400, backgroundColor: s === speed ? "rgba(217,119,6,0.07)" : "transparent" }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span style={vStyles.durBadge}>⏱ {duration}</span>
            <button className="vp-btn" onClick={toggleFS} aria-label="Fullscreen">
              <IconFullscreen />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const vStyles = {
  wrap: { position: "relative", width: "100%", aspectRatio: "16/9", backgroundColor: "#0a0a0c", borderRadius: "12px", overflow: "hidden", marginBottom: "1.25rem", userSelect: "none" },
  video: { width: "100%", height: "100%", objectFit: "contain", display: "block", backgroundColor: "#0a0a0c" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, padding: "1rem 1.25rem", background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)", display: "flex", flexDirection: "column", gap: "0.25rem", pointerEvents: "none" },
  overlayBadge: { fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#d97706", fontWeight: 700 },
  overlayTitle: { fontSize: "clamp(0.85rem, 2vw, 1.2rem)", fontFamily: "'Playfair Display', serif", color: "#f5f2ec", fontWeight: 700, lineHeight: 1.3 },
  bigPlay: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "clamp(56px, 8vw, 80px)", height: "clamp(56px, 8vw, 80px)", borderRadius: "50%", background: "rgba(0,0,0,0.35)", border: "2px solid rgba(217,119,6,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
  controls: { position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)", padding: "1.5rem 0.75rem 0.75rem" },
  seekBg: { width: "100%", height: "5px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "999px", position: "relative", transition: "height 0.15s" },
  seekFill: { height: "100%", backgroundColor: "#d97706", borderRadius: "999px", transition: "width 0.1s linear" },
  seekThumb: { position: "absolute", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#d97706", boxShadow: "0 0 6px rgba(217,119,6,0.7)" },
  ctrlRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  time: { fontSize: "0.92rem", color: "#9ca3af", fontFamily: "monospace", letterSpacing: "0.04em", whiteSpace: "nowrap" },
  durBadge: { fontSize: "0.82rem", color: "#9ca3af", backgroundColor: "rgba(255,255,255,0.08)", padding: "0.2rem 0.6rem", borderRadius: "999px", whiteSpace: "nowrap" },
  speedDropdown: { position: "absolute", bottom: "2.4rem", right: 0, backgroundColor: "#1a1a1e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", overflow: "hidden", minWidth: "72px", zIndex: 10 },
  noVideo: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" },
};

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ModuleDetails() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { courses, updateCourse, currentUser, lessonProgress, markLessonComplete, markCourseComplete, completedCourses } = useAppContext();

  const course = courses.find((c) => c.id === courseId);
  const allModules = course?.modules || [];
  const currentModuleIndex = allModules.findIndex((m) => m.id === moduleId);
  const module = allModules[currentModuleIndex];
  const completedLessons = lessonProgress[courseId] || {};

  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [visible, setVisible] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionShown, setCompletionShown] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (module) {
      setExpandedModules({ [module.id]: true });
      if (module.lessons?.length > 0) setActiveLesson(module.lessons[0]);
    }
  }, [moduleId]);

  if (!course) {
    return (
      <div style={styles.notFound}>
        <h2 style={styles.nfTitle}>Course Not Found</h2>
        <Link to="/courses" style={styles.backLink}>← All Courses</Link>
      </div>
    );
  }

  if (!module) {
    return (
      <div style={styles.notFound}>
        <h2 style={styles.nfTitle}>Module Not Found</h2>
        <Link to={`/courses/${courseId}`} style={styles.backLink}>← Back to Course</Link>
      </div>
    );
  }

  const totalLessons = allModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const completedCount = Object.keys(completedLessons).filter((k) => completedLessons[k]).length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const isModuleComplete = (mod) =>
    mod.lessons?.length > 0 && mod.lessons?.every((l) => completedLessons[l.id]);

  const toggleModule = (modId) =>
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));

  const handleMarkComplete = (lessonId) => {
    markLessonComplete(courseId, lessonId);
    const newCompleted = { ...completedLessons, [lessonId]: true };
    const newCount = Object.keys(newCompleted).filter((k) => newCompleted[k]).length;
    const newPct = totalLessons > 0 ? Math.round((newCount / totalLessons) * 100) : 0;
    if (newPct === 100 && !completionShown && !completedCourses.has(courseId)) {
      markCourseComplete(courseId);
      setTimeout(() => { setShowCompletion(true); setCompletionShown(true); }, 600);
    }
  };

  const activeLessonIndex = module.lessons?.indexOf(activeLesson);
  const isLastLesson = activeLessonIndex === (module.lessons?.length - 1);
  const isFirstLesson = activeLessonIndex === 0;
  const nextModule = allModules[currentModuleIndex + 1];
  const prevModule = allModules[currentModuleIndex - 1];

  const goToNextLesson = () => { if (!isLastLesson) setActiveLesson(module.lessons[activeLessonIndex + 1]); };
  const goToPrevLesson = () => {
    if (!isFirstLesson) setActiveLesson(module.lessons[activeLessonIndex - 1]);
    else if (prevModule) navigate(`/courses/${courseId}/modules/${prevModule.id}`);
  };
  const goToNextModule = () => {
    if (nextModule) { setExpandedModules({ [nextModule.id]: true }); setActiveLesson(null); navigate(`/courses/${courseId}/modules/${nextModule.id}`); }
  };

  const handleSubmitReview = () => {
    if (selectedRating === 0) return;
    const newRating = ((course.rating || 0) + selectedRating) / 2;
    updateCourse({ ...course, rating: Math.round(newRating * 10) / 10 });
    setSubmitted(true);
  };

  return (
    <div style={{ ...styles.page, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.55s ease, transform 0.55s ease" }}>
      <style>{`
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
          .module-layout { grid-template-columns: 1fr !important; }
          .module-sidebar { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); max-height: 280px; overflow-y: auto; }
          .module-main { padding: 0.75rem !important; }
        }
        /* Desktop: hide native video controls, show custom */
        @media (min-width: 641px) {
          .vp-wrap video { pointer-events: none; }
          .vp-wrap video::-webkit-media-controls { display: none !important; }
          .vp-wrap video { -webkit-appearance: none; }
          .vp-big-play { display: flex !important; }
          .vp-custom-controls { display: block !important; }
          .vp-wrap { cursor: pointer; }
        }
        .module-sidebar button { background-color: #111114 !important; }
        .lesson-btn { background-color: #0e0e11 !important; }
        .lesson-btn:hover { background-color: rgba(217,119,6,0.05) !important; }
        .lesson-btn.active { background-color: rgba(217,119,6,0.07) !important; }
        .module-btn-active { background-color: rgba(217,119,6,0.06) !important; border-left: 3px solid #d97706 !important; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #d97706, #f59e0b); border-radius: 999px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .mark-complete-btn:hover { background-color: rgba(34,197,94,0.15) !important; }
        .star-btn { background: none !important; border: none !important; cursor: pointer; padding: 0 3px; font-size: 2.2rem; line-height: 1; transition: transform 0.1s; }
        .star-btn:hover { transform: scale(1.25); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .review-textarea { width: 100%; background: #0c0c0e; border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; color: #e8e6e0; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; padding: 0.75rem 1rem; resize: vertical; min-height: 90px; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
        .review-textarea:focus { border-color: rgba(217,119,6,0.4); }
        .review-textarea::placeholder { color: #4b5563; }
      `}</style>

      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarInner}>
          <Link to={`/courses/${courseId}`} style={styles.backBtn}>← {course.title}</Link>
          <span style={styles.topBarDivider}>/</span>
          <span style={styles.topBarModule}>{module.title}</span>
          <div style={styles.topBarProgress}>
            <span style={styles.topBarPct}>{progressPct}%</span>
            <div style={styles.topBarBarWrap}><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="module-layout" style={styles.layout}>

        {/* Sidebar */}
        <aside className="module-sidebar" style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.progressHeader}>
              <p style={styles.sidebarLabel}>Course Content</p>
              <span style={styles.progressPctBig}>{progressPct}%</span>
            </div>
            <div style={styles.progressBarWrap}><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
            <p style={styles.progressSub}>{completedCount} of {totalLessons} lessons completed</p>
          </div>

          <nav aria-label="Course modules">
            {allModules.map((mod, modIdx) => {
              const isCurrentModule = mod.id === moduleId;
              const isExpanded = expandedModules[mod.id];
              const modComplete = isModuleComplete(mod);
              const modDone = mod.lessons?.filter((l) => completedLessons[l.id]).length || 0;
              const modTotal = mod.lessons?.length || 0;
              const modPct = modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0;

              return (
                <div key={mod.id} style={styles.moduleGroup}>
                  <button
                    className={isCurrentModule ? "module-btn-active" : ""}
                    onClick={() => { toggleModule(mod.id); if (!isCurrentModule) navigate(`/courses/${courseId}/modules/${mod.id}`); }}
                    style={styles.moduleBtn}
                  >
                    <span style={{ ...styles.modNum, color: modComplete ? "#22c55e" : isCurrentModule ? "#d97706" : "rgba(217,119,6,0.3)" }}>
                      {modComplete ? "✓" : String(modIdx + 1).padStart(2, "0")}
                    </span>
                    <span style={styles.modInfo}>
                      <span style={styles.modTitle}>{mod.title}</span>
                      <span style={styles.modProgressRow}>
                        <span style={styles.modProgressBarWrap}>
                          <span style={{ ...styles.modProgressFill, width: `${modPct}%`, backgroundColor: modComplete ? "#22c55e" : "#d97706" }} />
                        </span>
                        <span style={styles.modProgressText}>{modDone}/{modTotal}</span>
                      </span>
                    </span>
                    <span style={styles.modChevron}>{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {isExpanded && (
                    <div style={styles.lessonDropdown}>
                      {mod.lessons?.map((lesson) => {
                        const isActiveLesson = isCurrentModule && activeLesson?.id === lesson.id;
                        const isDone = completedLessons[lesson.id];
                        return (
                          <button
                            key={lesson.id}
                            className={`lesson-btn${isActiveLesson ? " active" : ""}`}
                            onClick={() => setActiveLesson(lesson)}
                            style={styles.lessonBtn}
                          >
                            <span style={{ ...styles.lessonDot, backgroundColor: isDone ? "#22c55e" : isActiveLesson ? "#d97706" : "rgba(255,255,255,0.1)", boxShadow: isActiveLesson && !isDone ? "0 0 0 2px rgba(217,119,6,0.3)" : "none" }} />
                            <span style={styles.lessonBtnText}>
                              <span style={{ ...styles.lessonBtnTitle, color: isDone ? "#6b7280" : isActiveLesson ? "#f5f2ec" : "#9ca3af", textDecoration: isDone ? "line-through" : "none" }}>
                                {lesson.title}
                              </span>
                              <span style={styles.lessonBtnDuration}>{lesson.duration}</span>
                            </span>
                            {isActiveLesson && !isDone && <span style={styles.activeIndicator}>▶</span>}
                            {isDone && <span style={styles.doneCheck}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="module-main" style={styles.main}>
          {activeLesson ? (
            <div key={activeLesson.id} style={{ animation: "fadeSlide 0.4s ease forwards" }}>
              <VideoPlayer
                src={activeLesson.videoUrl}
                title={activeLesson.title}
                moduleName={module.title}
                duration={activeLesson.duration}
              />

              <div style={styles.lessonMeta}>
                <span style={styles.lessonMetaDuration}>⏱ {activeLesson.duration}</span>
                <span style={styles.lessonMetaModule}>{module.title}</span>
                {completedLessons[activeLesson.id] && <span style={styles.lessonDoneBadge}>✓ Completed</span>}
              </div>

              <h1 style={styles.lessonTitle}>{activeLesson.title}</h1>

              <div style={styles.contentCard}>
                <p style={styles.contentLabel}>Lesson Preview</p>
                <p style={styles.contentText}>{activeLesson.contentPreview || "No preview content available."}</p>
              </div>

              {!completedLessons[activeLesson.id] && (
                <button className="mark-complete-btn" onClick={() => handleMarkComplete(activeLesson.id)} style={styles.markCompleteBtn}>
                  ✓ Mark as Complete
                </button>
              )}

              <div style={styles.lessonNav}>
                {(!isFirstLesson || prevModule) && (
                  <button onClick={goToPrevLesson} style={styles.navBtn}>
                    ← {isFirstLesson && prevModule ? "Prev Module" : "Prev Lesson"}
                  </button>
                )}
                {!isLastLesson ? (
                  <button onClick={goToNextLesson} style={{ ...styles.navBtn, ...styles.navBtnNext }}>Next Lesson →</button>
                ) : nextModule ? (
                  <button onClick={goToNextModule} style={{ ...styles.navBtn, ...styles.navBtnNext }}>Next Module →</button>
                ) : null}
              </div>
            </div>
          ) : (
            <div style={styles.selectPrompt}>
              <span style={styles.selectIcon}>📖</span>
              <p>Select a lesson from the sidebar to begin.</p>
            </div>
          )}
        </main>
      </div>

      {/* Completion Modal */}
      <Modal isOpen={showCompletion} onClose={() => setShowCompletion(false)} title="">
        {!submitted ? (
          <div style={styles.completionInner}>
            <div style={styles.completionTop}>
              <span style={styles.completionEmoji}>🎉</span>
              <h2 style={styles.completionTitle}>Course Complete!</h2>
              <p style={styles.completionSub}>You've finished <strong style={{ color: "#f5f2ec" }}>{course.title}</strong>.<br />Share how it went!</p>
            </div>
            <div style={styles.starsSection}>
              <p style={styles.starsLabel}>Your Rating</p>
              <div style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="star-btn" onClick={() => setSelectedRating(star)} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)}>
                    <span style={{ color: star <= (hoveredStar || selectedRating) ? "#f59e0b" : "#2d2d35", transition: "color 0.12s" }}>★</span>
                  </button>
                ))}
              </div>
              {selectedRating > 0 && <p style={styles.ratingLabel}>{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][selectedRating]}</p>}
            </div>
            <div style={styles.messageSection}>
              <p style={styles.messageLabel}>Leave a review <span style={styles.optional}>(optional)</span></p>
              <textarea className="review-textarea" placeholder="What did you think of this course? What was most valuable?" value={reviewMessage} onChange={(e) => setReviewMessage(e.target.value)} rows={3} />
            </div>
            <div style={styles.completionActions}>
              <button className="submit-btn" onClick={handleSubmitReview} disabled={selectedRating === 0} style={{ ...styles.submitBtn, opacity: selectedRating === 0 ? 0.4 : 1, cursor: selectedRating === 0 ? "not-allowed" : "pointer" }}>Submit Review</button>
              <button onClick={() => setShowCompletion(false)} style={styles.skipBtn}>Skip for now</button>
            </div>
          </div>
        ) : (
          <div style={styles.completionInner}>
            <div style={styles.completionTop}>
              <span style={styles.completionEmoji}>⭐</span>
              <h2 style={styles.completionTitle}>Thanks for your review!</h2>
              <p style={styles.completionSub}>
                You rated <strong style={{ color: "#f5f2ec" }}>{course.title}</strong> {selectedRating} star{selectedRating !== 1 ? "s" : ""}.
                {reviewMessage && <span style={{ display: "block", marginTop: "0.5rem", fontStyle: "italic", color: "#6b7280" }}>"{reviewMessage}"</span>}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link to="/courses" style={styles.browseBtn} onClick={() => setShowCompletion(false)}>Browse More Courses →</Link>
              <button onClick={() => setShowCompletion(false)} style={styles.closeBtn}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#0c0c0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif" },
  topBar: { backgroundColor: "#111114", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0.875rem 1.5rem" },
  topBarInner: { maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem", flexWrap: "wrap" },
  backBtn: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
  topBarDivider: { color: "#374151" },
  topBarModule: { color: "#9ca3af", fontWeight: 400, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  topBarProgress: { display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 },
  topBarPct: { fontSize: "0.75rem", fontWeight: 700, color: "#d97706", minWidth: "2.5rem", textAlign: "right" },
  topBarBarWrap: { width: "100px", height: "4px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" },
  layout: { maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 53px)" },
  sidebar: { borderRight: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111114", overflowY: "auto" },
  sidebarHeader: { padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  progressHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" },
  sidebarLabel: { fontSize: "0.65rem", letterSpacing: "0.12em", color: "#4b5563", fontWeight: 700, textTransform: "uppercase", margin: 0 },
  progressPctBig: { fontSize: "0.85rem", fontWeight: 700, color: "#d97706" },
  progressBarWrap: { width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: "999px", overflow: "hidden", marginBottom: "0.5rem" },
  progressSub: { fontSize: "0.72rem", color: "#4b5563", margin: 0 },
  moduleGroup: { borderBottom: "1px solid rgba(255,255,255,0.04)" },
  moduleBtn: { width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1.25rem", border: "none", cursor: "pointer", textAlign: "left" },
  modNum: { fontFamily: "'Playfair Display', serif", fontSize: "1rem", minWidth: "1.75rem", fontWeight: 700 },
  modInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem", minWidth: 0 },
  modTitle: { fontSize: "0.85rem", color: "#d1cfc8", fontWeight: 500, display: "block" },
  modProgressRow: { display: "flex", alignItems: "center", gap: "0.5rem" },
  modProgressBarWrap: { flex: 1, height: "3px", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: "999px", overflow: "hidden" },
  modProgressFill: { height: "100%", borderRadius: "999px", transition: "width 0.5s ease" },
  modProgressText: { fontSize: "0.65rem", color: "#4b5563", flexShrink: 0 },
  modChevron: { fontSize: "0.6rem", color: "#6b7280", flexShrink: 0 },
  lessonDropdown: { borderTop: "1px solid rgba(255,255,255,0.03)" },
  lessonBtn: { width: "100%", display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.6rem 1.25rem 0.6rem 1.5rem", border: "none", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "left" },
  lessonDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, transition: "background-color 0.3s, box-shadow 0.3s" },
  lessonBtnText: { flex: 1, display: "flex", flexDirection: "column", gap: "1px" },
  lessonBtnTitle: { fontSize: "0.82rem", fontWeight: 500, transition: "color 0.2s" },
  lessonBtnDuration: { fontSize: "0.7rem", color: "#6b7280" },
  activeIndicator: { fontSize: "0.55rem", color: "#d97706", flexShrink: 0 },
  doneCheck: { fontSize: "0.7rem", color: "#22c55e", flexShrink: 0 },
  main: { padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0c0c0e" },
  lessonMeta: { display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" },
  lessonMetaDuration: { fontSize: "0.8rem", color: "#6b7280" },
  lessonMetaModule: { fontSize: "0.75rem", color: "#4b5563", backgroundColor: "rgba(255,255,255,0.04)", padding: "0.15rem 0.6rem", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.06)" },
  lessonDoneBadge: { fontSize: "0.72rem", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.08)", padding: "0.15rem 0.6rem", borderRadius: "999px", border: "1px solid rgba(34,197,94,0.2)" },
  lessonTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.2rem, 3vw, 1.6rem)", color: "#f5f2ec", margin: "0 0 1.5rem", lineHeight: 1.25 },
  contentCard: { backgroundColor: "#16161a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "1.5rem", marginBottom: "1.5rem" },
  contentLabel: { fontSize: "0.65rem", letterSpacing: "0.12em", color: "#d97706", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.75rem" },
  contentText: { color: "#9ca3af", lineHeight: 1.8, fontSize: "0.95rem", margin: 0 },
  markCompleteBtn: { display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1.25rem", backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "8px", color: "#22c55e", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", marginBottom: "1.5rem" },
  lessonNav: { display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "0.5rem" },
  navBtn: { padding: "0.7rem 1.25rem", backgroundColor: "#1a1a1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#d1cfc8", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.88rem", cursor: "pointer" },
  navBtnNext: { marginLeft: "auto", backgroundColor: "rgba(217,119,6,0.08)", borderColor: "rgba(217,119,6,0.3)", color: "#d97706" },
  selectPrompt: { height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#4b5563", fontSize: "0.95rem" },
  selectIcon: { fontSize: "2.5rem" },
  notFound: { minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#0c0c0e", gap: "1rem" },
  nfTitle: { fontFamily: "'Playfair Display', serif", color: "#f5f2ec", fontSize: "1.5rem" },
  backLink: { color: "#d97706", textDecoration: "none", fontWeight: 600 },
  completionInner: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  completionTop: { textAlign: "center" },
  completionEmoji: { fontSize: "3rem", display: "block", marginBottom: "0.75rem" },
  completionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#f5f2ec", margin: "0 0 0.5rem" },
  completionSub: { fontSize: "0.9rem", color: "#9ca3af", lineHeight: 1.6, margin: 0 },
  starsSection: { textAlign: "center" },
  starsLabel: { fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", fontWeight: 600, marginBottom: "0.75rem" },
  starsRow: { display: "flex", justifyContent: "center", gap: "0.15rem", marginBottom: "0.5rem" },
  ratingLabel: { fontSize: "0.82rem", color: "#d97706", fontWeight: 600, margin: 0 },
  messageSection: {},
  messageLabel: { fontSize: "0.82rem", color: "#d1cfc8", fontWeight: 600, marginBottom: "0.5rem" },
  optional: { color: "#4b5563", fontWeight: 400 },
  completionActions: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  submitBtn: { width: "100%", padding: "0.85rem", backgroundColor: "#d97706", color: "#0c0c0e", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.92rem", fontFamily: "'DM Sans', sans-serif" },
  skipBtn: { width: "100%", padding: "0.75rem", backgroundColor: "transparent", color: "#6b7280", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", cursor: "pointer" },
  browseBtn: { display: "block", textAlign: "center", padding: "0.85rem", backgroundColor: "#d97706", color: "#0c0c0e", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "0.92rem" },
  closeBtn: { width: "100%", padding: "0.75rem", backgroundColor: "transparent", color: "#6b7280", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", cursor: "pointer" },
};