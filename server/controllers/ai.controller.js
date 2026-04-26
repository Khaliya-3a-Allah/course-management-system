import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_MESSAGES = 8;
const MAX_COURSES = 24;

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
    title: compactText(course.title, 120),
    category: compactText(course.category, 80),
    level: compactText(course.level, 40),
    duration: compactText(course.duration, 40),
    rating: Number(course.rating || 0),
    price: Number(course.price || 0),
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
    "You are Coursewave's course recommendation assistant.",
    "Recommend courses only from the provided catalog. Use the learner's completed, enrolled, saved, and progress context.",
    "Be concise, practical, and friendly. Prefer 1-3 course suggestions with a short reason and next step.",
    "If the catalog context is thin, ask one targeted question instead of inventing unavailable courses.",
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

  const url = `${GEMINI_API_BASE}/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const geminiResponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 450,
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
