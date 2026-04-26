import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { apiPost } from "../utils/api";
import { CloseIcon } from "./Icons";

function SparkIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}

function SendIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

function courseIdSet(ids = []) {
  return new Set(ids.map((id) => String(id)));
}

function toCourseTitleList(courses, ids = []) {
  const idSet = courseIdSet(ids);
  return courses
    .filter((course) => idSet.has(String(course.id)))
    .map((course) => course.title)
    .filter(Boolean);
}

function getLocalHelpReply(content, currentUser) {
  const text = content.toLowerCase();

  if (/\b(password|reset|forgot|change password)\b/.test(text)) {
    return currentUser
      ? "To change your password: open [Dashboard](#/dashboard), choose Edit Profile, click Change Password, enter the email code, then set your new password."
      : "To reset a forgotten password: open [Login](#/login), click Forgot password?, enter your email, then use the email code to set a new password.";
  }

  if (/\b(certificate|certificates)\b/.test(text)) {
    return "Completed courses appear on [Certificates](#/certificates). If one is missing, reopen the final lesson and make sure every lesson is marked complete.";
  }

  if (/\b(profile|name|phone|bio|account)\b/.test(text)) {
    return currentUser
      ? "Open [Dashboard](#/dashboard), then use Edit Profile."
      : "Sign in at [Login](#/login), then open your dashboard to edit your profile.";
  }

  return "";
}

function pickRecommendedCourse(courses, currentUser, content) {
  const text = content.toLowerCase();
  const completedIds = courseIdSet(currentUser?.completedCourseIds);
  const enrolledIds = courseIdSet(currentUser?.enrolledCourseIds);
  const savedIds = courseIdSet(currentUser?.savedCourseIds);
  const completedCourses = courses.filter((course) => completedIds.has(String(course.id)));
  const unavailableIds = new Set([...completedIds, ...enrolledIds]);

  const wantsEasy = /\b(easy|beginner|start|simple)\b/.test(text);
  const wantsHard = /\b(hard|advanced|difficult|challenge)\b/.test(text);
  const preferredCategory = courses.find((course) =>
    course.category && text.includes(String(course.category).toLowerCase())
  )?.category;
  const completedCategory = completedCourses[completedCourses.length - 1]?.category;
  const targetCategory = preferredCategory || completedCategory;

  const scored = courses
    .filter((course) => !unavailableIds.has(String(course.id)))
    .map((course) => {
      let score = Number(course.rating || 0);
      if (savedIds.has(String(course.id))) score += 3;
      if (targetCategory && course.category === targetCategory) score += 4;
      if (wantsEasy && course.level === "Beginner") score += 5;
      if (wantsHard && course.level === "Advanced") score += 5;
      if (!wantsEasy && !wantsHard && completedCourses.length > 0 && course.level === "Intermediate") score += 2;
      if (Array.isArray(course.tags)) {
        score += course.tags.filter((tag) => text.includes(String(tag).toLowerCase())).length * 2;
      }
      return { course, score };
    })
    .sort((left, right) => right.score - left.score);

  return scored[0]?.course || courses.find((course) => !completedIds.has(String(course.id)));
}

function getLocalRecommendationReply(content, courses, currentUser) {
  const text = content.toLowerCase();
  const wantsRecommendation = /\b(recommend|suggest|what course|which course|take next|start with)\b/.test(text);
  if (!wantsRecommendation) return "";

  const hasLearningHistory = Boolean(
    currentUser?.completedCourseIds?.length ||
    currentUser?.enrolledCourseIds?.length ||
    currentUser?.savedCourseIds?.length
  );
  const hasPreference = /\b(easy|beginner|medium|intermediate|hard|advanced|web|react|design|data|business|marketing|javascript|python)\b/.test(text);

  if (!hasLearningHistory && !hasPreference) {
    return "What topic do you like, and do you want something easy, medium, or hard?";
  }

  const course = pickRecommendedCourse(courses, currentUser, content);
  if (!course) {
    return "I do not see an available course to recommend yet. Try browsing [Courses](#/courses).";
  }

  const reason = course.category
    ? `It matches ${course.category} and is ${course.level || "a good level"}`
    : `It is ${course.level || "a good"} next step`;

  return `I recommend [${course.title}](#/courses/${course.id}). ${reason}. Open it and check the modules first.`;
}

