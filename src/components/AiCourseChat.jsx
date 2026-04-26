import { useMemo, useRef, useState } from "react";
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

function buildStarterMessage(currentUser) {
  if (!currentUser) {
    return "Tell me what you want to learn and I can suggest a good starting course.";
  }

  const completedCount = currentUser.completedCourseIds?.length || 0;
  if (completedCount > 0) {
    return "Ask me what to take next based on your completed courses.";
  }

  return "Ask me for a course recommendation based on your enrollments and saved courses.";
}

export default function AiCourseChat() {
  const { courses, currentUser, getCourseProgress } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content: "Hi, I can recommend your next course from this catalog.",
    },
  ]);
  const inputRef = useRef(null);

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
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration,
        rating: course.rating,
        price: course.price,
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
    <div className="fixed bottom-5 right-5 z-50 flex items-end">
      {isOpen && (
        <section
          className="mb-3 flex h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#111114] shadow-[0_26px_70px_rgba(0,0,0,0.36)]"
          aria-label="AI course recommendation chat"
        >
          <header className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[#16161a] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand text-white">
                <SparkIcon size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-[#f5f2ec]">Course AI</h2>
                <p className="truncate text-xs text-[#9ca3af]">{buildStarterMessage(currentUser)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[rgba(255,255,255,0.1)] text-[#d1cfc8] transition hover:border-brand hover:text-brand"
              aria-label="Close AI chat"
              title="Close"
            >
              <CloseIcon size={17} />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[86%] whitespace-pre-line rounded-lg px-3 py-2 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-brand text-white"
                      : "border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#e8e6e0]"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <p className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[#9ca3af]">
                  Thinking...
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[rgba(255,255,255,0.08)] p-3">
            {!currentUser && (
              <p className="mb-3 rounded-md border border-brand/30 bg-brand/10 px-3 py-2 text-xs text-[#e8e6e0]">
                <Link to="/login" className="font-semibold text-brand-light hover:text-brand">
                  Sign in
                </Link>{" "}
                for suggestions based on your real progress.
              </p>
            )}
            <div className="flex gap-2">
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
                className="min-h-[48px] flex-1 resize-none rounded-md border border-[rgba(255,255,255,0.12)] bg-[#0c0c0e] px-3 py-2 text-sm text-[#f5f2ec] outline-none placeholder:text-[#6b7280]"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-brand text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
                title="Send"
              >
                <SendIcon size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setIsOpen((value) => !value);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="grid h-14 w-14 place-items-center rounded-lg bg-brand text-white shadow-[0_18px_44px_rgba(217,119,6,0.32)] transition hover:bg-brand-light"
        aria-label={isOpen ? "Hide AI course chat" : "Open AI course chat"}
        title={isOpen ? "Hide Course AI" : "Open Course AI"}
      >
        <SparkIcon size={22} />
      </button>
    </div>
  );
}
