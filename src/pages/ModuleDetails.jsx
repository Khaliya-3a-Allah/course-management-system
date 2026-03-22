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
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-base gap-4">
        <h2 className="font-heading text-[1.5rem] text-text-primary">Course Not Found</h2>
        <Link to="/courses" className="no-underline font-semibold text-brand">← All Courses</Link>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-base gap-4">
        <h2 className="font-heading text-[1.5rem] text-text-primary">Module Not Found</h2>
        <Link to={`/courses/${courseId}`} className="no-underline font-semibold text-brand">← Back to Course</Link>
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
    <div
      className="min-h-screen bg-base text-[#e8e6e0] font-body"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.55s ease, transform 0.55s ease" }}
    >
      <style>{`
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
          .module-layout { grid-template-columns: 1fr !important; }
          .module-sidebar { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); max-height: 280px; overflow-y: auto; }
          .module-main { padding: 0.75rem !important; }
        }
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
      <header className="sticky top-0 z-10 border-b border-[rgba(255,255,255,0.06)] px-6 bg-sidebar">
        <div className="max-w-[1280px] mx-auto h-[53px] flex items-center gap-3 text-[0.85rem] flex-wrap">
          <Link to={`/courses/${courseId}`} className="no-underline font-semibold text-brand">← {course.title}</Link>
          <span className="text-[#374151]" aria-hidden="true">/</span>
          <span className="text-text-muted font-normal flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{module.title}</span>
          <div className="flex items-center gap-2.5 shrink-0" aria-label={`Progress: ${progressPct}%`}>
            <span className="text-[0.75rem] font-bold min-w-[2.5rem] text-right text-brand">{progressPct}%</span>
            <div className="w-[100px] h-1 rounded-full overflow-hidden bg-[rgba(255,255,255,0.08)]">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div
        className="module-layout max-w-[1280px] mx-auto grid"
        style={{ gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 53px)" }}
      >
        {/* Sidebar */}
        <aside
          className="module-sidebar border-r border-[rgba(255,255,255,0.06)] overflow-y-auto bg-sidebar"
          aria-label="Course content"
        >
          <div className="px-5 pt-5 pb-4 border-b border-[rgba(255,255,255,0.05)]">
            <div className="flex justify-between items-center mb-2.5">
              <p className="text-[0.65rem] tracking-widest uppercase font-bold text-text-faint m-0">Course Content</p>
              <span className="text-[0.85rem] font-bold text-brand">{progressPct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden mb-2 bg-[rgba(255,255,255,0.07)]">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-[0.72rem] text-text-faint m-0">{completedCount} of {totalLessons} lessons completed</p>
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
                <div key={mod.id} className="border-b border-[rgba(255,255,255,0.04)]">
                  <button
                    className={`w-full flex items-center gap-3 px-5 py-3.5 border-none cursor-pointer text-left${isCurrentModule ? " module-btn-active" : ""}`}
                    onClick={() => { toggleModule(mod.id); if (!isCurrentModule) navigate(`/courses/${courseId}/modules/${mod.id}`); }}
                    aria-expanded={isExpanded}
                    aria-controls={`mod-lessons-${mod.id}`}
                  >
                    <span
                      className="font-heading text-[1rem] min-w-[1.75rem] font-bold"
                      style={{ color: modComplete ? "#22c55e" : isCurrentModule ? "#d97706" : "rgba(217,119,6,0.3)" }}
                    >
                      {modComplete ? "✓" : String(modIdx + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <span className="text-[0.85rem] text-text-secondary font-medium">{mod.title}</span>
                      <span className="flex items-center gap-2">
                        <span className="flex-1 h-[3px] bg-[rgba(255,255,255,0.07)] rounded-full overflow-hidden">
                          <span
                            className="block h-full rounded-full transition-[width] duration-500"
                            style={{ width: `${modPct}%`, backgroundColor: modComplete ? "#22c55e" : "#d97706" }}
                          />
                        </span>
                        <span className="text-[0.65rem] text-text-faint shrink-0">{modDone}/{modTotal}</span>
                      </span>
                    </span>
                    <span className="text-[0.6rem] text-text-dim shrink-0" aria-hidden="true">{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {isExpanded && (
                    <div id={`mod-lessons-${mod.id}`} className="border-t border-[rgba(255,255,255,0.03)]">
                      {mod.lessons?.map((lesson) => {
                        const isActiveLesson = isCurrentModule && activeLesson?.id === lesson.id;
                        const isDone = completedLessons[lesson.id];
                        return (
                          <button
                            key={lesson.id}
                            className={`lesson-btn${isActiveLesson ? " active" : ""} w-full flex items-center gap-2.5 px-5 py-2.5 pl-6 border-none border-b border-[rgba(255,255,255,0.03)] cursor-pointer text-left`}
                            onClick={() => setActiveLesson(lesson)}
                            aria-pressed={isActiveLesson}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300"
                              style={{
                                backgroundColor: isDone ? "#22c55e" : isActiveLesson ? "#d97706" : "rgba(255,255,255,0.1)",
                                boxShadow: isActiveLesson && !isDone ? "0 0 0 2px rgba(217,119,6,0.3)" : "none",
                              }}
                            />
                            <span className="flex-1 flex flex-col gap-px">
                              <span
                                className="text-[0.82rem] font-medium"
                                style={{
                                  color: isDone ? "#6b7280" : isActiveLesson ? "#f5f2ec" : "#9ca3af",
                                  textDecoration: isDone ? "line-through" : "none",
                                }}
                              >
                                {lesson.title}
                              </span>
                              <span className="text-[0.7rem] text-text-dim">{lesson.duration}</span>
                            </span>
                            {isActiveLesson && !isDone && <span className="text-[0.55rem] text-brand shrink-0" aria-hidden="true">▶</span>}
                            {isDone && <span className="text-[0.7rem] text-[#22c55e] shrink-0" aria-label="Completed">✓</span>}
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
        <main className="module-main bg-base overflow-y-auto px-10 py-8">
          {activeLesson ? (
            <div key={activeLesson.id} style={{ animation: "fadeSlide 0.4s ease forwards" }}>
              <VideoPlayer
                src={activeLesson.videoUrl}
                title={activeLesson.title}
                moduleName={module.title}
                duration={activeLesson.duration}
              />

              {/* Lesson meta */}
              <div className="flex gap-3 mb-3 items-center flex-wrap">
                <span className="text-[0.8rem] text-text-dim">⏱ {activeLesson.duration}</span>
                <span className="text-[0.75rem] text-text-faint px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)]">
                  {module.title}
                </span>
                {completedLessons[activeLesson.id] && (
                  <span className="text-[0.72rem] font-semibold px-2.5 py-0.5 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] text-[#22c55e]">
                    ✓ Completed
                  </span>
                )}
              </div>

              <h1 className="font-heading text-text-primary mb-6 leading-snug" style={{ fontSize: "clamp(1.2rem, 3vw, 1.6rem)" }}>
                {activeLesson.title}
              </h1>

              <article className="rounded-xl p-6 mb-6 border border-[rgba(255,255,255,0.06)] bg-surface">
                <p className="text-[0.65rem] tracking-widest uppercase font-bold mb-3 text-brand">Lesson Preview</p>
                <p className="text-text-muted leading-[1.8] text-[0.95rem] m-0">
                  {activeLesson.contentPreview || "No preview content available."}
                </p>
              </article>

              {!completedLessons[activeLesson.id] && (
                <button
                  className="mark-complete-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-[0.85rem] cursor-pointer mb-6 border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.08)] text-[#22c55e]"
                  onClick={() => handleMarkComplete(activeLesson.id)}
                >
                  ✓ Mark as Complete
                </button>
              )}

              <nav className="flex justify-between gap-4 mt-2" aria-label="Lesson navigation">
                {(!isFirstLesson || prevModule) && (
                  <button
                    onClick={goToPrevLesson}
                    className="px-5 py-2.5 rounded-lg font-medium text-[0.88rem] cursor-pointer border border-[rgba(255,255,255,0.08)] bg-[#1a1a1e] text-text-secondary"
                  >
                    ← {isFirstLesson && prevModule ? "Prev Module" : "Prev Lesson"}
                  </button>
                )}
                {!isLastLesson ? (
                  <button onClick={goToNextLesson} className="px-5 py-2.5 rounded-lg font-medium text-[0.88rem] cursor-pointer border border-[rgba(217,119,6,0.3)] bg-[rgba(217,119,6,0.08)] text-brand ml-auto">
                    Next Lesson →
                  </button>
                ) : nextModule ? (
                  <button onClick={goToNextModule} className="px-5 py-2.5 rounded-lg font-medium text-[0.88rem] cursor-pointer border border-[rgba(217,119,6,0.3)] bg-[rgba(217,119,6,0.08)] text-brand ml-auto">
                    Next Module →
                  </button>
                ) : null}
              </nav>
            </div>
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-text-faint text-[0.95rem]">
              <span className="text-[2.5rem]" aria-hidden="true">📖</span>
              <p>Select a lesson from the sidebar to begin.</p>
            </div>
          )}
        </main>
      </div>

      {/* Completion Modal */}
      <Modal isOpen={showCompletion} onClose={() => setShowCompletion(false)} title="">
        {!submitted ? (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <span className="text-[3rem] block mb-3" aria-hidden="true">🎉</span>
              <h2 className="font-heading text-[1.5rem] text-text-primary mb-2">Course Complete!</h2>
              <p className="text-[0.9rem] text-text-muted leading-relaxed m-0">
                You've finished <strong className="text-text-primary">{course.title}</strong>.<br />Share how it went!
              </p>
            </div>
            <div className="text-center">
              <p className="text-[0.78rem] tracking-widest uppercase font-semibold text-text-dim mb-3">Your Rating</p>
              <div className="flex justify-center gap-1 mb-2" role="group" aria-label="Star rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="star-btn" onClick={() => setSelectedRating(star)} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} aria-label={`Rate ${star} stars`} aria-pressed={selectedRating === star}>
                    <span style={{ color: star <= (hoveredStar || selectedRating) ? "#f59e0b" : "#2d2d35", transition: "color 0.12s" }}>★</span>
                  </button>
                ))}
              </div>
              {selectedRating > 0 && <p className="text-[0.82rem] font-semibold m-0 text-brand">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][selectedRating]}</p>}
            </div>
            <div>
              <label htmlFor="completion-review" className="block text-[0.82rem] font-semibold text-text-secondary mb-2">
                Leave a review <span className="font-normal text-text-faint">(optional)</span>
              </label>
              <textarea id="completion-review" className="review-textarea" placeholder="What did you think of this course? What was most valuable?" value={reviewMessage} onChange={(e) => setReviewMessage(e.target.value)} rows={3} />
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                className="submit-btn w-full py-3.5 rounded-lg font-bold text-[0.92rem] border-none cursor-pointer bg-brand text-base disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleSubmitReview}
                disabled={selectedRating === 0}
                style={{ opacity: selectedRating === 0 ? 0.4 : 1, cursor: selectedRating === 0 ? "not-allowed" : "pointer" }}
              >
                Submit Review
              </button>
              <button onClick={() => setShowCompletion(false)} className="w-full py-3 rounded-lg text-[0.88rem] cursor-pointer border border-[rgba(255,255,255,0.07)] bg-transparent text-text-dim">
                Skip for now
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <span className="text-[3rem] block mb-3" aria-hidden="true">⭐</span>
              <h2 className="font-heading text-[1.5rem] text-text-primary mb-2">Thanks for your review!</h2>
              <p className="text-[0.9rem] text-text-muted leading-relaxed m-0">
                You rated <strong className="text-text-primary">{course.title}</strong> {selectedRating} star{selectedRating !== 1 ? "s" : ""}.
                {reviewMessage && <span className="block mt-2 italic text-text-dim">"{reviewMessage}"</span>}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/courses" onClick={() => setShowCompletion(false)} className="block text-center py-3.5 rounded-lg no-underline font-bold text-[0.92rem] bg-brand text-base">
                Browse More Courses →
              </Link>
              <button onClick={() => setShowCompletion(false)} className="w-full py-3 rounded-lg text-[0.88rem] cursor-pointer border border-[rgba(255,255,255,0.07)] bg-transparent text-text-dim">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}