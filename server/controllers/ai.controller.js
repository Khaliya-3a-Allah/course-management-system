import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_MESSAGES = 5;
const MAX_COURSES = 20;
const MAX_QUIZ_QUESTIONS = 5;

function normalizeModelName(modelName) {
  return String(modelName || "gemini-2.5-flash").replace(/^models\//, "");
}

function compactText(value, limit = 500) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function sanitizeMessages(messages = []) {
  return messages
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: compactText(message.content, 900),
    }))
    .filter((message) => message.content);
}

function sanitizeCatalog(catalog = []) {
  return catalog.slice(0, MAX_COURSES).map((course) => ({
    id: compactText(course.id, 80),
    title: compactText(course.title, 120),
    category: compactText(course.category, 80),
    level: compactText(course.level, 40),
    duration: compactText(course.duration, 40),
    rating: Number(course.rating || 0),
    price: Number(course.price || 0),
    salePrice: Number(course.salePrice || 0),
    saleEndsAt: compactText(course.saleEndsAt, 40),
    progress: Number(course.progress || 0),
    status: compactText(course.status, 40),
    tags: Array.isArray(course.tags)
      ? course.tags.slice(0, 6).map((tag) => compactText(tag, 40)).filter(Boolean)
      : [],
  }));
}

function buildPrompt({ messages, learner, catalog }) {
  const learnerSummary = {
    signedIn: Boolean(learner?.signedIn),
    completedCourses: Array.isArray(learner?.completedCourses)
      ? learner.completedCourses.map((name) => compactText(name, 120)).slice(0, 12)
      : [],
    enrolledCourses: Array.isArray(learner?.enrolledCourses)
      ? learner.enrolledCourses.map((name) => compactText(name, 120)).slice(0, 12)
      : [],
    savedCourses: Array.isArray(learner?.savedCourses)
      ? learner.savedCourses.map((name) => compactText(name, 120)).slice(0, 12)
      : [],
  };

  return [
    "You are Coursewave's concise learning assistant.",
    "Help with course recommendations and simple site navigation questions.",
    "Use only the provided catalog for course recommendations. Never invent courses.",
    "Reply in complete sentences. Never stop mid-sentence.",
    "Do not use greetings, filler, or motivational openings.",
    "For course recommendations, start with: I recommend [Course Title](#/courses/COURSE_ID).",
    "Then add one short reason. Optionally add one backup recommendation.",
    "Keep the whole reply under 70 words.",
    "Every recommended course must be a Markdown link exactly like [Course Title](#/courses/COURSE_ID).",
    "If the learner has no completed/enrolled/saved courses and asks what to take, ask one short question: what topic they like and whether they want easy, medium, or hard.",
    "For account help, keep it practical and point to pages: dashboard, support, login, certificates, courses.",
    "",
    `Learner context: ${JSON.stringify(learnerSummary)}`,
    `Course catalog: ${JSON.stringify(catalog)}`,
    "",
    "Conversation:",
    messages.map((message) => `${message.role}: ${message.content}`).join("\n"),
  ].join("\n");
}

function extractGeminiText(payload) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() || ""
  );
}

function parseJsonFromText(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced?.[1] || trimmed;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(source.slice(start, end + 1));
  } catch {
    return null;
  }
}

