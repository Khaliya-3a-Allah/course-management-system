import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPost } from "../utils/api";
import { readToken } from "../utils/authStorage";

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function getQuestionId(question) {
  return String(question.id || question._id || "");
}

function isMongoId(value) {
  return typeof value === "string" && /^[0-9a-f]{24}$/i.test(value);
}

export default function LessonQuiz({ lesson, onPassed, addToast }) {
  const quiz = lesson?.quiz;
  const lessonId = String(lesson?.id || lesson?._id || "");
  const canUseAssessmentApi = isMongoId(lessonId);
  const questions = useMemo(() => quiz?.questions || [], [quiz?.questions]);
  const token = readToken();
  const startedAtRef = useRef(new Date().toISOString());
  const submittedRef = useRef(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(60, Number(quiz?.timeLimitMinutes || 10) * 60)
  );
  const [antiCheat, setAntiCheat] = useState({
    blurCount: 0,
    pasteCount: 0,
    visibilityHiddenCount: 0,
  });

  useEffect(() => {
    setAnswers({});
    setResult(null);
    setHasStarted(false);
    submittedRef.current = false;
    startedAtRef.current = new Date().toISOString();
    setRemainingSeconds(Math.max(60, Number(quiz?.timeLimitMinutes || 10) * 60));
  }, [lesson?.id, quiz?.timeLimitMinutes]);

  useEffect(() => {
    if (!token || !canUseAssessmentApi || !quiz?.enabled) return;
    apiGet(`/assessments/lessons/${lessonId}/attempts`, { token })
      .then((response) => setAttempts(response?.data || response || []))
      .catch(() => {});
  }, [canUseAssessmentApi, lessonId, quiz?.enabled, token]);

  useEffect(() => {
    const onBlur = () => setAntiCheat((prev) => ({ ...prev, blurCount: prev.blurCount + 1 }));
    const onPaste = () => setAntiCheat((prev) => ({ ...prev, pasteCount: prev.pasteCount + 1 }));
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        setAntiCheat((prev) => ({
          ...prev,
          visibilityHiddenCount: prev.visibilityHiddenCount + 1,
        }));
      }
    };
    window.addEventListener("blur", onBlur);
    window.addEventListener("paste", onPaste);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("paste", onPaste);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const startQuiz = () => {
    setAnswers({});
    setResult(null);
    setHasStarted(true);
    submittedRef.current = false;
    startedAtRef.current = new Date().toISOString();
    setRemainingSeconds(Math.max(60, Number(quiz?.timeLimitMinutes || 10) * 60));
    setAntiCheat({
      blurCount: 0,
      pasteCount: 0,
      visibilityHiddenCount: 0,
    });
  };

  const submitQuiz = useCallback(async () => {
    if (submittedRef.current || loading) return;
    if (!canUseAssessmentApi) {
      addToast?.("This quiz is not ready yet. Save or refresh the course and try again.", "error");
      return;
    }
    submittedRef.current = true;
    setLoading(true);

    try {
      const response = await apiPost(
        `/assessments/lessons/${lessonId}/attempts`,
        {
          startedAt: startedAtRef.current,
          durationSeconds: Math.round(
            (Date.now() - new Date(startedAtRef.current).getTime()) / 1000
          ),
          answers: questions.map((question) => ({
            questionId: getQuestionId(question),
            selectedOptionIndex: answers[getQuestionId(question)] ?? null,
          })),
          antiCheat: {
            ...antiCheat,
            userAgent: navigator.userAgent,
          },
        },
        { token }
      );
      const data = response?.data || response;
      setResult(data);
      setAttempts((prev) => [data, ...prev]);
      if (data?.passed) {
        onPassed?.(lessonId);
      }
    } catch (error) {
      submittedRef.current = false;
      addToast?.(error.message || "Quiz submit failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, answers, antiCheat, canUseAssessmentApi, lessonId, loading, onPassed, questions, token]);

  useEffect(() => {
    if (!quiz?.enabled || !hasStarted || result) return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hasStarted, quiz?.enabled, result, submitQuiz]);

  if (!quiz?.enabled || questions.length === 0) return null;

  const attemptsUsed = attempts.length;
  const maxAttempts = Math.max(1, Number(quiz.maxAttempts || 1));
  const locked = attemptsUsed >= maxAttempts && !result;

  return (
    <section className="rounded-xl p-5 sm:p-6 mb-6 border border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.045)]">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <p className="text-[0.65rem] tracking-widest uppercase font-bold mb-2 text-brand">Assessment</p>
          <h2 className="font-heading text-text-primary text-[1.2rem] m-0">{quiz.title || "Lesson Quiz"}</h2>
          {quiz.instructions && <p className="text-[0.88rem] text-text-dim mt-2 mb-0">{quiz.instructions}</p>}
        </div>
        <div className="flex gap-2 flex-wrap sm:justify-end">
          <span className="px-3 py-1 rounded-md bg-base border border-[rgba(255,255,255,0.08)] text-[0.82rem] text-text-secondary">{formatTime(remainingSeconds)}</span>
          <span className="px-3 py-1 rounded-md bg-base border border-[rgba(255,255,255,0.08)] text-[0.82rem] text-text-secondary">Pass {quiz.passingScore || 70}%</span>
          <span className="px-3 py-1 rounded-md bg-base border border-[rgba(255,255,255,0.08)] text-[0.82rem] text-text-secondary">{attemptsUsed}/{maxAttempts} attempts</span>
        </div>
      </div>

      {locked ? (
        <div className="rounded-lg border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] p-4 text-[0.9rem] text-red-300">
          You have used all attempts for this quiz.
        </div>
      ) : !hasStarted && !result ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-surface p-4">
            <p className="text-[0.9rem] text-text-muted leading-relaxed m-0">
              This quiz has {questions.length} question{questions.length === 1 ? "" : "s"}. The timer starts after you click Start Quiz.
            </p>
          </div>
          <button
            type="button"
            className="self-start px-5 py-2.5 rounded-lg font-bold text-[0.9rem] cursor-pointer border-none bg-brand text-base disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={startQuiz}
            disabled={!canUseAssessmentApi}
          >
            Start Quiz
          </button>
          {!canUseAssessmentApi && (
            <p className="m-0 text-[0.82rem] text-text-dim">
              Save or refresh this course before taking the quiz.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((question, index) => {
            const questionId = getQuestionId(question);
            const review = result?.review?.find((item) => item.questionId === questionId);
            return (
              <div key={questionId || index} className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-surface p-4">
                <p className="text-[0.94rem] font-semibold text-text-primary mb-3">{index + 1}. {question.prompt}</p>
                <div className="grid gap-2">
                  {(question.options || []).map((option, optionIndex) => {
                    const selected = answers[questionId] === optionIndex;
                    const isCorrect = review?.correctOptionIndex === optionIndex;
                    const isWrongPick = review && selected && !isCorrect;
                    return (
                      <label
                        key={optionIndex}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 border text-[0.9rem] text-text-secondary ${
                          isCorrect
                            ? "border-[rgba(34,197,94,0.5)] bg-[rgba(34,197,94,0.08)]"
                            : isWrongPick
                              ? "border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.08)]"
                              : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-${lessonId}-${questionId}`}
                          checked={selected}
                          disabled={!!result || loading}
                          onChange={() => setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))}
                          className="accent-amber-600"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
                {review?.explanation && (
                  <p className="text-[0.82rem] text-text-dim mt-3 mb-0">{review.explanation}</p>
                )}
              </div>
            );
          })}

          {result ? (
            <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-base p-4">
              <p className="font-bold text-text-primary m-0">
                Score: {result.score}% {result.passed ? "Passed" : "Not passed"}
              </p>
              <p className="text-[0.86rem] text-text-dim mt-1 mb-0">
                {result.pointsAwarded}/{result.pointsPossible} points. {result.attemptsRemaining} attempts remaining.
              </p>
            </div>
          ) : (
            <button
              type="button"
              className="self-start px-5 py-2.5 rounded-lg font-bold text-[0.9rem] cursor-pointer border-none bg-brand text-base disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={submitQuiz}
              disabled={loading || questions.some((question) => answers[getQuestionId(question)] === undefined)}
            >
              {loading ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
