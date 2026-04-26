import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Modal from "../components/Modal";
import LessonQuiz from "../components/LessonQuiz";
import {
  CheckIcon, StarIcon, ChevronUpIcon, ChevronDownIcon,
  ArrowRightIcon, ArrowLeftIcon, PlayIcon, BookIcon,
  TrophyIcon, ClockIcon,
} from "../components/Icons";

// â”€â”€ SVG Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const IconPlay = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="#e8e6e0" aria-hidden="true" focusable="false"><polygon points="3,1 15,8 3,15"/></svg>
);
const IconPause = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="#e8e6e0" aria-hidden="true" focusable="false">
    <rect x="2" y="2" width="4" height="12" rx="1"/><rect x="10" y="2" width="4" height="12" rx="1"/>
  </svg>
);
const IconVolume = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#e8e6e0" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false">
    <polygon points="1,5 5,5 9,1 9,15 5,11 1,11" fill="#e8e6e0" stroke="none"/>
    <path d="M11 5.5a4 4 0 0 1 0 5"/><path d="M13 3.5a7 7 0 0 1 0 9"/>
  </svg>
);
const IconVolumeLow = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#e8e6e0" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false">
    <polygon points="1,5 5,5 9,1 9,15 5,11 1,11" fill="#e8e6e0" stroke="none"/>
    <path d="M11 5.5a4 4 0 0 1 0 5"/>
  </svg>
);
const IconMute = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#e8e6e0" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false">
    <polygon points="1,5 5,5 9,1 9,15 5,11 1,11" fill="#e8e6e0" stroke="none"/>
    <line x1="12" y1="5" x2="15" y2="11"/><line x1="15" y1="5" x2="12" y2="11"/>
  </svg>
);
const IconFullscreen = () => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#e8e6e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <polyline points="1,5 1,1 5,1"/><polyline points="11,1 15,1 15,5"/>
    <polyline points="15,11 15,15 11,15"/><polyline points="5,15 1,15 1,11"/>
  </svg>
);

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// â”€â”€ Custom Video Player â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      const frame = requestAnimationFrame(() => {
        setCurrentTime(0);
        setTotalDuration(0);
        setPlaying(false);
        setSpeed(1);
      });
      return () => cancelAnimationFrame(frame);
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
      <div className="vp-wrap" ref={wrapRef}>
        <div className="vp-overlay">
          <span className="vp-overlay-badge">{moduleName}</span>
          <span className="vp-overlay-title">{title}</span>
        </div>
        <div className="vp-no-video">
          <IconPlay />
          <p className="m-0 text-[1rem] text-[#4b5563]">No video available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="vp-wrap"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={handleTouchStart}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Video â€” native controls on mobile, hidden on desktop (custom controls used) */}
      <video
        ref={videoRef}
        className="vp-video"
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

      {/* â”€â”€ Desktop only below â”€â”€ */}

      {/* Title overlay */}
      <div className="vp-overlay">
        <span className="vp-overlay-badge">{moduleName}</span>
        <span className="vp-overlay-title">{title}</span>
      </div>

      {/* Big play button */}
      <button className="vp-big-play" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
        {playing
          ? <IconPause />
          : <svg width="28" height="28" viewBox="0 0 16 16" fill="#d97706" className="ml-1"><polygon points="3,1 15,8 3,15"/></svg>
        }
      </button>

      {/* Custom controls bar */}
      <div className={`vp-custom-controls ${showControls ? "opacity-100" : "opacity-0"}`}>
        {/* Seek bar */}
        <div
          className="vp-seek-bar"
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(totalDuration) || 0}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${fmt(currentTime)} of ${fmt(totalDuration)}`}
          onClick={handleSeek}
          onTouchEnd={handleSeek}
          onKeyDown={(e) => {
            if (!videoRef.current || !totalDuration) return;
            const step = totalDuration * 0.05;
            if (e.key === "ArrowRight") { videoRef.current.currentTime = Math.min(totalDuration, currentTime + step); e.preventDefault(); }
            if (e.key === "ArrowLeft") { videoRef.current.currentTime = Math.max(0, currentTime - step); e.preventDefault(); }
          }}
        >
          <div className="vp-track">
            <div className="vp-seek-fill" style={{ width: `${pct}%` }} />
            <div className="vp-seek-thumb" style={{ left: `calc(${pct}% - 8px)` }} />
          </div>
        </div>

        {/* Controls row */}
        <div className="vp-ctrl-row">
          {/* Left: play, time, volume */}
          <div className="flex items-center gap-1">
            <button className="vp-btn" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <IconPause /> : <IconPlay />}
            </button>
            <span className="vp-time">{fmt(currentTime)} / {fmt(totalDuration)}</span>
            <button className="vp-btn" onClick={toggleMute} aria-label={muted || volume === 0 ? "Unmute" : "Mute"}>
              {muted || volume === 0 ? <IconMute /> : volume < 0.5 ? <IconVolumeLow /> : <IconVolume />}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={handleVolume} className="vp-vol" aria-label="Volume" />
          </div>

          {/* Right: speed, duration, fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed selector */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                className="vp-speed-btn"
                onClick={() => setShowSpeed((v) => !v)}
                aria-label="Playback speed"
                aria-haspopup="listbox"
                aria-expanded={showSpeed}
              >
                {speed}x
              </button>
              {showSpeed && (
                <div className="vp-speed-dropdown">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      className={`vp-speed-item ${s === speed ? "vp-speed-item-active" : "vp-speed-item-idle"}`}
                      onClick={() => changeSpeed(s)}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="vp-duration inline-flex items-center gap-1"><ClockIcon size={12} /> {duration}</span>
            <button className="vp-btn" onClick={toggleFS} aria-label="Fullscreen">
              <IconFullscreen />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ModuleDetails() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { courses, coursesStatus, submitReview, currentUser, lessonProgress, markLessonComplete, completedCourses, addToast } = useAppContext();

  const course = courses.find((c) => c.id === courseId);
  const allModules = course?.modules || [];
  const currentModuleIndex = allModules.findIndex((m) => m.id === moduleId);
  const module = allModules[currentModuleIndex];

  const [lastModuleId, setLastModuleId] = useState(moduleId);
  const [activeLesson, setActiveLesson] = useState(() => module?.lessons?.[0] ?? null);
  const [expandedModules, setExpandedModules] = useState(() => module ? { [module.id]: true } : {});
  const [visible, setVisible] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionShown, setCompletionShown] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(() => currentUser?.reviews?.[courseId]?.rating ?? 0);
  const [reviewMessage, setReviewMessage] = useState(() => currentUser?.reviews?.[courseId]?.comment ?? "");
  const submitted = !!currentUser?.reviews?.[courseId];
  const [optimisticDone, setOptimisticDone] = useState({});
  const effectiveCompleted = { ...(lessonProgress[courseId] || {}), ...optimisticDone };

  // Reset active lesson and expand current module when navigating between modules.
  // Render-time setState is the React-recommended pattern for derived state on prop changes.
  if (lastModuleId !== moduleId) {
    setLastModuleId(moduleId);
    setActiveLesson(module?.lessons?.[0] ?? null);
    setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
  }

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!course) {
    if (coursesStatus === "loading") {
      return (
        <div className="min-h-[80vh] bg-base text-text-secondary p-4 sm:p-6 animate-pulse">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-6">
            <div className="h-[240px] rounded-xl bg-[rgba(255,255,255,0.05)]" />
            <div className="space-y-4">
              <div className="h-[320px] rounded-xl bg-[rgba(255,255,255,0.05)]" />
              <div className="h-[120px] rounded-xl bg-[rgba(255,255,255,0.05)]" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-base gap-4">
        <h2 className="font-heading text-[1.5rem] text-text-primary">Course Not Found</h2>
        <Link to="/courses" className="no-underline font-semibold text-brand inline-flex items-center gap-1.5"><ArrowLeftIcon size={14} /> All Courses</Link>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-base gap-4">
        <h2 className="font-heading text-[1.5rem] text-text-primary">Module Not Found</h2>
        <Link to={`/courses/${courseId}`} className="no-underline font-semibold text-brand inline-flex items-center gap-1.5"><ArrowLeftIcon size={14} /> Back to Course</Link>
      </div>
    );
  }

  const price = Number(course.price || 0);
  const isPaidCourse = price > 0;
  const isCreator = currentUser && (
    String(course.instructorId?._id || course.instructorId || "") === String(currentUser.id || "") ||
    (currentUser.createdCourseIds || []).includes(courseId)
  );
  const owned = !isPaidCourse || isCreator || (currentUser?.purchasedCourseIds?.includes(courseId) ?? false);
  const enrolled = currentUser?.enrolledCourseIds?.includes(courseId) ?? false;
  const isCompleted = completedCourses.has(courseId);
  const hasAccess = enrolled || isCompleted;

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-base gap-4 text-center px-6">
        <h2 className="font-heading text-[1.5rem] text-text-primary">Sign In Required</h2>
        <p className="text-text-dim m-0">You need to sign in to access course lessons.</p>
        <Link to="/login" className="no-underline font-semibold text-brand inline-flex items-center gap-1.5">Go to Login <ArrowRightIcon size={14} /></Link>
      </div>
    );
  }

  if (!owned) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-base gap-4 text-center px-6">
        <h2 className="font-heading text-[1.5rem] text-text-primary">Purchase Required</h2>
        <p className="text-text-dim m-0">Buy this course to unlock all modules and lessons.</p>
        <Link to={`/checkout/${courseId}`} className="no-underline font-semibold text-brand inline-flex items-center gap-1.5">Go to Checkout <ArrowRightIcon size={14} /></Link>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-base gap-4 text-center px-6">
        <h2 className="font-heading text-[1.5rem] text-text-primary">Enrollment Required</h2>
        <p className="text-text-dim m-0">Enroll in this course before opening lessons.</p>
        <Link to={`/courses/${courseId}`} className="no-underline font-semibold text-brand inline-flex items-center gap-1.5">Back to Course <ArrowRightIcon size={14} /></Link>
      </div>
    );
  }

  const totalLessons = allModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const completedCount = Object.keys(effectiveCompleted).filter((k) => effectiveCompleted[k]).length;
  const rawProgressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const progressPct = isCompleted && rawProgressPct === 0 ? 100 : rawProgressPct;

  const isModuleComplete = (mod) =>
    mod.lessons?.length > 0 && mod.lessons?.every((l) => effectiveCompleted[l.id]);

  const toggleModule = (modId) =>
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));

  const handleMarkComplete = async (lessonId) => {
    setOptimisticDone((prev) => ({ ...prev, [lessonId]: true }));
    try {
      await markLessonComplete(courseId, lessonId);
    } catch {
      setOptimisticDone((prev) => { const next = { ...prev }; delete next[lessonId]; return next; });
      addToast("Failed to mark lesson complete. Please try again.", "error");
      return;
    }
    const newCompleted = { ...effectiveCompleted, [lessonId]: true };
    const newCount = Object.keys(newCompleted).filter((k) => newCompleted[k]).length;
    const newPct = totalLessons > 0 ? Math.round((newCount / totalLessons) * 100) : 0;
    if (newPct === 100 && !completionShown && !completedCourses.has(courseId)) {
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

  const handleSubmitReview = async () => {
    if (selectedRating === 0) return;
    try {
      await submitReview(courseId, selectedRating, reviewMessage);
    } catch {
      addToast("Failed to submit review. Please try again.", "error");
    }
  };

  return (
    <div
      className={`min-h-screen bg-base text-text-secondary font-body transition-[opacity,transform] duration-[550ms] ease-in-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-10 border-b border-[rgba(255,255,255,0.06)] px-6 bg-sidebar">
        <div className="max-w-[1280px] mx-auto min-h-[53px] flex items-center gap-2 sm:gap-3 text-[0.8rem] sm:text-[0.85rem] flex-wrap py-2">
          <Link to={`/courses/${courseId}`} className="no-underline font-semibold text-brand inline-flex items-center gap-1.5"><ArrowLeftIcon size={14} /> {course.title}</Link>
          <span className="text-text-faint" aria-hidden="true">/</span>
          <span className="text-text-muted font-normal flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{module.title}</span>
          <div className="flex items-center gap-2.5 shrink-0" aria-label={`Progress: ${progressPct}%`}>
            <span className="text-[0.75rem] font-bold min-w-[2.5rem] text-right text-brand">{progressPct}%</span>
            <div className="w-16 sm:w-[100px] h-1 rounded-full overflow-hidden bg-[rgba(255,255,255,0.08)]">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="module-layout max-w-[1280px] mx-auto grid min-h-[calc(100vh-53px)] grid-cols-[300px_1fr]">
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
              const modDone = mod.lessons?.filter((l) => effectiveCompleted[l.id]).length || 0;
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
                      className={`font-heading text-[1rem] min-w-[1.75rem] font-bold ${
                        modComplete ? "text-[#22c55e]" : isCurrentModule ? "text-[#d97706]" : "text-[rgba(217,119,6,0.3)]"
                      }`}
                    >
                      {modComplete ? <CheckIcon size={16} /> : String(modIdx + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <span className="text-[0.85rem] text-text-secondary font-medium">{mod.title}</span>
                      <span className="flex items-center gap-2">
                        <span className="flex-1 h-[3px] bg-[rgba(255,255,255,0.07)] rounded-full overflow-hidden">
                          <span
                            className={`block h-full rounded-full transition-[width] duration-500 ${modComplete ? "bg-[#22c55e]" : "bg-[#d97706]"}`}
                            style={{ width: `${modPct}%` }}
                          />
                        </span>
                        <span className="text-[0.65rem] text-text-faint shrink-0">{modDone}/{modTotal}</span>
                      </span>
                    </span>
                    <span className="text-text-dim shrink-0" aria-hidden="true">{isExpanded ? <ChevronUpIcon size={13} /> : <ChevronDownIcon size={13} />}</span>
                  </button>

                  {isExpanded && (
                    <div id={`mod-lessons-${mod.id}`} className="border-t border-[rgba(255,255,255,0.03)]">
                      {mod.lessons?.map((lesson) => {
                        const isActiveLesson = isCurrentModule && activeLesson?.id === lesson.id;
                        const isDone = effectiveCompleted[lesson.id];
                        return (
                          <button
                            key={lesson.id}
                            className={`lesson-btn${isActiveLesson ? " active" : ""} w-full flex items-center gap-2.5 px-5 py-2.5 pl-6 border-none border-b border-[rgba(255,255,255,0.03)] cursor-pointer text-left`}
                            onClick={() => setActiveLesson(lesson)}
                            aria-pressed={isActiveLesson}
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300 ${
                                isDone
                                  ? "bg-[#22c55e]"
                                  : isActiveLesson
                                    ? "bg-[#d97706] shadow-[0_0_0_2px_rgba(217,119,6,0.3)]"
                                    : "bg-[rgba(255,255,255,0.1)]"
                              }`}
                            />
                            <span className="flex-1 flex flex-col gap-px">
                              <span
                                className={`text-[0.82rem] font-medium ${
                                  isDone
                                    ? "text-text-dim line-through"
                                    : isActiveLesson
                                      ? "text-text-primary"
                                      : "text-text-muted"
                                }`}
                              >
                                {lesson.title}
                              </span>
                              <span className="text-[0.7rem] text-text-dim">{lesson.duration}</span>
                            </span>
                            {isActiveLesson && !isDone && <span className="text-brand shrink-0" aria-hidden="true"><PlayIcon size={9} /></span>}
                            {isDone && <span className="text-[#22c55e] shrink-0" aria-label="Completed"><CheckIcon size={13} /></span>}
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
            <div key={activeLesson.id} className="animate-fade-slide">
              <VideoPlayer
                src={activeLesson.videoUrl}
                title={activeLesson.title}
                moduleName={module.title}
                duration={activeLesson.duration}
              />

              {/* Lesson meta */}
              <div className="flex gap-3 mb-3 items-center flex-wrap">
                <span className="text-[0.8rem] text-text-dim flex items-center gap-1"><ClockIcon size={13} /> {activeLesson.duration}</span>
                <span className="text-[0.75rem] text-text-faint px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)]">
                  {module.title}
                </span>
                {effectiveCompleted[activeLesson.id] && (
                  <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold px-2.5 py-0.5 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] text-[#22c55e]">
                    <CheckIcon size={11} /> Completed
                  </span>
                )}
              </div>

              <h1 className="font-heading text-text-primary mb-6 leading-snug text-[clamp(1.2rem,3vw,1.6rem)]">
                {activeLesson.title}
              </h1>

              <article className="rounded-xl p-6 mb-6 border border-[rgba(255,255,255,0.06)] bg-surface">
                <p className="text-[0.65rem] tracking-widest uppercase font-bold mb-3 text-brand">Lesson Preview</p>
                <p className="text-text-muted leading-[1.8] text-[0.95rem] m-0">
                  {activeLesson.contentPreview || "No preview content available."}
                </p>
              </article>

              <LessonQuiz lesson={activeLesson} onPassed={handleMarkComplete} addToast={addToast} />

              {effectiveCompleted[activeLesson.id] ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-[0.85rem] mb-6 border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.12)] text-[#22c55e]">
                  <CheckIcon size={16} /> Completed
                </div>
              ) : activeLesson.quiz?.enabled ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-[0.85rem] mb-6 border border-[rgba(217,119,6,0.25)] bg-[rgba(217,119,6,0.08)] text-brand">
                  Pass the quiz to complete this lesson
                </div>
              ) : (
                <button
                  className="mark-complete-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-[0.85rem] cursor-pointer mb-6 border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.08)] text-[#22c55e]"
                  onClick={() => handleMarkComplete(activeLesson.id)}
                >
                  <CheckIcon size={16} /> Mark as Complete
                </button>
              )}

              <nav className="flex justify-between gap-4 mt-2" aria-label="Lesson navigation">
                {(!isFirstLesson || prevModule) && (
                  <button
                    onClick={goToPrevLesson}
                    className="px-5 py-2.5 rounded-lg font-medium text-[0.88rem] cursor-pointer border border-[rgba(255,255,255,0.08)] bg-surface text-text-secondary"
                  >
                    <span className="inline-flex items-center gap-1.5"><ArrowLeftIcon size={14} />{isFirstLesson && prevModule ? "Prev Module" : "Prev Lesson"}</span>
                  </button>
                )}
                {!isLastLesson ? (
                  <button onClick={goToNextLesson} className="px-5 py-2.5 rounded-lg font-medium text-[0.88rem] cursor-pointer border border-[rgba(217,119,6,0.3)] bg-[rgba(217,119,6,0.08)] text-brand ml-auto">
                    <span className="inline-flex items-center gap-1.5">Next Lesson <ArrowRightIcon size={14} /></span>
                  </button>
                ) : nextModule ? (
                  <button onClick={goToNextModule} className="px-5 py-2.5 rounded-lg font-medium text-[0.88rem] cursor-pointer border border-[rgba(217,119,6,0.3)] bg-[rgba(217,119,6,0.08)] text-brand ml-auto">
                    <span className="inline-flex items-center gap-1.5">Next Module <ArrowRightIcon size={14} /></span>
                  </button>
                ) : null}
              </nav>
            </div>
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-text-faint text-[0.95rem]">
              <span className="text-text-faint" aria-hidden="true"><BookIcon size={40} /></span>
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
              <span className="text-brand block mb-3" aria-hidden="true"><TrophyIcon size={48} /></span>
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
                    <StarIcon size={28} filled={star <= (hoveredStar || selectedRating)} color={star <= (hoveredStar || selectedRating) ? "#f59e0b" : "#2d2d35"} />
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
                type="button"
                className="submit-btn w-full py-3.5 rounded-lg font-bold text-[0.92rem] border-none cursor-pointer bg-brand text-base disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleSubmitReview}
                disabled={selectedRating === 0}
              >
                Submit Review
              </button>
              <button type="button" onClick={() => setShowCompletion(false)} className="w-full py-3 rounded-lg text-[0.88rem] cursor-pointer border border-[rgba(255,255,255,0.07)] bg-transparent text-text-dim">
                Skip for now
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <span className="text-[0.75rem] tracking-[0.22em] uppercase text-text-faint block mb-3" aria-hidden="true">Review</span>
              <h2 className="font-heading text-[1.5rem] text-text-primary mb-2">Thanks for your review!</h2>
              <p className="text-[0.9rem] text-text-muted leading-relaxed m-0">
                You rated <strong className="text-text-primary">{course.title}</strong> {selectedRating} star{selectedRating !== 1 ? "s" : ""}.
                {reviewMessage && <span className="block mt-2 italic text-text-dim">"{reviewMessage}"</span>}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/courses" onClick={() => setShowCompletion(false)} className="block text-center py-3.5 rounded-lg no-underline font-bold text-[0.92rem] bg-brand text-base">
                <span className="inline-flex items-center gap-1.5">Browse More Courses <ArrowRightIcon size={14} /></span>
              </Link>
              <button type="button" onClick={() => setShowCompletion(false)} className="w-full py-3 rounded-lg text-[0.88rem] cursor-pointer border border-[rgba(255,255,255,0.07)] bg-transparent text-text-dim">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

