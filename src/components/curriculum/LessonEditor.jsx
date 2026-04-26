import FormField, { INPUT_CLASS, buildInputBorder } from "../FormField";
import { apiPost } from "../../utils/api";
import { readToken } from "../../utils/authStorage";
import { useState } from "react";

function makeQuestion() {
  return {
    id: `quiz-${crypto.randomUUID()}`,
    prompt: "",
    type: "multiple-choice",
    options: ["", ""],
    correctOptionIndex: 0,
    explanation: "",
    points: 1,
  };
}

function normalizeQuiz(quiz = {}) {
  return {
    enabled: Boolean(quiz.enabled),
    title: quiz.title || "",
    instructions: quiz.instructions || "",
    timeLimitMinutes: Number(quiz.timeLimitMinutes || 10),
    passingScore: Number(quiz.passingScore || 70),
    maxAttempts: Number(quiz.maxAttempts || 3),
    questions: Array.isArray(quiz.questions) ? quiz.questions : [],
  };
}

/**
 * Renders the form fields for a single lesson within a module.
 * All updates are immutable — each change returns a new lesson object.
 */
export default function LessonEditor({ lesson, lessonIndex, onUpdate, onRemove, errors = {} }) {
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizGenerationError, setQuizGenerationError] = useState("");

  const handleChange = (key, value) => {
    onUpdate({ ...lesson, [key]: value });
  };

  const quiz = normalizeQuiz(lesson.quiz);

  const updateQuiz = (patch) => {
    onUpdate({ ...lesson, quiz: { ...quiz, ...patch } });
  };

  const updateQuestion = (questionIndex, patch) => {
    const questions = quiz.questions.map((question, index) =>
      index === questionIndex ? { ...question, ...patch } : question
    );
    updateQuiz({ questions });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const question = quiz.questions[questionIndex];
    const options = (question.options || []).map((option, index) =>
      index === optionIndex ? value : option
    );
    updateQuestion(questionIndex, { options });
  };

  const generateQuiz = async () => {
    const token = readToken();
    setQuizGenerationError("");

    if (!lesson.title?.trim()) {
      setQuizGenerationError("Add a lesson title first.");
      return;
    }

    if (!token) {
      setQuizGenerationError("Sign in again before generating a quiz.");
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const response = await apiPost(
        "/ai/generate-quiz",
        {
          lessonTitle: lesson.title,
          lessonPreview: lesson.contentPreview || lesson.content || "",
          difficulty: quiz.passingScore >= 80 ? "hard" : quiz.passingScore <= 60 ? "easy" : "medium",
        },
        { token }
      );
      const generatedQuiz = response?.data?.quiz;
      if (!generatedQuiz) throw new Error("AI did not return a quiz.");
      onUpdate({ ...lesson, quiz: generatedQuiz });
    } catch (error) {
      setQuizGenerationError(error.message || "Quiz generation failed.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const label = `Lesson ${lessonIndex + 1}`;

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3"
      style={{
        backgroundColor: "#111114",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
      aria-label={`${label}: ${lesson.title || "Untitled"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[0.82rem] font-semibold text-text-secondary">
          {label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[0.78rem] font-medium cursor-pointer bg-transparent border-none rounded focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:outline-none"
          style={{ color: "#ef4444" }}
          aria-label={`Remove lesson ${lessonIndex + 1}`}
        >
          Remove
        </button>
      </div>

      {/* Title + Duration row */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Title *" htmlFor={`les-title-${lesson.id}`} error={errors.title}>
          <input
            id={`les-title-${lesson.id}`}
            value={lesson.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g. What is React?"
            aria-required="true"
            aria-invalid={!!errors.title}
            className={INPUT_CLASS}
            style={buildInputBorder(errors.title)}
          />
        </FormField>

        <FormField label="Duration *" htmlFor={`les-dur-${lesson.id}`} error={errors.duration}>
          <input
            id={`les-dur-${lesson.id}`}
            value={lesson.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
            placeholder="e.g. 8 min"
            aria-required="true"
            aria-invalid={!!errors.duration}
            className={INPUT_CLASS}
            style={buildInputBorder(errors.duration)}
          />
        </FormField>
      </div>

      {/* Content Preview */}
      <FormField label="Content Preview" htmlFor={`les-preview-${lesson.id}`} hint="Brief description of lesson content">
        <textarea
          id={`les-preview-${lesson.id}`}
          value={lesson.contentPreview}
          onChange={(e) => handleChange("contentPreview", e.target.value)}
          placeholder="Describe what students will learn in this lesson..."
          rows={2}
          className={`${INPUT_CLASS} resize-y`}
          style={{ ...buildInputBorder(false), minHeight: "60px" }}
        />
      </FormField>

      {/* Video URL */}
      <FormField label="Video URL" htmlFor={`les-video-${lesson.id}`} hint="Optional" error={errors.videoUrl}>
        <input
          id={`les-video-${lesson.id}`}
          value={lesson.videoUrl}
          onChange={(e) => handleChange("videoUrl", e.target.value)}
          placeholder="https://example.com/video.mp4"
          aria-invalid={!!errors.videoUrl}
          className={INPUT_CLASS}
          style={buildInputBorder(errors.videoUrl)}
        />
      </FormField>

      <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.025)] p-4 flex flex-col gap-3">
        <label className="flex items-center justify-between gap-3 text-[0.82rem] font-semibold text-text-secondary">
          <span>Lesson Quiz</span>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={generateQuiz}
              disabled={isGeneratingQuiz}
              className="text-[0.76rem] font-bold cursor-pointer rounded-md px-3 py-1.5 text-brand border border-[rgba(217,119,6,0.3)] bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingQuiz ? "Generating..." : "AI Generate"}
            </button>
            <input
              type="checkbox"
              checked={quiz.enabled}
              onChange={(e) => updateQuiz({ enabled: e.target.checked })}
              className="h-5 w-5 accent-amber-600"
              aria-label={`Enable quiz for ${lesson.title || label}`}
            />
          </span>
        </label>
        {quizGenerationError && (
          <p className="m-0 text-[0.8rem] text-red-400" role="alert">
            {quizGenerationError}
          </p>
        )}

        {quiz.enabled && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Quiz Title" htmlFor={`quiz-title-${lesson.id}`}>
                <input id={`quiz-title-${lesson.id}`} value={quiz.title} onChange={(e) => updateQuiz({ title: e.target.value })} placeholder="Quick check" className={INPUT_CLASS} style={buildInputBorder(false)} />
              </FormField>
              <FormField label="Time Limit" htmlFor={`quiz-time-${lesson.id}`}>
                <input id={`quiz-time-${lesson.id}`} type="number" min="1" max="240" value={quiz.timeLimitMinutes} onChange={(e) => updateQuiz({ timeLimitMinutes: Number(e.target.value) })} className={INPUT_CLASS} style={buildInputBorder(false)} />
              </FormField>
              <FormField label="Pass %" htmlFor={`quiz-pass-${lesson.id}`}>
                <input id={`quiz-pass-${lesson.id}`} type="number" min="1" max="100" value={quiz.passingScore} onChange={(e) => updateQuiz({ passingScore: Number(e.target.value) })} className={INPUT_CLASS} style={buildInputBorder(false)} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3">
              <FormField label="Instructions" htmlFor={`quiz-instructions-${lesson.id}`}>
                <input id={`quiz-instructions-${lesson.id}`} value={quiz.instructions} onChange={(e) => updateQuiz({ instructions: e.target.value })} placeholder="Answer all questions before the timer ends." className={INPUT_CLASS} style={buildInputBorder(false)} />
              </FormField>
              <FormField label="Max Attempts" htmlFor={`quiz-attempts-${lesson.id}`}>
                <input id={`quiz-attempts-${lesson.id}`} type="number" min="1" max="20" value={quiz.maxAttempts} onChange={(e) => updateQuiz({ maxAttempts: Number(e.target.value) })} className={INPUT_CLASS} style={buildInputBorder(false)} />
              </FormField>
            </div>

            {quiz.questions.map((question, questionIndex) => (
              <div key={question.id || question._id || questionIndex} className="rounded-lg bg-[#0d0d10] border border-[rgba(255,255,255,0.05)] p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.78rem] font-bold text-text-dim">Question {questionIndex + 1}</span>
                  <button type="button" className="text-[0.76rem] text-red-400 bg-transparent border-none cursor-pointer" onClick={() => updateQuiz({ questions: quiz.questions.filter((_, index) => index !== questionIndex) })}>
                    Remove
                  </button>
                </div>
                <FormField label="Prompt" htmlFor={`quiz-prompt-${lesson.id}-${questionIndex}`}>
                  <input id={`quiz-prompt-${lesson.id}-${questionIndex}`} value={question.prompt || ""} onChange={(e) => updateQuestion(questionIndex, { prompt: e.target.value })} placeholder="What should the learner know?" className={INPUT_CLASS} style={buildInputBorder(false)} />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                  <div className="flex flex-col gap-2">
                    {(question.options || ["", ""]).map((option, optionIndex) => (
                      <label key={optionIndex} className="grid grid-cols-[auto_1fr] items-center gap-2">
                        <input type="radio" name={`correct-${lesson.id}-${questionIndex}`} checked={Number(question.correctOptionIndex || 0) === optionIndex} onChange={() => updateQuestion(questionIndex, { correctOptionIndex: optionIndex })} className="accent-amber-600" />
                        <input value={option} onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)} placeholder={`Option ${optionIndex + 1}`} className={INPUT_CLASS} style={buildInputBorder(false)} />
                      </label>
                    ))}
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" className="text-[0.78rem] font-semibold text-brand bg-transparent border border-[rgba(217,119,6,0.3)] rounded-md px-3 py-1.5 cursor-pointer disabled:opacity-40" disabled={(question.options || []).length >= 6} onClick={() => updateQuestion(questionIndex, { options: [...(question.options || []), ""] })}>
                        + Option
                      </button>
                      <button type="button" className="text-[0.78rem] font-semibold text-text-dim bg-transparent border border-[rgba(255,255,255,0.08)] rounded-md px-3 py-1.5 cursor-pointer disabled:opacity-40" disabled={(question.options || []).length <= 2} onClick={() => updateQuestion(questionIndex, { options: (question.options || []).slice(0, -1), correctOptionIndex: Math.min(Number(question.correctOptionIndex || 0), (question.options || []).length - 2) })}>
                        - Option
                      </button>
                    </div>
                  </div>
                  <FormField label="Points" htmlFor={`quiz-points-${lesson.id}-${questionIndex}`}>
                    <input id={`quiz-points-${lesson.id}-${questionIndex}`} type="number" min="1" max="20" value={question.points || 1} onChange={(e) => updateQuestion(questionIndex, { points: Number(e.target.value) })} className={INPUT_CLASS} style={buildInputBorder(false)} />
                  </FormField>
                </div>
                <FormField label="Explanation" htmlFor={`quiz-explain-${lesson.id}-${questionIndex}`} hint="Shown after submission">
                  <input id={`quiz-explain-${lesson.id}-${questionIndex}`} value={question.explanation || ""} onChange={(e) => updateQuestion(questionIndex, { explanation: e.target.value })} placeholder="Why is the correct answer right?" className={INPUT_CLASS} style={buildInputBorder(false)} />
                </FormField>
              </div>
            ))}

            <button type="button" className="self-start text-[0.82rem] font-bold cursor-pointer bg-transparent rounded-lg px-4 py-2 text-brand border border-[rgba(217,119,6,0.3)]" onClick={() => updateQuiz({ questions: [...quiz.questions, makeQuestion()] })}>
              + Add Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