function sanitizeGeneratedQuiz(rawQuiz, lessonTitle) {
  const questions = Array.isArray(rawQuiz?.questions)
    ? rawQuiz.questions.slice(0, MAX_QUIZ_QUESTIONS)
    : [];

  const sanitizedQuestions = questions
    .map((question) => {
      const options = Array.isArray(question?.options)
        ? question.options.map((option) => compactText(option, 140)).filter(Boolean).slice(0, 4)
        : [];
      const correctOptionIndex = Number(question?.correctOptionIndex);
      if (!compactText(question?.prompt, 180) || options.length < 2) return null;
      return {
        prompt: compactText(question.prompt, 180),
        type: "multiple-choice",
        options,
        correctOptionIndex: Number.isInteger(correctOptionIndex)
          ? Math.max(0, Math.min(options.length - 1, correctOptionIndex))
          : 0,
        explanation: compactText(question.explanation, 220),
        points: 1,
      };
    })
    .filter(Boolean);

  if (!sanitizedQuestions.length) {
    throw new ApiError(502, "Gemini did not return usable quiz questions.");
  }

  return {
    enabled: true,
    title: compactText(rawQuiz?.title, 90) || `${compactText(lessonTitle, 70)} Quiz`,
    instructions: compactText(rawQuiz?.instructions, 160) || "Choose the best answer for each question.",
    timeLimitMinutes: Math.max(3, Math.min(30, Number(rawQuiz?.timeLimitMinutes || 8))),
    passingScore: Math.max(50, Math.min(100, Number(rawQuiz?.passingScore || 70))),
    maxAttempts: Math.max(1, Math.min(5, Number(rawQuiz?.maxAttempts || 3))),
    questions: sanitizedQuestions,
  };
}

export const getCourseSuggestion = asyncHandler(async (req, res) => {
  if (!env.GEMINI_API_KEY) {
    throw new ApiError(503, "AI suggestions are not configured yet.");
  }

  const messages = sanitizeMessages(req.body?.messages);
  if (!messages.length) {
    throw new ApiError(400, "Send at least one chat message.");
  }

  const catalog = sanitizeCatalog(req.body?.catalog);
  const prompt = buildPrompt({
    messages,
    learner: req.body?.learner || {},
    catalog,
  });

  const model = normalizeModelName(env.GEMINI_MODEL);
  const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const geminiResponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 320,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  });

  const payload = await geminiResponse.json().catch(() => null);

  if (!geminiResponse.ok) {
    throw new ApiError(
      geminiResponse.status,
      payload?.error?.message || "Gemini could not generate a suggestion right now."
    );
  }

  const reply = extractGeminiText(payload);
  if (!reply) {
    throw new ApiError(502, "Gemini returned an empty suggestion.");
  }

  res.status(200).json({ success: true, data: { reply } });
});

export const generateLessonQuiz = asyncHandler(async (req, res) => {
  if (!env.GEMINI_API_KEY) {
    throw new ApiError(503, "AI quiz generation is not configured yet.");
  }

  const lessonTitle = compactText(req.body?.lessonTitle, 140);
  const lessonPreview = compactText(req.body?.lessonPreview, 500);
  const difficulty = compactText(req.body?.difficulty, 40) || "medium";

  if (!lessonTitle) {
    throw new ApiError(400, "Lesson title is required.");
  }

  const prompt = [
    "Generate a short quiz for an online course lesson.",
    "Return only valid JSON. Do not include Markdown.",
    "Use this exact shape:",
    "{\"title\":\"string\",\"instructions\":\"string\",\"timeLimitMinutes\":8,\"passingScore\":70,\"maxAttempts\":3,\"questions\":[{\"prompt\":\"string\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctOptionIndex\":0,\"explanation\":\"string\"}]}",
    "Rules: create 4 multiple-choice questions, 4 options each, one correct answer per question, concise explanations.",
    "Keep wording beginner friendly unless difficulty says otherwise.",
    "",
    `Lesson title: ${lessonTitle}`,
    `Lesson preview: ${lessonPreview || "No preview provided."}`,
    `Difficulty: ${difficulty}`,
  ].join("\n");

  const model = normalizeModelName(env.GEMINI_MODEL);
  const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const geminiResponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 900,
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  });

  const payload = await geminiResponse.json().catch(() => null);

  if (!geminiResponse.ok) {
    throw new ApiError(
      geminiResponse.status,
      payload?.error?.message || "Gemini could not generate a quiz right now."
    );
  }

  const text = extractGeminiText(payload);
  const parsed = parseJsonFromText(text);
  if (!parsed) {
    throw new ApiError(502, "Gemini returned an invalid quiz format.");
  }

  res.status(200).json({
    success: true,
    data: {
      quiz: sanitizeGeneratedQuiz(parsed, lessonTitle),
    },
  });
});