function renderLinkedText(text) {
  const parts = [];
  const linkPattern = /\[([^\]]+)\]\((#[^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <Link
        key={`${match[2]}-${match.index}`}
        to={match[2].replace(/^#/, "")}
        className="font-semibold text-brand-light underline decoration-brand-light/40 underline-offset-2 hover:text-brand"
      >
        {match[1]}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function buildStarterMessage(currentUser) {
  if (!currentUser) {
    return "Tell me what you like and whether you want easy, medium, or hard.";
  }

  const completedCount = currentUser.completedCourseIds?.length || 0;
  if (completedCount > 0) {
    return "Ask me what to take next based on your completed courses.";
  }

  return "Tell me what you like and whether you want easy, medium, or hard.";
}

function buildPreviewMessage(currentUser) {
  const firstName = String(currentUser?.name || currentUser?.email || "")
    .trim()
    .split(/\s+/)[0];
  return firstName
    ? `Hello ${firstName}, I am your AI assistant.`
    : "Hello, I am your AI assistant.";
}

export default function AiCourseChat() {
  const { courses, currentUser, getCourseProgress } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewLeaving, setIsPreviewLeaving] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content: "Hi, I can recommend your next course from this catalog.",
    },
  ]);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const hidePreview = useCallback(() => {
    setIsPreviewLeaving(true);
    window.setTimeout(() => {
      setShowPreview(false);
      setIsPreviewLeaving(false);
    }, 240);
  }, []);

  useEffect(() => {
    if (isOpen) return undefined;
    const timer = window.setTimeout(() => {
      setIsPreviewLeaving(false);
      setShowPreview(true);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!showPreview || isOpen) return undefined;
    const timer = window.setTimeout(hidePreview, 7000);
    return () => window.clearTimeout(timer);
  }, [hidePreview, isOpen, showPreview]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [isOpen, messages, isLoading]);

  const openChat = () => {
    setShowPreview(false);
    setIsPreviewLeaving(false);
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const learnerContext = useMemo(() => ({
    signedIn: Boolean(currentUser),
    completedCourses: toCourseTitleList(courses, currentUser?.completedCourseIds),
    enrolledCourses: toCourseTitleList(courses, currentUser?.enrolledCourseIds),
    savedCourses: toCourseTitleList(courses, currentUser?.savedCourseIds),
  }), [courses, currentUser]);

  const catalogContext = useMemo(() => {
    const purchasedIds = courseIdSet(currentUser?.purchasedCourseIds);
    const enrolledIds = courseIdSet(currentUser?.enrolledCourseIds);
    const completedIds = courseIdSet(currentUser?.completedCourseIds);
    const savedIds = courseIdSet(currentUser?.savedCourseIds);

    return courses.map((course) => {
      const id = String(course.id);
      let status = "available";
      if (completedIds.has(id)) status = "completed";
      else if (enrolledIds.has(id)) status = "enrolled";
      else if (savedIds.has(id)) status = "saved";
      else if (purchasedIds.has(id)) status = "purchased";

      return {
        id: course.id,
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration,
        rating: course.rating,
        price: course.price,
        salePrice: course.salePrice,
        saleEndsAt: course.saleEndsAt,
        tags: course.tags,
        status,
        progress: currentUser ? getCourseProgress(course.id) : 0,
      };
    });
  }, [courses, currentUser, getCourseProgress]);

  async function sendMessage(messageText = input) {
    const content = messageText.trim();
    if (!content || isLoading) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");

    const localReply = getLocalHelpReply(content, currentUser);
    if (localReply) {
      setMessages([...nextMessages, { role: "assistant", content: localReply }]);
      return;
    }

    const recommendationReply = getLocalRecommendationReply(content, courses, currentUser);
    if (recommendationReply) {
      setMessages([...nextMessages, { role: "assistant", content: recommendationReply }]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiPost("/ai/course-suggestions", {
        messages: nextMessages,
        learner: learnerContext,
        catalog: catalogContext,
      });
      const reply = response?.data?.reply || "I could not find a recommendation right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error?.message || "AI suggestions are unavailable right now. Please try again soon.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  return (
    <div className={`fixed inset-0 z-[999] pointer-events-none ${isOpen ? "flex items-center justify-center p-3 sm:block sm:p-0" : ""}`}>
      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close AI chat overlay"
            onClick={() => setIsOpen(false)}
            className="pointer-events-auto absolute inset-0 bg-black/55 backdrop-blur-[2px] sm:hidden"
          />
          <section
            className="ai-chat-panel pointer-events-auto relative flex h-[min(620px,calc(100dvh-1.5rem))] w-full max-w-[440px] flex-col overflow-hidden rounded-xl border border-[rgba(255,255,255,0.14)] bg-[#111114] shadow-[0_26px_80px_rgba(0,0,0,0.5)] ring-1 ring-brand/10 sm:fixed sm:bottom-5 sm:right-[92px] sm:h-[min(620px,calc(100vh-2.5rem))] sm:w-[390px]"
            aria-label="AI course recommendation chat"
          >
          <header className="flex min-h-[74px] items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.08)] bg-[#16161a] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand text-white shadow-[0_10px_24px_rgba(217,119,6,0.28)]">
                <SparkIcon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-[#f5f2ec]">Course AI</h2>
                <p className="text-xs leading-5 text-[#9ca3af]">{buildStarterMessage(currentUser)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#d1cfc8] transition hover:border-brand hover:text-brand"
              aria-label="Close AI chat"
              title="Close"
            >
              <CloseIcon size={17} />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] overflow-hidden whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-lg px-3 py-2 text-sm leading-6 shadow-sm sm:max-w-[86%] ${
                    message.role === "user"
                      ? "bg-brand text-white"
                      : "border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#e8e6e0]"
                  }`}
                >
                  {renderLinkedText(message.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <p className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[#9ca3af]">
                  Thinking...
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#111114] p-3">
            {!currentUser && (
              <p className="mb-3 rounded-md border border-brand/30 bg-brand/10 px-3 py-2 text-xs leading-5 text-[#e8e6e0]">
                <Link to="/login" className="font-semibold text-brand-light hover:text-brand">
                  Sign in
                </Link>{" "}
                for suggestions based on your real progress.
              </p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask what to take next..."
                rows={2}
                className="min-h-[52px] max-h-28 flex-1 resize-none rounded-md border border-[rgba(255,255,255,0.12)] bg-[#0c0c0e] px-3 py-2 text-sm leading-5 text-[#f5f2ec] outline-none placeholder:text-[#6b7280]"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-md bg-brand text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
                title="Send"
              >
                <SendIcon size={18} />
              </button>
            </div>
          </div>
        </section>
        </>
      )}

      {!isOpen && showPreview && (
        <button
          type="button"
          onClick={openChat}
          className={`ai-chat-preview pointer-events-auto fixed bottom-[76px] right-3 w-[min(270px,calc(100vw-5.25rem))] rounded-xl border border-[rgba(255,255,255,0.13)] bg-[#111114] px-3 py-2 text-left text-sm leading-5 text-[#f5f2ec] shadow-[0_18px_44px_rgba(0,0,0,0.3)] ring-1 ring-brand/10 transition hover:border-brand sm:bottom-[88px] sm:right-5 ${isPreviewLeaving ? "ai-chat-preview-leaving" : ""}`}
          aria-label="Open AI assistant"
        >
          <span className="mb-1 flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            Course AI
          </span>
          <span className="block break-words">{buildPreviewMessage(currentUser)}</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          setShowPreview(false);
          if (!isOpen) {
            setIsOpen(true);
          }
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`ai-chat-launcher pointer-events-auto fixed bottom-3 right-3 h-12 w-12 place-items-center rounded-xl bg-brand text-white transition hover:bg-brand-light sm:bottom-5 sm:right-5 sm:h-14 sm:w-14 ${isOpen ? "hidden sm:grid" : "grid"}`}
        aria-label={isOpen ? "Focus AI course chat" : "Open AI course chat"}
        title={isOpen ? "Course AI is open" : "Open Course AI"}
      >
        <SparkIcon size={22} />
      </button>
    </div>
  );
}
